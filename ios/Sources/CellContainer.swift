import Foundation

@objc public class CellContainer: UIView {
    var index: Int = -1
    
    @objc public func setIndex(_ index: Int) {
        self.index = index
    }
}
