@file:Suppress("DEPRECATION") // We want to use RCTEventEmitter for interop purposes
package com.shopify.reactnative.flash_list

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter

class BlankAreaEvent(
    surfaceId: Int,
    viewTag: Int,
    private val offsetStart: Double,
    private val offsetEnd: Double
): Event<BlankAreaEvent>(surfaceId, viewTag) {
    override fun getEventName() = EVENT_NAME

    override fun getEventData(): WritableMap = Arguments.createMap().apply {
        putDouble("offsetStart", offsetStart)
        putDouble("offsetEnd", offsetEnd)
    }

    override fun dispatch(rctEventEmitter: RCTEventEmitter) {
        rctEventEmitter.receiveEvent(viewTag, eventName, eventData)
    }

    companion object {
        const val EVENT_NAME: String = "onBlankAreaEvent"
    }
}