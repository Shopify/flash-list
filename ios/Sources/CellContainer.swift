import Foundation

@objc class CellContainer: UIView {
    var index: Int = -1
    var stableId: String = ""

    @objc func setIndex(_ index: Int) {
        self.index = index
    }

    @objc func setStableId(_ stableId: String) {
        self.stableId = stableId
    }
}
