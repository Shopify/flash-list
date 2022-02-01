import Foundation

@objc(BlankAreaViewManager)
class BlankAreaViewManager: RCTViewManager {
    override func view() -> UIView! {
        return BlankAreaView()
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
