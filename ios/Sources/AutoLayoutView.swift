import Foundation
import UIKit


/// Container for all RecyclerListView children. This will automatically remove all gaps and overlaps for GridLayouts with flexible spans.
/// Note: This cannot work for masonry layouts i.e, pinterest like layout
@objc class AutoLayoutView: UIView {
    @objc(onBlankAreaEvent)
    var onBlankAreaEvent: RCTDirectEventBlock?

    @objc(onAutoLayout)
    var onAutoLayout: RCTDirectEventBlock?

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

    @objc func setEnableAutoLayoutInfo(_ enableAutoLayoutInfo: Bool) {
        self.enableAutoLayoutInfo = enableAutoLayoutInfo
    }

    @objc func setDisableAutoLayout(_ disableAutoLayout: Bool) {
        self.disableAutoLayout = disableAutoLayout
    }

    @objc func setAutoLayoutId(_ autoLayoutId: Int) {
        self.autoLayoutId = autoLayoutId
    }

    @objc func setPreservedIndex(_ preservedIndex: Int) {
        self.preservedIndex = preservedIndex
    }

    @objc func setRenderId(_ renderId: Int) {
	setNeedsLayout()
    }

    private var horizontal = false
    private var scrollOffset: CGFloat = 0
    private var windowSize: CGFloat = 0
    private var renderAheadOffset: CGFloat = 0
    private var enableInstrumentation = false
    private var enableAutoLayoutInfo = false
    private var disableAutoLayout = false
    private var preservedIndex = -1
    private var autoLayoutId = -1

    /// Tracks where the last pixel is drawn in the overall
    private var lastMaxBoundOverall: CGFloat = 0
    /// Tracks where the last pixel is drawn in the visible window
    private var lastMaxBound: CGFloat = 0
    /// Tracks where first pixel is drawn in the visible window
    private var lastMinBound: CGFloat = 0

    override func layoutSubviews() {
        super.layoutSubviews()
        fixLayout()

        guard enableInstrumentation, let scrollView = getScrollView() else { return }

        let scrollContainerSize = horizontal ? scrollView.frame.width : scrollView.frame.height
        let currentScrollOffset = horizontal ? scrollView.contentOffset.x : scrollView.contentOffset.y
        let startOffset = horizontal ? frame.minX : frame.minY
        let endOffset = horizontal ? frame.maxX : frame.maxY
        let distanceFromWindowStart = max(startOffset - currentScrollOffset, 0)
        let distanceFromWindowEnd = max(currentScrollOffset + scrollContainerSize - endOffset, 0)

        let (blankOffsetStart, blankOffsetEnd) = computeBlankFromGivenOffset(
            currentScrollOffset - startOffset,
            filledBoundMin: lastMinBound,
            filledBoundMax: lastMaxBound,
            renderAheadOffset: renderAheadOffset,
            windowSize: windowSize,
            distanceFromWindowStart: distanceFromWindowStart,
            distanceFromWindowEnd: distanceFromWindowEnd
        )

        onBlankAreaEvent?(
            [
                "offsetStart": blankOffsetStart,
                "offsetEnd": blankOffsetEnd,
            ]
        )
    }

    func getScrollView() -> UIScrollView? {
        return sequence(first: self, next: { $0.superview }).first(where: { $0 is UIScrollView }) as? UIScrollView
    }

    /// Sorts views by index and then invokes clearGaps which does the correction.
    /// Performance: Sort is needed. Given relatively low number of views in RecyclerListView render tree this should be a non issue.
    private func fixLayout() {
        guard
            subviews.count > 1,
            // Fixing layout during animation can interfere with it.
            layer.animationKeys()?.isEmpty ?? true,
            !disableAutoLayout
        else { return }
        let cellContainers = subviews
            .compactMap { subview -> CellContainer? in
                if let cellContainer = subview as? CellContainer {
                    return cellContainer
                } else {
                    assertionFailure("CellRendererComponent outer view should always be CellContainer. Learn more here: https://shopify.github.io/flash-list/docs/usage#cellrenderercomponent.")
                    return nil
                }
            }
            .sorted(by: { $0.index < $1.index })
        clearGaps(for: cellContainers)
        fixFooter()

	if enableAutoLayoutInfo {
            emitAutoLayout(for: cellContainers)
	}
    }

    /// Checks for overlaps or gaps between adjacent items and then applies a correction.
    /// Performance: RecyclerListView renders very small number of views and this is not going to trigger multiple layouts on the iOS side.
    private func clearGaps(for cellContainers: [CellContainer]) {
        var maxBound: CGFloat = 0
        var minBound: CGFloat = CGFloat(Int.max)
        var maxBoundNextCell: CGFloat = 0
        let correctedScrollOffset = scrollOffset - (horizontal ? frame.minX : frame.minY)
        lastMaxBoundOverall = 0

        var preservedOffset: Int = 0
        if preservedIndex > -1 {
            if preservedIndex <= cellContainers[0].index {
                preservedOffset = 0
            }
            else if preservedIndex >= cellContainers[cellContainers.count - 1].index {
                preservedOffset = cellContainers.count - 1
            }
            else {
                for index in 1..<(cellContainers.count - 1) {
                    if cellContainers[index].index == preservedIndex {
                        preservedOffset = index
                        break
                    }
                }
            }
        }

        if preservedOffset > 0 {
            for index in (1..<preservedOffset + 1).reversed() {
                let cellContainer = cellContainers[index]
                let cellTop = cellContainer.frame.minY

                let nextCell = cellContainers[index - 1]

                // Only apply correction if the next cell is consecutive.
                let isNextCellConsecutive = cellContainer.index == nextCell.index + 1

                if isNextCellConsecutive {
                    nextCell.frame.origin.y = cellTop - nextCell.frame.height
                }
            }
            // this implementation essentially ignores visibility; this will cause onBlankAreaEvent of preserveVisiblePosition
            // to be inconsistent with flash list without preserveVisiblePosition
            minBound = cellContainers[0].frame.minY
            maxBoundNextCell = cellContainers[preservedOffset].frame.maxY

            updateLastMaxBoundOverall(currentCell: cellContainers[0], nextCell: cellContainers[preservedOffset])
        }

        for index in preservedOffset..<(cellContainers.count - 1) {
            let cellContainer = cellContainers[index]
            let cellTop = cellContainer.frame.minY
            let cellBottom = cellContainer.frame.maxY
            let cellLeft = cellContainer.frame.minX
            let cellRight = cellContainer.frame.maxX

            let nextCell = cellContainers[index + 1]
            let nextCellTop = nextCell.frame.minY
            let nextCellLeft = nextCell.frame.minX

			// Only apply correction if the next cell is consecutive.
			let isNextCellConsecutive = nextCell.index == cellContainer.index + 1

            guard
                (preservedIndex > -1) ||
                isWithinBounds(
                    cellContainer,
                    scrollOffset: correctedScrollOffset,
                    renderAheadOffset: renderAheadOffset,
                    windowSize: windowSize,
                    isHorizontal: horizontal
                )
            else {
                updateLastMaxBoundOverall(currentCell: cellContainer, nextCell: nextCell)
                continue
            }
            let isNextCellVisible =
                (preservedIndex > -1) ||
                isWithinBounds(
                    nextCell,
                    scrollOffset: correctedScrollOffset,
                    renderAheadOffset: renderAheadOffset,
                    windowSize: windowSize,
                    isHorizontal: horizontal
                )

            if horizontal {
                maxBound = max(maxBound, cellRight)
                minBound = min(minBound, cellLeft)
                maxBoundNextCell = maxBound
				if isNextCellConsecutive {
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
				}
                if isNextCellVisible {
                    maxBoundNextCell = max(maxBound, nextCell.frame.maxX)
                }
            } else {
                maxBound = max(maxBound, cellBottom)
                minBound = min(minBound, cellTop)
                maxBoundNextCell = maxBound
				if isNextCellConsecutive {
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
                if isNextCellVisible {
                    maxBoundNextCell = max(maxBound, nextCell.frame.maxY)
                }
            }
            updateLastMaxBoundOverall(currentCell: cellContainer, nextCell: nextCell)
        }

        lastMaxBound = maxBoundNextCell
        lastMinBound = minBound
    }

    private func updateLastMaxBoundOverall(currentCell: CellContainer, nextCell: CellContainer) {
        lastMaxBoundOverall = max(lastMaxBoundOverall, horizontal ? currentCell.frame.maxX : currentCell.frame.maxY, horizontal ? nextCell.frame.maxX : nextCell.frame.maxY)
    }

    func computeBlankFromGivenOffset(
        _ actualScrollOffset: CGFloat,
        filledBoundMin: CGFloat,
        filledBoundMax: CGFloat,
        renderAheadOffset: CGFloat,
        windowSize: CGFloat,
        distanceFromWindowStart: CGFloat,
        distanceFromWindowEnd: CGFloat
    ) -> (
        offsetStart: CGFloat,
        offsetEnd: CGFloat
    ) {
        let blankOffsetStart = filledBoundMin - actualScrollOffset - distanceFromWindowStart

        let blankOffsetEnd = actualScrollOffset + windowSize - renderAheadOffset - filledBoundMax - distanceFromWindowEnd

        return (blankOffsetStart, blankOffsetEnd)
    }

    /// It's important to avoid correcting views outside the render window. An item that isn't being recycled might still remain in the view tree. If views outside get considered then gaps between unused items will cause algorithm to fail.
    /// However, when the preservedIndex is in effect, isWithinBounds should not be considered. The preserveVisiblePosition algorithm works fine regardless of bounds; conversely, if only the items within bounds are considered, since the scrollOffset here can be badly out of date, overlapped items may be shown; if items are excluded by isWithinBounds, incorrect offsets of items may also be passed in onAutoLayout events.
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

    /// Fixes footer position along with rest of the items
    private func fixFooter() {
        guard !disableAutoLayout, let parentScrollView = getScrollView() else {
            return
        }

        let isAutoLayoutEndVisible = horizontal ? frame.maxX <= parentScrollView.frame.width : frame.maxY <= parentScrollView.frame.height
        guard isAutoLayoutEndVisible, let footer = footer() else {
            return
        }

        let diff = footerDiff()
        guard diff != 0 else { return }

        if horizontal {
            footer.frame.origin.x += diff
            frame.size.width += diff
            superview?.frame.size.width += diff
        } else {
            footer.frame.origin.y += diff
            frame.size.height += diff
            superview?.frame.size.height += diff
        }
    }

    private func footerDiff() -> CGFloat {
        if subviews.count == 0 {
            lastMaxBoundOverall = 0
        } else if subviews.count == 1 {
            let firstChild = subviews[0]
            lastMaxBoundOverall = horizontal ? firstChild.frame.maxX : firstChild.frame.maxY
        }
        let autoLayoutEnd = horizontal ? frame.width : frame.height
        return lastMaxBoundOverall - autoLayoutEnd
    }

    private func footer() -> UIView? {
        return superview?.subviews.first(where:{($0 as? CellContainer)?.index == -1})
    }

    private func emitAutoLayout(for cellContainers: [CellContainer]) {
	let autoRenderedLayouts: [String: Any] = [
	    "autoLayoutId": autoLayoutId,
	    "layouts": cellContainers.map { 
	        [ "key": $0.index, "y": $0.frame.origin.y, "height": $0.frame.height ]
	    },
	] 

        onAutoLayout?(autoRenderedLayouts)
    }
}
