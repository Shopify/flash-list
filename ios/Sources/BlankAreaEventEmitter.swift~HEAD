import Foundation

@objc(BlankAreaEventEmitter)
class BlankAreaEventEmitter: RCTEventEmitter {
    private static let blankAreaEventName = "blankAreaEvent"
    private var hasListeners = false
    private(set) static var INSTANCE: BlankAreaEventEmitter? = nil

    override init() {
        super.init()
        BlankAreaEventEmitter.INSTANCE = self
    }

    @objc override func supportedEvents() -> [String]! {
        return [BlankAreaEventEmitter.blankAreaEventName]
    }

    func onBlankArea(
        startOffset: CGFloat,
        endOffset: CGFloat,
        blankArea: CGFloat,
        listSize: CGFloat
    ) {
        guard hasListeners else { return }
        sendEvent(withName: BlankAreaEventEmitter.blankAreaEventName, body: [
            "blankArea": blankArea,
            "startOffset": startOffset,
            "endOffset": endOffset,
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
