@file:Suppress("DEPRECATION") // We want to use RCTEventEmitter for interop purposes
package com.shopify.reactnative.flash_list.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter

class OnBlankAreaEvent(surfaceId: Int, viewId: Int, val offsetStart: Double, val offsetEnd: Double) :
    Event<OnBlankAreaEvent>(surfaceId, viewId) {

  override fun getEventName(): String {
    return EVENT_NAME
  }

  override fun getEventData(): WritableMap {
    val eventData: WritableMap = Arguments.createMap()
    eventData.putDouble("offsetStart", offsetStart)
    eventData.putDouble("offsetEnd", offsetEnd)
    return eventData
  }

  override fun dispatch(rctEventEmitter: RCTEventEmitter) {
    rctEventEmitter.receiveEvent(viewTag, eventName, eventData)
  }

  companion object {
    const val EVENT_NAME: String = "emitBlankAreaEvent"
  }
}
