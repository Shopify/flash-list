import Foundation
import UIKit
import React


@objc class BlankAreaView: UIView {
    private var observation: NSKeyValueObservation?
    private var didSet = false

    override func layoutSubviews() {
        super.layoutSubviews()
        guard
            !didSet,
            let scrollView = subviews.first?.subviews.first as? UIScrollView
        else { return }
        observation = scrollView.observe(\.contentOffset, changeHandler: { [weak self] scrollView, _ in
            guard let self = self else { return }

            let (startOffset, endOffset, blankArea) = self.computeBlankFromGivenOffset(for: scrollView)

            BlankAreaEventEmitter.INSTANCE?.onBlankArea(
                startOffset: startOffset,
                endOffset: endOffset,
                blankArea: blankArea,
                listSize: scrollView.frame.height
            ) ?? assertionFailure("BlankAreaEventEmitter.INSTANCE was not initialized")
        })
        didSet = true
    }

    func computeBlankFromGivenOffset(for scrollView: UIScrollView) -> (CGFloat, CGFloat, CGFloat) {
        let cells = scrollView.subviews.first(where: { $0 is RCTScrollContentView })?.subviews ?? []
        guard !cells.isEmpty else { return (0, 0, 0) }

        guard
            let firstCell = cells.first(where: { scrollViewContains($0, scrollOffset: scrollView.contentOffset.y) && !$0.subviews.flatMap(\.subviews).isEmpty }),
            let lastCell = cells.last(where: { scrollViewContains($0, scrollOffset: scrollView.contentOffset.y) && !$0.subviews.flatMap(\.subviews).isEmpty })
        else {
            return (scrollView.frame.height, scrollView.frame.height, scrollView.frame.height)
        }
        let blankOffsetTop = firstCell.frame.minY - scrollView.contentOffset.y
        let blankOffsetBottom = scrollView.contentOffset.y + scrollView.frame.height - lastCell.frame.maxY
        let blankArea = max(blankOffsetTop, blankOffsetBottom)
        return (blankOffsetTop, blankOffsetBottom, blankArea)
    }

    func scrollViewContains(
        _ cellView: UIView,
        scrollOffset: CGFloat
    ) -> Bool {
        let scrollView = subviews.first!.subviews.first! as! UIScrollView
        let boundsStart = scrollOffset
        let boundsEnd = scrollOffset + scrollView.frame.height
        let cellFrame = cellView.frame

        let isHorizontal = scrollView.contentSize.width > scrollView.frame.width
        if isHorizontal {
            return (cellFrame.minX >= boundsStart || cellFrame.maxX >= boundsStart) && (cellFrame.minX <= boundsEnd || cellFrame.maxX <= boundsEnd)
        } else {
            return (cellFrame.minY >= boundsStart || cellFrame.maxY >= boundsStart) && (cellFrame.minY <= boundsEnd || cellFrame.maxY <= boundsEnd)
        }
    }
}
