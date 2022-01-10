import Foundation


/*
 Container for all RecyclerListView children. This will automatically remove all gaps and overlaps for GridLayouts with flexible spans.
 Note: This cannot work for masonry layouts i.e, pinterest like layout
*/
@objc class AutoLayoutView: UIView {
    private var horizontal = false
    private var scrollOffset = 0
    private var windowSize = 0
    private var renderAheadOffset = 0
    
    @objc func setHorizontal(_ horizontal: Bool) {
        self.horizontal = horizontal
    }
    
    @objc func setScrollOffset(_ scrollOffset: Int) {
        self.scrollOffset = scrollOffset
    }
    
    @objc func setWindowSize(_ windowSize: Int) {
        self.windowSize = windowSize
    }
    
    @objc func setRenderAheadOffset(_ renderAheadOffset: Int) {
        self.renderAheadOffset = renderAheadOffset
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
            // Skip views outside the `AutoLayoutView` bounds.
            guard bounds.intersects(convert(cellContainer.frame, from: cellContainer)) else { return }
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
}
