package com.shopify.reactnative.flash_list

import android.view.View
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

/**
 * React Native ViewManager for NativeFlashListView.
 */
@ReactModule(name = NativeFlashListViewManager.REACT_CLASS)
class NativeFlashListViewManager : ViewGroupManager<NativeFlashListView>() {

    companion object {
        const val REACT_CLASS = "NativeFlashListView"

        const val COMMAND_SCROLL_TO_INDEX = 1
        const val COMMAND_SCROLL_TO_OFFSET = 2
        const val COMMAND_SCROLL_TO_END = 3
        const val COMMAND_SCROLL_TO_TOP = 4
        const val COMMAND_FLASH_SCROLL_INDICATORS = 5
        const val COMMAND_NOTIFY_DATA_CHANGED = 6
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): NativeFlashListView {
        return NativeFlashListView(reactContext)
    }

    override fun onDropViewInstance(view: NativeFlashListView) {
        super.onDropViewInstance(view)
        view.cleanup()
    }

    // ========== Props ==========

    @ReactProp(name = "horizontal", defaultBoolean = false)
    fun setHorizontal(view: NativeFlashListView, horizontal: Boolean) {
        view.horizontal = horizontal
    }

    @ReactProp(name = "inverted", defaultBoolean = false)
    fun setInverted(view: NativeFlashListView, inverted: Boolean) {
        view.inverted = inverted
    }

    @ReactProp(name = "numColumns", defaultInt = 1)
    fun setNumColumns(view: NativeFlashListView, numColumns: Int) {
        view.numColumns = numColumns
    }

    @ReactProp(name = "masonry", defaultBoolean = false)
    fun setMasonry(view: NativeFlashListView, masonry: Boolean) {
        view.masonry = masonry
    }

    @ReactProp(name = "itemCount", defaultInt = 0)
    fun setItemCount(view: NativeFlashListView, itemCount: Int) {
        view.itemCount = itemCount
    }

    @ReactProp(name = "drawDistance", defaultFloat = 250f)
    fun setDrawDistance(view: NativeFlashListView, drawDistance: Float) {
        view.drawDistance = drawDistance
    }

    @ReactProp(name = "scrollEnabled", defaultBoolean = true)
    fun setScrollEnabled(view: NativeFlashListView, scrollEnabled: Boolean) {
        view.scrollEnabled = scrollEnabled
    }

    @ReactProp(name = "showsVerticalScrollIndicator", defaultBoolean = true)
    fun setShowsVerticalScrollIndicator(view: NativeFlashListView, show: Boolean) {
        view.showsVerticalScrollIndicator = show
    }

    @ReactProp(name = "showsHorizontalScrollIndicator", defaultBoolean = true)
    fun setShowsHorizontalScrollIndicator(view: NativeFlashListView, show: Boolean) {
        view.showsHorizontalScrollIndicator = show
    }

    @ReactProp(name = "bounces", defaultBoolean = true)
    fun setBounces(view: NativeFlashListView, bounces: Boolean) {
        view.bounces = bounces
        view.setOverScroll(if (bounces) View.OVER_SCROLL_ALWAYS else View.OVER_SCROLL_NEVER)
    }

    @ReactProp(name = "overScrollMode")
    fun setOverScrollMode(view: NativeFlashListView, mode: String?) {
        view.setOverScroll(when (mode) {
            "always" -> View.OVER_SCROLL_ALWAYS
            "never" -> View.OVER_SCROLL_NEVER
            else -> View.OVER_SCROLL_IF_CONTENT_SCROLLS
        })
    }

    @ReactProp(name = "nestedScrollEnabled", defaultBoolean = true)
    fun setNestedScrollEnabled(view: NativeFlashListView, enabled: Boolean) {
        view.nestedScrollEnabled = enabled
    }

    @ReactProp(name = "pagingEnabled", defaultBoolean = false)
    fun setPagingEnabled(view: NativeFlashListView, pagingEnabled: Boolean) {
        view.pagingEnabled = pagingEnabled
    }

    @ReactProp(name = "snapToInterval", defaultFloat = 0f)
    fun setSnapToInterval(view: NativeFlashListView, interval: Float) {
        view.snapToInterval = interval
    }

    @ReactProp(name = "snapToAlignment")
    fun setSnapToAlignment(view: NativeFlashListView, alignment: String?) {
        view.snapToAlignment = alignment ?: "start"
    }

    @ReactProp(name = "decelerationRate", defaultFloat = 0.998f)
    fun setDecelerationRate(view: NativeFlashListView, rate: Float) {
        view.decelerationRate = rate
    }

    @ReactProp(name = "scrollEventThrottle", defaultInt = 16)
    fun setScrollEventThrottle(view: NativeFlashListView, throttle: Int) {
        view.scrollEventThrottle = throttle
    }

    @ReactProp(name = "onEndReachedThreshold", defaultFloat = 0.5f)
    fun setOnEndReachedThreshold(view: NativeFlashListView, threshold: Float) {
        view.onEndReachedThreshold = threshold
    }

    @ReactProp(name = "onStartReachedThreshold", defaultFloat = 0.2f)
    fun setOnStartReachedThreshold(view: NativeFlashListView, threshold: Float) {
        view.onStartReachedThreshold = threshold
    }

    @ReactProp(name = "refreshing", defaultBoolean = false)
    fun setRefreshing(view: NativeFlashListView, refreshing: Boolean) {
        view.setRefreshing(refreshing)
    }

    @ReactProp(name = "onRefreshEnabled", defaultBoolean = false)
    fun setOnRefreshEnabled(view: NativeFlashListView, enabled: Boolean) {
        view.setRefreshEnabled(enabled)
    }

    @ReactProp(name = "progressViewOffset", defaultInt = 0)
    fun setProgressViewOffset(view: NativeFlashListView, offset: Int) {
        view.progressViewOffset = offset
    }

    @ReactProp(name = "contentInsetTop", defaultFloat = 0f)
    fun setContentInsetTop(view: NativeFlashListView, inset: Float) {
        view.contentInsetTop = inset
    }

    @ReactProp(name = "contentInsetBottom", defaultFloat = 0f)
    fun setContentInsetBottom(view: NativeFlashListView, inset: Float) {
        view.contentInsetBottom = inset
    }

    @ReactProp(name = "contentInsetLeft", defaultFloat = 0f)
    fun setContentInsetLeft(view: NativeFlashListView, inset: Float) {
        view.contentInsetLeft = inset
    }

    @ReactProp(name = "contentInsetRight", defaultFloat = 0f)
    fun setContentInsetRight(view: NativeFlashListView, inset: Float) {
        view.contentInsetRight = inset
    }

    @ReactProp(name = "keyboardDismissMode")
    fun setKeyboardDismissMode(view: NativeFlashListView, mode: String?) {
        view.keyboardDismissMode = mode ?: "none"
    }

    @ReactProp(name = "stickyHeaderIndices")
    fun setStickyHeaderIndices(view: NativeFlashListView, indices: ReadableArray?) {
        if (indices == null) {
            view.stickyHeaderIndices = null
        } else {
            val arr = IntArray(indices.size())
            for (i in 0 until indices.size()) {
                arr[i] = indices.getInt(i)
            }
            view.stickyHeaderIndices = arr
        }
    }

    @ReactProp(name = "itemTypes")
    fun setItemTypes(view: NativeFlashListView, types: ReadableMap?) {
        if (types == null) return
        val map = mutableMapOf<Int, String>()
        val iterator = types.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            map[key.toInt()] = types.getString(key) ?: "default"
        }
        view.updateItemTypes(map)
    }

    @ReactProp(name = "itemKeys")
    fun setItemKeys(view: NativeFlashListView, keys: ReadableMap?) {
        if (keys == null) return
        val map = mutableMapOf<Int, String>()
        val iterator = keys.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            map[key.toInt()] = keys.getString(key) ?: key
        }
        view.updateItemKeys(map)
    }

    @ReactProp(name = "spanSizes")
    fun setSpanSizes(view: NativeFlashListView, sizes: ReadableMap?) {
        // Span sizes are relevant for grid/masonry layout
    }

    @ReactProp(name = "maintainVisibleContentPosition")
    fun setMaintainVisibleContentPosition(view: NativeFlashListView, config: ReadableMap?) {
        if (config == null) {
            view.maintainVisibleContentPosition = false
            return
        }
        view.maintainVisibleContentPosition = !(config.hasKey("disabled") && config.getBoolean("disabled"))
        if (config.hasKey("autoscrollToTopThreshold")) {
            view.autoscrollToTopThreshold = config.getDouble("autoscrollToTopThreshold").toFloat()
        }
        if (config.hasKey("autoscrollToBottomThreshold")) {
            view.autoscrollToBottomThreshold = config.getDouble("autoscrollToBottomThreshold").toFloat()
        }
    }

    // ========== Child Management ==========
    // React children are tracked in a list on NativeFlashListView.
    // They are also added to the contentContainer for visual rendering.
    // getChildCount/getChildAt return from the tracked list so that
    // Yoga's layout coordinates match the view hierarchy.

    override fun addView(parent: NativeFlashListView, child: View, index: Int) {
        parent.addManagedChild(child, index)
    }

    override fun removeViewAt(parent: NativeFlashListView, index: Int) {
        parent.removeManagedChildAt(index)
    }

    override fun removeView(parent: NativeFlashListView, view: View) {
        parent.removeManagedChild(view)
    }

    override fun getChildCount(parent: NativeFlashListView): Int {
        return parent.getManagedChildCount()
    }

    override fun getChildAt(parent: NativeFlashListView, index: Int): View? {
        return parent.getManagedChildAt(index)
    }

    override fun needsCustomLayoutForChildren(): Boolean {
        return false
    }

    // ========== Commands ==========

    override fun getCommandsMap(): Map<String, Int> {
        return MapBuilder.builder<String, Int>()
            .put("scrollToIndex", COMMAND_SCROLL_TO_INDEX)
            .put("scrollToOffset", COMMAND_SCROLL_TO_OFFSET)
            .put("scrollToEnd", COMMAND_SCROLL_TO_END)
            .put("scrollToTop", COMMAND_SCROLL_TO_TOP)
            .put("flashScrollIndicators", COMMAND_FLASH_SCROLL_INDICATORS)
            .put("notifyDataChanged", COMMAND_NOTIFY_DATA_CHANGED)
            .build()
    }

    override fun receiveCommand(root: NativeFlashListView, commandId: String?, args: ReadableArray?) {
        when (commandId) {
            "scrollToIndex" -> {
                val index = args?.getInt(0) ?: return
                val animated = args.getBoolean(1)
                val viewPosition = args.getDouble(2).toFloat()
                val viewOffset = args.getDouble(3).toFloat()
                root.scrollToIndex(index, animated, viewPosition, viewOffset)
            }
            "scrollToOffset" -> {
                val offset = args?.getDouble(0)?.toFloat() ?: return
                val animated = args.getBoolean(1)
                root.scrollToOffset(offset, animated)
            }
            "scrollToEnd" -> {
                val animated = args?.getBoolean(0) ?: false
                root.scrollToEnd(animated)
            }
            "scrollToTop" -> {
                val animated = args?.getBoolean(0) ?: false
                root.scrollToTop(animated)
            }
            "flashScrollIndicators" -> {
                // No-op on Android
            }
            "notifyDataChanged" -> {
                // No-op in ScrollView mode
            }
        }
    }

    // ========== Events ==========

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>()
            .put("onScroll", MapBuilder.of("registrationName", "onScroll"))
            .put("onScrollBeginDrag", MapBuilder.of("registrationName", "onScrollBeginDrag"))
            .put("onMomentumScrollBegin", MapBuilder.of("registrationName", "onMomentumScrollBegin"))
            .put("onMomentumScrollEnd", MapBuilder.of("registrationName", "onMomentumScrollEnd"))
            .put("onEndReached", MapBuilder.of("registrationName", "onEndReached"))
            .put("onStartReached", MapBuilder.of("registrationName", "onStartReached"))
            .put("onRefresh", MapBuilder.of("registrationName", "onRefresh"))
            .put("onRenderRequest", MapBuilder.of("registrationName", "onRenderRequest"))
            .put("onViewableItemsChanged", MapBuilder.of("registrationName", "onViewableItemsChanged"))
            .build()
    }
}
