import Foundation
import UIKit
import React

@objc class BlankAreaView: UIView {
    @objc(onInteractive)
    var onInteractive: RCTBubblingEventBlock?

    /// Get cell views from a given scroll view
    var cells: (UIScrollView) -> [UIView] = { _ in [] }
    /// A list can have other elements such as footer that need to be handled specially
    var shouldCheckRCTView = false

    private var observation: NSKeyValueObservation?
    private var scrollView: UIScrollView? {
        subviews.first?.subviews.first as? UIScrollView
    }
    private var isHorizontal: Bool {
        scrollView.map { $0.contentSize.width > $0.frame.width } ?? true
    }
    private var listSize: CGFloat {
        guard let scrollView = scrollView else { return 0 }
        return isHorizontal ? scrollView.frame.width : scrollView.frame.height
    }
    private var hasSentInteractiveEvent = false

    override func layoutSubviews() {
        super.layoutSubviews()
        guard
            observation == nil,
            let scrollView = scrollView
        else { return }
        observation = scrollView.observe(\.contentOffset, changeHandler: { [weak self] scrollView, _ in
            guard let self = self else { return }

            let (offsetStart, offsetEnd) = self.computeBlankFromGivenOffset(for: scrollView)

            if max(offsetStart, offsetEnd) == 0, !self.hasSentInteractiveEvent {
                self.hasSentInteractiveEvent = true
                self.onInteractive?(
                    ["timestamp": Date().timeIntervalSince1970 * 1000]
                )
            }

            BlankAreaEventEmitter.sharedInstance?.onBlankArea(
                offsetStart: offsetStart,
                offsetEnd: offsetEnd,
                listSize: self.listSize
            ) ?? assertionFailure("BlankAreaEventEmitter.sharedInstance was not initialized")
        })
    }

    private func computeBlankFromGivenOffset(for scrollView: UIScrollView) -> (CGFloat, CGFloat) {
        let cells = cells(scrollView)
            .sorted(by: { $1.frame.origin.y > $0.frame.origin.y })
        guard !cells.isEmpty else { return (0, 0) }

        let rawScrollOffset = isHorizontal ? scrollView.contentOffset.x : scrollView.contentOffset.y
        // Ignore reported blank spaces when we scroll above or below the list
        let scrollOffset = min(
            max(0, rawScrollOffset),
            (isHorizontal ? scrollView.contentSize.width : scrollView.contentSize.height) - listSize
        )

        guard
            let firstCell = cells.first(where: { isRenderedAndVisibleCell($0, scrollOffset: scrollOffset) }),
            let lastCell = cells.last(where: { isRenderedAndVisibleCell($0, scrollOffset: scrollOffset) })
        else {
            return (0, listSize)
        }
        let blankOffsetTop: CGFloat
        let blankOffsetBottom: CGFloat
        if isHorizontal {
            blankOffsetTop = firstCell.frame.minX - scrollOffset
            blankOffsetBottom = scrollOffset + listSize - lastCell.frame.maxX
        } else {
            blankOffsetTop = firstCell.frame.minY - scrollOffset
            blankOffsetBottom = scrollOffset + listSize - lastCell.frame.maxY
        }
        return (blankOffsetTop, blankOffsetBottom)
    }

    private func isRenderedAndVisibleCell(_ cell: UIView, scrollOffset: CGFloat) -> Bool {
        guard
            scrollViewContains(cell, scrollOffset: scrollOffset)
        else { return false }
        if shouldCheckRCTView && cell is RCTView {
            return true
        }
        return !cell.subviews.flatMap(\.subviews).isEmpty
    }

    private func scrollViewContains(
        _ cellView: UIView,
        scrollOffset: CGFloat
    ) -> Bool {
        let boundsStart = scrollOffset
        let boundsEnd = scrollOffset + listSize
        let cellFrame = cellView.frame

        if isHorizontal {
            return (cellFrame.minX >= boundsStart || cellFrame.maxX >= boundsStart) && (cellFrame.minX <= boundsEnd || cellFrame.maxX <= boundsEnd)
        } else {
            return (cellFrame.minY >= boundsStart || cellFrame.maxY >= boundsStart) && (cellFrame.minY <= boundsEnd || cellFrame.maxY <= boundsEnd)
        }
    }
}
