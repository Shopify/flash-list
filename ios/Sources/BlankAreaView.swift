import Foundation
import UIKit
import React


/*
 Container for all RecyclerListView children. This will automatically remove all gaps and overlaps for GridLayouts with flexible spans.
 Note: This cannot work for masonry layouts i.e, pinterest like layout
 */
@objc class BlankAreaView: UIView {
    // private var horizontal = false
    // private var scrollOffset: CGFloat = 0
    // private var windowSize: CGFloat = 0
    // private var renderAheadOffset: CGFloat = 0
    // private var enableInstrumentation = false
    
    // var blankOffsetTop: CGFloat = 0 // Tracks blank area from the top
    // var blankOffsetBottom: CGFloat = 0 // Tracks blank area from the bottom
    
    // private var lastMaxBound: CGFloat = 0 // Tracks where the last pixel is drawn in the visible window
    // private var lastMinBound: CGFloat = 0 // Tracks where first pixel is drawn in the visible window
    
    // @objc func setHorizontal(_ horizontal: Bool) {
    //     self.horizontal = horizontal
    // }
    
    // @objc func setScrollOffset(_ scrollOffset: Int) {
    //     self.scrollOffset = CGFloat(scrollOffset)
    // }
    
    // @objc func setWindowSize(_ windowSize: Int) {
    //     self.windowSize = CGFloat(windowSize)
    // }
    
    // @objc func setRenderAheadOffset(_ renderAheadOffset: Int) {
    //     self.renderAheadOffset = CGFloat(renderAheadOffset)
    // }
    
    // @objc func setEnableInstrumentation(_ enableInstrumentation: Bool) {
    //     self.enableInstrumentation = enableInstrumentation
    // }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    @available(*, unavailable)
    public required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
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
        let blankArea = max(0, blankOffsetTop, blankOffsetBottom)
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
