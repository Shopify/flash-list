import Foundation
import UIKit


/// Container for all RecyclerListView children. This will automatically remove all gaps and overlaps for GridLayouts with flexible spans.
/// Note: This cannot work for masonry layouts i.e, pinterest like layout
@objc class AutoLayoutView: UIView {
    private var horizontal = false
    private var scrollOffset: CGFloat = 0
    private var windowSize: CGFloat = 0
    private var renderAheadOffset: CGFloat = 0
    private var enableInstrumentation = false

    /// Tracks where the last pixel is drawn in the visible window
    private var lastMaxBound: CGFloat = 0
    /// Tracks where first pixel is drawn in the visible window
    private var lastMinBound: CGFloat = 0

    @objc func setHorizontal(_ horizontal: Bool) {
        self.horizontal = horizontal
    }

    @objc func setScrollOffset(_ scrollOffset: Int) {
        self.scrollOffset = CGFloat(scrollOffset)
    }

    @objc func setWindowSize(_ windowSize: Int) {
        self.windowSize = CGFloat(windowSize)
    }

    @objc func setRenderAheadOffset(_ renderAheadOffset: Int) {
        self.renderAheadOffset = CGFloat(renderAheadOffset)
    }

    @objc func setEnableInstrumentation(_ enableInstrumentation: Bool) {
        self.enableInstrumentation = enableInstrumentation
    }

    override func layoutSubviews() {
        fixLayout()
        super.layoutSubviews()

        let scrollView = sequence(first: self, next: { $0.superview }).first(where: { $0 is UIScrollView })
        guard enableInstrumentation, let scrollView = scrollView as? UIScrollView else { return }
        let (blankOffsetStart, blankOffsetEnd) = computeBlankFromGivenOffset(
            horizontal ? scrollView.contentOffset.x : scrollView.contentOffset.y,
            filledBoundMin: lastMinBound,
            filledBoundMax: lastMaxBound,
            renderAheadOffset: renderAheadOffset,
            windowSize: windowSize
        )

        BlankAreaEventEmitter
            .sharedInstance?
            .onBlankArea(
                offsetStart: blankOffsetStart,
                offsetEnd: blankOffsetEnd,
                listSize: windowSize
            )
        ?? assertionFailure("BlankAreaEventEmitter.sharedInstance was not initialized")
    }

    /// Sorts views by index and then invokes clearGaps which does the correction.
    /// Performance: Sort is needed. Given relatively low number of views in RecyclerListView render tree this should be a non issue.
    private func fixLayout() {
        guard subviews.count > 1 else { return }
        let cellContainers = subviews
            .compactMap { $0 as? CellContainer }
            .sorted(by: { $0.index < $1.index })

        clearGaps(for: cellContainers)
    }

    /// Checks for overlaps or gaps between adjacent items and then applies a correction.
    /// Performance: RecyclerListView renders very small number of views and this is not going to trigger multiple layouts on the iOS side.
    private func clearGaps(for cellContainers: [CellContainer]) {
        var maxBound: CGFloat = 0
        var minBound: CGFloat = CGFloat(Int.max)

        cellContainers.indices.dropLast().forEach { index in
            let cellContainer = cellContainers[index]
            let cellTop = cellContainer.frame.minY
            let cellBottom = cellContainer.frame.maxY
            let cellLeft = cellContainer.frame.minX
            let cellRight = cellContainer.frame.maxX

            let nextCell = cellContainers[index + 1]
            let nextCellTop = nextCell.frame.minY
            let nextCellLeft = nextCell.frame.minX

            guard
                isWithinBounds(
                    cellContainer,
                    scrollOffset: scrollOffset,
                    renderAheadOffset: renderAheadOffset,
                    windowSize: windowSize,
                    isHorizontal: horizontal
                )
            else { return }

            if horizontal {
                maxBound = max(maxBound, cellRight)
                minBound = min(minBound, cellLeft)

                if cellTop < nextCellTop {
                    if cellBottom != nextCellTop {
                        nextCell.frame.origin.y = cellBottom
                    }
                    if cellLeft != nextCellLeft {
                        nextCell.frame.origin.x = cellLeft
                    }
                } else {
                    nextCell.frame.origin.x = maxBound
                }
            } else {
                maxBound = max(maxBound, cellBottom)
                minBound = min(minBound, cellTop)

                if cellLeft < nextCellLeft {
                    if cellRight != nextCellLeft {
                        nextCell.frame.origin.x = cellRight
                    }
                    if cellTop != nextCellTop {
                        nextCell.frame.origin.y = cellTop
                    }
                } else {
                    nextCell.frame.origin.y = maxBound
                }
            }
        }

        lastMaxBound = maxBound
        lastMinBound = minBound
    }

    func computeBlankFromGivenOffset(
        _ actualScrollOffset: CGFloat,
        filledBoundMin: CGFloat,
        filledBoundMax: CGFloat,
        renderAheadOffset: CGFloat,
        windowSize: CGFloat
    ) -> (
        offsetStart: CGFloat,
        offsetEnd: CGFloat
    ) {
        let blankOffsetStart = filledBoundMin - actualScrollOffset

        let blankOffsetEnd = actualScrollOffset + windowSize - renderAheadOffset - filledBoundMax

        return (blankOffsetStart, blankOffsetEnd)
    }

    /// It's important to avoid correcting views outside the render window. An item that isn't being recycled might still remain in the view tree. If views outside get considered then gaps between unused items will cause algorithm to fail.
    func isWithinBounds(
        _ cellContainer: CellContainer,
        scrollOffset: CGFloat,
        renderAheadOffset: CGFloat,
        windowSize: CGFloat,
        isHorizontal: Bool
    ) -> Bool {
        let boundsStart = scrollOffset - renderAheadOffset
        let boundsEnd = scrollOffset + windowSize
        let cellFrame = cellContainer.frame

        if isHorizontal {
            return (cellFrame.minX >= boundsStart || cellFrame.maxX >= boundsStart) && (cellFrame.minX <= boundsEnd || cellFrame.maxX <= boundsEnd)
        } else {
            return (cellFrame.minY >= boundsStart || cellFrame.maxY >= boundsStart) && (cellFrame.minY <= boundsEnd || cellFrame.maxY <= boundsEnd)
        }
    }
}
