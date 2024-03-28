package com.shopify.reactnative.flash_list

import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.bridge.WritableMap

fun ReactContext.dispatchEvent(nativeTag: Int, eventName: String, event: WritableMap) {
    this.getJSModule(RCTEventEmitter::class.java)
        .receiveEvent(nativeTag, eventName, event)
}
