import Foundation
import UIKit


/*
 Container for all RecyclerListView children. This will automatically remove all gaps and overlaps for GridLayouts with flexible spans.
 Note: This cannot work for masonry layouts i.e, pinterest like layout
*/
@objc class AutoLayoutView: UIView {
    private var horizontal = false
    private var scrollOffset: CGFloat = 0
    private var windowSize: CGFloat = 0
    private var renderAheadOffset: CGFloat = 0
    private var enableInstrumentation = false
    
    var blankOffsetTop: CGFloat = 0 // Tracks blank area from the top
    var blankOffsetBottom: CGFloat = 0 // Tracks blank area from the bottom

    private var lastMaxBound: CGFloat = 0 // Tracks where the last pixel is drawn in the visible window
    private var lastMinBound: CGFloat = 0 // Tracks where first pixel is drawn in the visible window
    
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
        
        print("Scroll offset JS: \(scrollOffset)")
        
        if enableInstrumentation {
            // bruh
            if let scrollView = superview?.superview?.superview as? UIScrollView {
                let scrollY = scrollView.contentOffset.y
                print("Scroll offset Native: \(scrollY)")
                
                let blank = computeBlankFromGivenOffset(scrollY)
                print("Blank offset: \(blank)")
                
                BlankAreaEventEmitter.INSTANCE?.onBlankArea(offset: blank) ?? assertionFailure("BlankAreaEventEmitter.INSTANCE was not initialized")
            }
        }
    }
    
    /*
     Sorts views by index and then invokes clearGaps which does the correction.
     Performance: Sort is needed. Given relatively low number of views in RecyclerListView render tree this should be a non issue.
    */
    private func fixLayout() {
        guard subviews.count > 1 else { return }
        let cellContainers = subviews
            .compactMap { $0 as? CellContainer }
            .sorted(by: { $0.index < $1.index })
        
        clearGaps(for: cellContainers)
    }
    
    /*
     Checks for overlaps or gaps between adjacent items and then applies a correction.
     Performance: RecyclerListView renders very small number of views and this is not going to trigger multiple layouts on the iOS side.
    */
    private func clearGaps(for cellContainers: [CellContainer]) {
        var maxBound: CGFloat = 0
        var minBound: CGFloat = CGFloat(Int.max)
        
        cellContainers.indices.dropLast().forEach { index in
            let cellContainer = cellContainers[index]
            let nextCellContainer = cellContainers[index + 1]
            
            guard isWithinBounds(cellContainer,
                                 scrollOffset: scrollOffset,
                                 renderAheadOffset: renderAheadOffset,
                                 windowSize: windowSize) else {
                return
            }
            
            if horizontal {
                maxBound = max(maxBound, cellContainer.frame.maxX)
                minBound = min(minBound, cellContainer.frame.minX)
                
                if cellContainer.frame.minY < nextCellContainer.frame.minY {
                    if cellContainer.frame.maxY != nextCellContainer.frame.minY {
                        nextCellContainer.frame.origin.y = cellContainer.frame.maxY
                    }
                    if cellContainer.frame.minX != nextCellContainer.frame.minX {
                        nextCellContainer.frame.origin.x = cellContainer.frame.minX
                    }
                } else {
                    nextCellContainer.frame.origin.x = maxBound
                }
            } else {
                maxBound = max(maxBound, cellContainer.frame.maxY)
                minBound = min(minBound, cellContainer.frame.minY)
                
                if cellContainer.frame.minX < nextCellContainer.frame.minX {
                    if cellContainer.frame.maxX != nextCellContainer.frame.minX {
                        nextCellContainer.frame.origin.x = cellContainer.frame.maxX
                    }
                    if cellContainer.frame.minY != nextCellContainer.frame.minY {
                        nextCellContainer.frame.origin.y = cellContainer.frame.minY
                    }
                } else {
                    nextCellContainer.frame.origin.y = maxBound
                }
            }
        }
        
        lastMaxBound = maxBound
        lastMinBound = minBound
    }
    
    func computeBlankFromGivenOffset(_ actualScrollOffset: CGFloat) -> CGFloat {
        blankOffsetTop = lastMinBound - actualScrollOffset
        blankOffsetBottom = actualScrollOffset + windowSize - renderAheadOffset - lastMaxBound
        
        return max(blankOffsetTop, blankOffsetBottom) // one of the values is negative, we look for the positive one
    }
    
    /*
     It's important to avoid correcting views outside the render window. An item that isn't being recycled might still remain in the view tree. If views outside get considered then gaps between unused items will cause algorithm to fail.
    */
    internal func isWithinBounds(_ cellContainer: CellContainer, scrollOffset: CGFloat, renderAheadOffset: CGFloat, windowSize: CGFloat) -> Bool {
        let boundsStart = scrollOffset - renderAheadOffset
        let boundsEnd = scrollOffset + windowSize
        let cellFrame = cellContainer.frame
        
        if horizontal {
            return (cellFrame.minX >= boundsStart || cellFrame.maxX >= boundsStart) && (cellFrame.minX <= boundsEnd || cellFrame.maxX <= boundsEnd)
        } else {
            return (cellFrame.minY >= boundsStart || cellFrame.maxY >= boundsStart) && (cellFrame.minY <= boundsEnd || cellFrame.maxY <= boundsEnd)
        }
    }
}
