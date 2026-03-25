package com.shopify.reactnative.flash_list

import android.content.Context
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ScrollView
import android.widget.HorizontalScrollView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

/**
 * Content container that does NOT remeasure React children during Android's
 * layout passes. React/Yoga handles child measurement via updateLayout() with
 * EXACTLY specs. This prevents the "catalyst view must have explicit width and
 * height" assertion when Android's ScrollView passes UNSPECIFIED specs.
 *
 * Size is computed from children's already-set layout bounds.
 */
class FlashListContentContainer(context: Context) : ViewGroup(context) {

    init {
        clipChildren = false
        clipToPadding = false
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        // Do NOT call measureChild on any children — React handles that.
        // Compute our own size from children's layout bounds.
        var maxRight = 0
        var maxBottom = 0
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            if (child.visibility != GONE) {
                if (child.right > maxRight) maxRight = child.right
                if (child.bottom > maxBottom) maxBottom = child.bottom
            }
        }
        // Use at least the parent-imposed size, or our computed content size
        val w = resolveSize(maxRight, widthMeasureSpec)
        val h = resolveSize(maxBottom, heightMeasureSpec)
        setMeasuredDimension(w, h)
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        // Children are positioned by React's updateLayout calls, not by us.
        // No-op here.
    }
}

/**
 * NativeFlashListView: A native list component for React Native.
 *
 * Architecture:
 * NativeFlashListView (FrameLayout)
 *   └── SwipeRefreshLayout? (optional)
 *         └── ScrollView / HorizontalScrollView
 *               └── FlashListContentContainer (does not remeasure children)
 *                     └── React children (positioned by Yoga via updateLayout)
 *
 * needsCustomLayoutForChildren() returns FALSE so React applies Yoga-computed
 * layout to children. FlashListContentContainer prevents the crash by not
 * remeasuring children during Android's own layout passes.
 */
class NativeFlashListView(context: Context) : FrameLayout(context) {

    companion object {
        private const val TAG = "NativeFlashListView"
    }

    // Content container that holds all React children — custom ViewGroup
    // that skips child measurement to prevent assertExplicitMeasureSpec crash
    internal val contentContainer = FlashListContentContainer(context)

    // Scroll containers (plain Android, not React's — we manage measurement ourselves)
    private val verticalScrollView = ScrollView(context).apply {
        layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        )
        isFillViewport = false
        clipChildren = false
        clipToPadding = false
        isVerticalScrollBarEnabled = true
    }

    private val horizontalScrollView = HorizontalScrollView(context).apply {
        layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        )
        clipChildren = false
        clipToPadding = false
        isHorizontalScrollBarEnabled = true
    }

    // Refresh control
    private var swipeRefreshLayout: SwipeRefreshLayout? = null
    private var refreshEnabled = false
    private var refreshing = false

    // Configuration
    var horizontal = false
        set(value) {
            if (field != value) {
                field = value
                rebuildLayout()
            }
        }

    var inverted = false
    var numColumns = 1
    var masonry = false
    var itemCount = 0
    var drawDistance: Float = 250f

    // Scroll configuration
    var pagingEnabled = false
    var snapToInterval: Float = 0f
    var snapToAlignment: String = "start"
    var decelerationRate: Float = 0.998f
    var bounces = true
    var scrollEnabled = true
    var showsVerticalScrollIndicator = true
        set(value) {
            field = value
            verticalScrollView.isVerticalScrollBarEnabled = value
        }
    var showsHorizontalScrollIndicator = true
        set(value) {
            field = value
            horizontalScrollView.isHorizontalScrollBarEnabled = value
        }
    var nestedScrollEnabled = true
        set(value) {
            field = value
            verticalScrollView.isNestedScrollingEnabled = value
            horizontalScrollView.isNestedScrollingEnabled = value
        }

    // Content insets
    var contentInsetTop: Float = 0f
    var contentInsetBottom: Float = 0f
    var contentInsetLeft: Float = 0f
    var contentInsetRight: Float = 0f

    // Callbacks tracking
    var onEndReachedThreshold: Float = 0.5f
    var onStartReachedThreshold: Float = 0.2f
    private var hasTriggeredEndReached = false
    private var hasTriggeredStartReached = false
    private var lastScrollTime: Long = 0L

    // Item keys mapping
    private val itemKeyMap = mutableMapOf<Int, String>()

    // Scroll event throttle
    var scrollEventThrottle: Int = 16

    // Progress view offset for refresh control
    var progressViewOffset: Int = 0

    // Sticky header indices
    var stickyHeaderIndices: IntArray? = null

    // Maintain visible content position
    var maintainVisibleContentPosition = false
    var autoscrollToTopThreshold: Float? = null
    var autoscrollToBottomThreshold: Float? = null

    // Keyboard dismiss mode
    var keyboardDismissMode: String = "none"

    // Current scroll container
    private var currentScrollView: ViewGroup? = null

    // Managed children list — tracked separately from the actual view hierarchy.
    // ViewManager's getChildAt/getChildCount return from this list so that
    // React knows about the children and can apply layout to them.
    // The children are also added to contentContainer for rendering.
    private val managedChildren = mutableListOf<View>()

    fun addManagedChild(child: View, index: Int) {
        managedChildren.add(index, child)
        contentContainer.addView(child, index)
    }

    fun removeManagedChildAt(index: Int) {
        if (index < managedChildren.size) {
            val child = managedChildren.removeAt(index)
            contentContainer.removeView(child)
        }
    }

    fun removeManagedChild(view: View) {
        managedChildren.remove(view)
        contentContainer.removeView(view)
    }

    fun getManagedChildCount(): Int = managedChildren.size

    fun getManagedChildAt(index: Int): View? = managedChildren.getOrNull(index)

    init {
        clipChildren = false
        clipToPadding = false
        setupVerticalLayout()
    }

    private fun setupVerticalLayout() {
        removeAllViews()
        (contentContainer.parent as? ViewGroup)?.removeView(contentContainer)
        verticalScrollView.removeAllViews()
        contentContainer.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        verticalScrollView.addView(contentContainer)
        setupScrollListener()
        addView(verticalScrollView)
        currentScrollView = verticalScrollView
    }

    private fun setupHorizontalLayout() {
        removeAllViews()
        (contentContainer.parent as? ViewGroup)?.removeView(contentContainer)
        horizontalScrollView.removeAllViews()
        contentContainer.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        horizontalScrollView.addView(contentContainer)
        setupScrollListener()
        addView(horizontalScrollView)
        currentScrollView = horizontalScrollView
    }

    private fun rebuildLayout() {
        if (horizontal) {
            setupHorizontalLayout()
        } else {
            setupVerticalLayout()
        }
    }

    private fun setupScrollListener() {
        verticalScrollView.setOnScrollChangeListener { _: View, _: Int, scrollY: Int, _: Int, _: Int ->
            handleScrollChange(scrollY)
        }
        horizontalScrollView.setOnScrollChangeListener { _: View, scrollX: Int, _: Int, _: Int, _: Int ->
            handleScrollChange(scrollX)
        }
    }

    private fun handleScrollChange(scrollOffset: Int) {
        val now = SystemClock.uptimeMillis()
        if (now - lastScrollTime < scrollEventThrottle) return
        lastScrollTime = now

        emitScrollEvent("onScroll")
        checkBounds()
    }

    fun setRefreshEnabled(enabled: Boolean) {
        refreshEnabled = enabled
        if (enabled && swipeRefreshLayout == null) {
            setupRefreshControl()
        } else if (!enabled && swipeRefreshLayout != null) {
            removeRefreshControl()
        }
    }

    fun setRefreshing(value: Boolean) {
        refreshing = value
        swipeRefreshLayout?.isRefreshing = value
    }

    private fun setupRefreshControl() {
        val scrollView = currentScrollView ?: return
        removeView(scrollView)
        val srl = SwipeRefreshLayout(context).apply {
            layoutParams = LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT
            )
            setProgressViewOffset(false, 0, PixelUtil.toPixelFromDIP(progressViewOffset.toFloat()).toInt())
            setOnRefreshListener {
                emitEvent("onRefresh", Arguments.createMap())
            }
        }
        srl.addView(scrollView)
        addView(srl)
        swipeRefreshLayout = srl
        srl.isRefreshing = refreshing
    }

    private fun removeRefreshControl() {
        val scrollView = currentScrollView ?: return
        swipeRefreshLayout?.let { srl ->
            srl.removeView(scrollView)
            removeView(srl)
            addView(scrollView)
            swipeRefreshLayout = null
        }
    }

    fun updateItemTypes(types: Map<Int, String>) {
        // Store for viewability tracking
    }

    fun updateItemKeys(keys: Map<Int, String>) {
        itemKeyMap.clear()
        itemKeyMap.putAll(keys)
    }

    // ========== Scroll Handling ==========

    private fun getScrollOffset(): Float {
        return if (horizontal) {
            horizontalScrollView.scrollX.toFloat()
        } else {
            verticalScrollView.scrollY.toFloat()
        }
    }

    private fun getScrollRange(): Float {
        return if (horizontal) {
            val child = horizontalScrollView.getChildAt(0)
            (child?.width ?: 0).toFloat()
        } else {
            val child = verticalScrollView.getChildAt(0)
            (child?.height ?: 0).toFloat()
        }
    }

    private fun getScrollExtent(): Float {
        return if (horizontal) {
            horizontalScrollView.width.toFloat()
        } else {
            verticalScrollView.height.toFloat()
        }
    }

    private fun emitScrollEvent(eventName: String) {
        val offset = getScrollOffset()
        val range = getScrollRange()
        val extent = getScrollExtent()

        val data = Arguments.createMap().apply {
            putDouble("contentOffset", PixelUtil.toDIPFromPixel(offset).toDouble())
            putDouble("contentSize", PixelUtil.toDIPFromPixel(range).toDouble())
            putDouble("viewportSize", PixelUtil.toDIPFromPixel(extent).toDouble())
            putBoolean("horizontal", horizontal)
        }
        emitEvent(eventName, data)
    }

    private fun checkBounds() {
        val offset = getScrollOffset()
        val range = getScrollRange()
        val extent = getScrollExtent()
        val maxOffset = range - extent

        if (maxOffset <= 0) return

        // Check end reached
        val distanceFromEnd = maxOffset - offset
        val endThreshold = extent * onEndReachedThreshold
        if (distanceFromEnd <= endThreshold && !hasTriggeredEndReached) {
            hasTriggeredEndReached = true
            emitEvent("onEndReached", Arguments.createMap())
        } else if (distanceFromEnd > endThreshold) {
            hasTriggeredEndReached = false
        }

        // Check start reached
        val startThreshold = extent * onStartReachedThreshold
        if (offset <= startThreshold && !hasTriggeredStartReached) {
            hasTriggeredStartReached = true
            emitEvent("onStartReached", Arguments.createMap())
        } else if (offset > startThreshold) {
            hasTriggeredStartReached = false
        }
    }

    // ========== Imperative Methods ==========

    fun scrollToIndex(index: Int, animated: Boolean, viewPosition: Float, viewOffset: Float) {
        val child = contentContainer.getChildAt(index) ?: return
        val offset = if (horizontal) child.left else child.top
        scrollToOffset(PixelUtil.toDIPFromPixel(offset.toFloat()) - viewOffset, animated)
    }

    fun scrollToOffset(offset: Float, animated: Boolean) {
        val offsetPx = PixelUtil.toPixelFromDIP(offset).toInt()
        if (horizontal) {
            if (animated) horizontalScrollView.smoothScrollTo(offsetPx, 0)
            else horizontalScrollView.scrollTo(offsetPx, 0)
        } else {
            if (animated) verticalScrollView.smoothScrollTo(0, offsetPx)
            else verticalScrollView.scrollTo(0, offsetPx)
        }
    }

    fun scrollToEnd(animated: Boolean) {
        val range = getScrollRange().toInt()
        if (horizontal) {
            if (animated) horizontalScrollView.smoothScrollTo(range, 0)
            else horizontalScrollView.scrollTo(range, 0)
        } else {
            if (animated) verticalScrollView.smoothScrollTo(0, range)
            else verticalScrollView.scrollTo(0, range)
        }
    }

    fun scrollToTop(animated: Boolean) {
        if (horizontal) {
            if (animated) horizontalScrollView.smoothScrollTo(0, 0)
            else horizontalScrollView.scrollTo(0, 0)
        } else {
            if (animated) verticalScrollView.smoothScrollTo(0, 0)
            else verticalScrollView.scrollTo(0, 0)
        }
    }

    // ========== Event Emission ==========

    internal fun emitEvent(eventName: String, data: WritableMap) {
        val reactContext = context as? ReactContext ?: return
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
        dispatcher?.dispatchEvent(
            FlashListEvent(UIManagerHelper.getSurfaceId(this), id, eventName, data)
        )
    }

    fun emitRenderRequest(indices: IntArray, sync: Boolean) {
        val data = Arguments.createMap()
        val indicesArray = Arguments.createArray()
        for (index in indices) {
            indicesArray.pushInt(index)
        }
        data.putArray("indices", indicesArray)
        data.putBoolean("sync", sync)
        emitEvent("onRenderRequest", data)
    }

    fun setOverScroll(mode: Int) {
        verticalScrollView.overScrollMode = mode
        horizontalScrollView.overScrollMode = mode
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

    private val measureAndLayout = Runnable {
        try {
            measure(
                MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
            )
            layout(left, top, right, bottom)
        } catch (e: IllegalStateException) {
            // Swallow "catalyst view must have explicit width and height" assertions
            // that can happen during Android's measure pass cascade through ScrollView.
            // React/Yoga handles child measurement directly via updateLayout.
        }
    }

    fun cleanup() {
        contentContainer.removeAllViews()
        managedChildren.clear()
        swipeRefreshLayout?.setOnRefreshListener(null)
    }
}

/**
 * Custom event for FlashList events
 */
class FlashListEvent(
    surfaceId: Int,
    viewId: Int,
    private val name: String,
    private val eventData: WritableMap
) : Event<FlashListEvent>(surfaceId, viewId) {

    override fun getEventName(): String = name

    override fun getEventData(): WritableMap = eventData
}

/**
 * Viewability configuration
 */
data class ViewabilityConfig(
    val itemVisiblePercentThreshold: Float = 0f,
    val viewAreaCoveragePercentThreshold: Float = 0f,
    val waitForInteraction: Boolean = false,
    val minimumViewTime: Long = 0L
)
