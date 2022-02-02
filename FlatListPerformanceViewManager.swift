import Foundation

@objc(FlatListPerformanceViewManager)
class FlatListPerformanceViewManager: RCTViewManager {
    override func view() -> UIView! {
        let blankAreaView = BlankAreaView()
        blankAreaView.cells = { scrollView in
            scrollView.subviews.first(where: { "\(type(of: $0))" == "RCTScrollContentView" })?.subviews ?? []
        }
        return blankAreaView
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
