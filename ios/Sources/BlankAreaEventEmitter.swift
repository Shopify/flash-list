import Foundation

@objc(BlankAreaEventEmitter)
class BlankAreaEventEmitter: RCTEventEmitter {
    private static let blankAreaEventName = "instrumentation"
    private var hasListeners = false
    private(set) static var INSTANCE: BlankAreaEventEmitter? = nil

    override init() {
        super.init()
        BlankAreaEventEmitter.INSTANCE = self
    }

    @objc override func supportedEvents() -> [String]! {
        return [BlankAreaEventEmitter.blankAreaEventName]
    }

    func onBlankArea(offset: CGFloat) {
        if (hasListeners) {
            sendEvent(withName: BlankAreaEventEmitter.blankAreaEventName, body: [
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
