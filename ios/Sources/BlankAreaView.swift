import Foundation
import UIKit
import React

@objc class BlankAreaView: UIView {
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

    @objc(onInteractive)
    var onInteractive: RCTBubblingEventBlock?
    
    var cells: (UIScrollView) -> [UIView] = { _ in [] }

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
                self.onInteractive?([:])
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

        let scrollOffset = isHorizontal ? scrollView.contentOffset.x : scrollView.contentOffset.y
        guard
            let firstCell = cells.first(where: { scrollViewContains($0, scrollOffset: scrollOffset) && !$0.subviews.flatMap(\.subviews).isEmpty }),
            let lastCell = cells.last(where: { scrollViewContains($0, scrollOffset: scrollOffset) && !$0.subviews.flatMap(\.subviews).isEmpty })
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
