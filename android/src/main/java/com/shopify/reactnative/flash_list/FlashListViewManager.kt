package com.shopify.reactnative.flash_list

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

/**
 * ViewGroupManager for FlashListView — a RecyclerView-backed native list component.
 *
 * This manager handles:
 * - Creating the native FlashListView
 * - Setting all props from JS (FlashList props + ScrollView props)
 * - Dispatching native commands (scrollToOffset, scrollToEnd, etc.)
 * - Managing React children (cells rendered by JS are added as children)
 */
@ReactModule(name = FlashListViewManager.REACT_CLASS)
class FlashListViewManager : ViewGroupManager<FlashListView>() {

    companion object {
        const val REACT_CLASS = "FlashListRecyclerView"

        // Native commands
        const val COMMAND_SCROLL_TO_OFFSET = 1
        const val COMMAND_SCROLL_TO_INDEX = 2
        const val COMMAND_SCROLL_TO_END = 3
        const val COMMAND_FLASH_SCROLL_INDICATORS = 4
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): FlashListView {
        return FlashListView(reactContext)
    }

    // --- FlashList-specific props ---

    @ReactProp(name = "dataLength", defaultInt = 0)
    fun setDataLength(view: FlashListView, value: Int) {
        view.setDataLength(value)
    }

    @ReactProp(name = "numColumns", defaultInt = 1)
    fun setNumColumns(view: FlashListView, value: Int) {
        view.setNumColumns(value)
    }

    @ReactProp(name = "horizontal", defaultBoolean = false)
    fun setHorizontal(view: FlashListView, value: Boolean) {
        view.setHorizontal(value)
    }

    @ReactProp(name = "inverted", defaultBoolean = false)
    fun setInverted(view: FlashListView, value: Boolean) {
        view.setInverted(value)
    }

    @ReactProp(name = "masonry", defaultBoolean = false)
    fun setMasonry(view: FlashListView, value: Boolean) {
        view.setMasonry(value)
    }

    @ReactProp(name = "drawDistance", defaultInt = 250)
    fun setDrawDistance(view: FlashListView, value: Int) {
        view.setDrawDistance(value)
    }

    // --- ScrollView-equivalent props ---

    @ReactProp(name = "scrollEnabled", defaultBoolean = true)
    fun setScrollEnabled(view: FlashListView, value: Boolean) {
        view.setScrollEnabled(value)
    }

    @ReactProp(name = "showsVerticalScrollIndicator", defaultBoolean = true)
    fun setShowsVerticalScrollIndicator(view: FlashListView, value: Boolean) {
        view.setShowsVerticalScrollIndicator(value)
    }

    @ReactProp(name = "showsHorizontalScrollIndicator", defaultBoolean = true)
    fun setShowsHorizontalScrollIndicator(view: FlashListView, value: Boolean) {
        view.setShowsHorizontalScrollIndicator(value)
    }

    @ReactProp(name = "overScrollMode")
    fun setOverScrollMode(view: FlashListView, mode: String?) {
        view.setOverScrollMode(mode ?: "auto")
    }

    @ReactProp(name = "decelerationRate", defaultFloat = 0.998f)
    fun setDecelerationRate(view: FlashListView, value: Float) {
        view.setDecelerationRate(value)
    }

    @ReactProp(name = "pagingEnabled", defaultBoolean = false)
    fun setPagingEnabled(view: FlashListView, value: Boolean) {
        view.setPagingEnabled(value)
    }

    @ReactProp(name = "nestedScrollEnabled", defaultBoolean = false)
    fun setNestedScrollEnabled(view: FlashListView, value: Boolean) {
        view.setNestedScrollEnabled(value)
    }

    @ReactProp(name = "scrollEventThrottle", defaultInt = 16)
    fun setScrollEventThrottle(view: FlashListView, value: Int) {
        view.setScrollEventThrottle(value)
    }

    @ReactProp(name = "refreshing", defaultBoolean = false)
    fun setRefreshing(view: FlashListView, value: Boolean) {
        view.setRefreshing(value)
    }

    @ReactProp(name = "refreshEnabled", defaultBoolean = false)
    fun setRefreshEnabled(view: FlashListView, value: Boolean) {
        view.setRefreshEnabled(value)
    }

    // --- Children management ---
    // React children (rendered cells) are added to the RecyclerView's ViewHolders

    override fun addView(parent: FlashListView, child: android.view.View, index: Int) {
        // Children from JS get routed to the appropriate ViewHolder
        // This is handled by the Fabric mounting layer
        super.addView(parent, child, index)
    }

    override fun removeViewAt(parent: FlashListView, index: Int) {
        super.removeViewAt(parent, index)
    }

    override fun getChildCount(parent: FlashListView): Int {
        return parent.childCount
    }

    override fun getChildAt(parent: FlashListView, index: Int): android.view.View? {
        return parent.getChildAt(index)
    }

    override fun needsCustomLayoutForChildren(): Boolean {
        // Let React/Yoga handle child positioning
        return false
    }

    // --- Native commands ---

    override fun getCommandsMap(): Map<String, Int> {
        return mapOf(
            "scrollToOffset" to COMMAND_SCROLL_TO_OFFSET,
            "scrollToIndex" to COMMAND_SCROLL_TO_INDEX,
            "scrollToEnd" to COMMAND_SCROLL_TO_END,
            "flashScrollIndicators" to COMMAND_FLASH_SCROLL_INDICATORS,
        )
    }

    override fun receiveCommand(root: FlashListView, commandId: String, args: ReadableArray?) {
        when (commandId) {
            "scrollToOffset" -> {
                val offset = args?.getDouble(0)?.toFloat() ?: 0f
                val animated = args?.getBoolean(1) ?: true
                root.scrollToOffset(offset, animated)
            }
            "scrollToIndex" -> {
                val index = args?.getInt(0) ?: 0
                val animated = args?.getBoolean(1) ?: true
                val viewPosition = args?.getDouble(2)?.toFloat() ?: 0f
                val viewOffset = args?.getDouble(3)?.toFloat() ?: 0f
                root.scrollToIndex(index, animated, viewPosition, viewOffset)
            }
            "scrollToEnd" -> {
                val animated = args?.getBoolean(0) ?: true
                root.scrollToEnd(animated)
            }
            "flashScrollIndicators" -> {
                root.recyclerView.scrollBy(0, 0) // triggers scroll indicator visibility
            }
        }
    }

    // --- Events ---

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return mapOf(
            "onScroll" to mapOf("registrationName" to "onScroll"),
            "onScrollBeginDrag" to mapOf("registrationName" to "onScrollBeginDrag"),
            "onScrollEndDrag" to mapOf("registrationName" to "onScrollEndDrag"),
            "onMomentumScrollBegin" to mapOf("registrationName" to "onMomentumScrollBegin"),
            "onMomentumScrollEnd" to mapOf("registrationName" to "onMomentumScrollEnd"),
            "onCellRenderRequest" to mapOf("registrationName" to "onCellRenderRequest"),
            "onRefresh" to mapOf("registrationName" to "onRefresh"),
        )
    }
}
