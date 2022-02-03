import Foundation

@objc(RecyclerFlatListPerformanceViewManager)
class RecyclerFlatListPerformanceViewManager: RCTViewManager {
    override func view() -> UIView! {
        let blankAreaView = BlankAreaView()
        blankAreaView.cells = { scrollView in
            scrollView.subviews.first(where: { "\(type(of: $0.self))" == "RCTScrollContentView" })?.subviews.first?.subviews.first?.subviews ?? []
        }
        return blankAreaView
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
