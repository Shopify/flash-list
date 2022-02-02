import Foundation

@objc(BlankAreaEventEmitter)
class BlankAreaEventEmitter: RCTEventEmitter {
    private static let blankAreaEventName = "blankAreaEvent"
    private static let interactiveEventName = "interactiveEvent"
    private var hasListeners = false
    private(set) static var sharedInstance: BlankAreaEventEmitter? = nil

    override init() {
        super.init()
        BlankAreaEventEmitter.sharedInstance = self
    }

    @objc override func supportedEvents() -> [String]! {
        return [BlankAreaEventEmitter.blankAreaEventName]
    }

    func onBlankArea(
        offsetStart: CGFloat,
        offsetEnd: CGFloat,
        listSize: CGFloat
    ) {
        guard hasListeners else { return }
        sendEvent(withName: BlankAreaEventEmitter.blankAreaEventName, body: [
            "offsetStart": offsetStart,
            "offsetEnd": offsetEnd,
            "listSize": listSize,
        ])
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
