import Foundation


/*
 Container for all RecyclerListView children. This will automatically remove all gaps and overlaps for GridLayouts with flexible spans.
 Note: This cannot work for masonry layouts i.e, pinterest like layout
*/
@objc class AutoLayoutView: UIView {
    private var horizontal = false
    private var scrollOffset: CGFloat = 0
    private var windowSize: CGFloat = 0
    private var renderAheadOffset: CGFloat = 0
    
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
    
    override func layoutSubviews() {
        fixLayout()
        super.layoutSubviews()
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
        var currentMax: CGFloat = 0
        
        cellContainers.indices.dropLast().forEach { index in
            let cellContainer = cellContainers[index]
            let nextCellContainer = cellContainers[index + 1]
            guard isWithinBounds(cellContainer) else { return }
            if !horizontal {
                currentMax = max(currentMax, cellContainer.frame.maxY)
                if cellContainer.frame.minX < nextCellContainer.frame.minX {
                    if cellContainer.frame.maxX != nextCellContainer.frame.minX {
                        nextCellContainer.frame.origin.x = cellContainer.frame.maxX
                    }
                    if cellContainer.frame.minY != nextCellContainer.frame.minY {
                        nextCellContainer.frame.origin.y = cellContainer.frame.minY
                    }
                } else {
                    nextCellContainer.frame.origin.y = currentMax
                }
            } else {
                currentMax = max(currentMax, cellContainer.frame.maxX)
                if cellContainer.frame.minY < nextCellContainer.frame.minY {
                    if cellContainer.frame.maxY != nextCellContainer.frame.minY {
                        nextCellContainer.frame.origin.y = cellContainer.frame.maxY
                    }
                    if cellContainer.frame.minX != nextCellContainer.frame.minX {
                        nextCellContainer.frame.origin.x = cellContainer.frame.minX
                    }
                } else {
                    nextCellContainer.frame.origin.x = currentMax
                }
            }
        }
    }
    
    /*
     It's important to avoid correcting views outside the render window. An item that isn't being recycled might still remain in the view tree. If views outside get considered then gaps between unused items will cause algorithm to fail.
    */
    private func isWithinBounds(_ cellContainer: CellContainer) -> Bool {
        if !horizontal {
            return (cellContainer.frame.minY >= (scrollOffset - renderAheadOffset) || cellContainer.frame.maxY >= (scrollOffset - renderAheadOffset)) &&
            (cellContainer.frame.minY <= scrollOffset + windowSize || cellContainer.frame.maxY <= scrollOffset + windowSize)
        } else {
            return (cellContainer.frame.minX >= (scrollOffset - renderAheadOffset) || cellContainer.frame.maxX >= (scrollOffset - renderAheadOffset)) &&
            (cellContainer.frame.minX <= scrollOffset + windowSize || cellContainer.frame.maxX <= scrollOffset + windowSize)
        }
    }
}
