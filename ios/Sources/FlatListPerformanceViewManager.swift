import Foundation

@objc(FlatListPerformanceViewManager)
class FlatListPerformanceViewManager: RCTViewManager {
    override func view() -> UIView! {
        let blankAreaView = BlankAreaView()
        blankAreaView.cells = { scrollView in
            // Comparing with a raw string since we cannot import React in this file
            scrollView.subviews.first(where: { "\(type(of: $0))" == "RCTScrollContentView" })?.subviews ?? []
        }
        return blankAreaView
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
