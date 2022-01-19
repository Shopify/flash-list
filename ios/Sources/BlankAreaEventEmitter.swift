import Foundation

@objc(BlankAreaEventEmitter)
class BlankAreaEventEmitter: RCTEventEmitter {
    private static let BLANK_AREA_EVENT_NAME = "@shopify/recyclerflatlist/emit-blank-area"
    private var hasListeners = false
    private(set) static var INSTANCE: BlankAreaEventEmitter? = nil

    override init() {
        super.init()
        BlankAreaEventEmitter.INSTANCE = self
    }

    @objc override func supportedEvents() -> [String]! {
        return [BlankAreaEventEmitter.BLANK_AREA_EVENT_NAME]
    }

    func onBlankArea(offset: CGFloat) {
        if (hasListeners) {
            sendEvent(withName: BlankAreaEventEmitter.BLANK_AREA_EVENT_NAME, body: [
//                "startOffset": String(timestamp),
//                "endOffset": renderPassName,
                "offset": offset
            ])
        }
    }

    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc override func startObserving() {
        super.startObserving()
        hasListeners = true
    }

    @objc override func stopObserving() {
        super.stopObserving()
        hasListeners = false
    }
}
