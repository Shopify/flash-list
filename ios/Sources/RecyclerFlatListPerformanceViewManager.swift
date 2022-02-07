import Foundation

@objc(RecyclerFlatListPerformanceViewManager)
class RecyclerFlatListPerformanceViewManager: RCTViewManager {
    override func view() -> UIView! {
        let blankAreaView = BlankAreaView()
        blankAreaView.shouldCheckRCTView = true
        blankAreaView.cells = { scrollView in
            // Comparing with a raw string since we cannot import React in this file
            let container = scrollView.subviews.first(where: { "\(type(of: $0.self))" == "RCTScrollContentView" })?.subviews.first
            let autoLayoutView = container?.subviews.first(where: { $0 is AutoLayoutView })
            let cells = autoLayoutView?.subviews ?? []
            let additionalViews = container?.subviews.filter { $0 is AutoLayoutView == false } ?? []
            return cells + additionalViews
        }
        return blankAreaView
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
