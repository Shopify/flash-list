package com.shopify.reactnative.flash_list

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.PagerSnapHelper
import androidx.recyclerview.widget.RecyclerView
import androidx.recyclerview.widget.StaggeredGridLayoutManager
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.views.view.ReactViewGroup

/**
 * Native FlashList view backed by RecyclerView.
 *
 * Architecture:
 * FlashListView (FrameLayout)
 *   ├── headerContainer (ReactViewGroup, optional)
 *   ├── SwipeRefreshLayout? (optional, wraps RecyclerView)
 *   │   └── RecyclerView (with LinearLayoutManager / GridLayoutManager / StaggeredGridLayoutManager)
 *   ├── footerContainer (ReactViewGroup, optional)
 *   └── emptyContainer (ReactViewGroup, shown when data is empty)
 *
 * The RecyclerView uses FlashListAdapter which requests item rendering from JS.
 * JS renders React trees into ViewHolder containers via Fabric.
 */
class FlashListView(context: Context) : FrameLayout(context) {

    companion object {
        private const val TAG = "FlashListView"
    }

    // --- Core components ---
    val recyclerView: RecyclerView = RecyclerView(context).apply {
        layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        clipToPadding = false
        clipChildren = false
        itemAnimator = null // Disable default animations for performance
        setHasFixedSize(false)
    }

    private val adapter: FlashListAdapter

    // --- Layout state ---
    private var horizontal: Boolean = false
    private var inverted: Boolean = false
    private var numColumns: Int = 1
    private var masonry: Boolean = false
    private var drawDistance: Int = 250 // dp

    // --- ScrollView-equivalent props ---
    private var scrollEnabled: Boolean = true
    private var pagingEnabled: Boolean = false
    private var snapToInterval: Float = 0f
    private var decelerationRateFactor: Float = 0.998f
    private var nestedScrollEnabled: Boolean = false
    private var showsVerticalScrollIndicator: Boolean = true
    private var showsHorizontalScrollIndicator: Boolean = true

    // --- Scroll tracking ---
    private var isDragging: Boolean = false
    private var isMomentumScrolling: Boolean = false
    private var scrollEventThrottle: Int = 16 // ms
    private var lastScrollEventTime: Long = 0

    // --- Item type mapping (set from JS) ---
    private val itemTypeMap = mutableMapOf<Int, Int>()

    // --- Snap helper ---
    private var pagerSnapHelper: PagerSnapHelper? = null

    // --- Refresh control ---
    private var swipeRefreshLayout: SwipeRefreshLayout? = null

    private val reactContext: ReactContext
        get() = context as ReactContext

    init {
        adapter = FlashListAdapter(reactContext, this)
        recyclerView.adapter = adapter

        // Set up default layout manager
        updateLayoutManager()

        // Add RecyclerView directly (no refresh layout initially)
        addView(recyclerView)

        // Set up scroll listener
        recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrollStateChanged(rv: RecyclerView, newState: Int) {
                when (newState) {
                    RecyclerView.SCROLL_STATE_DRAGGING -> {
                        if (!isDragging) {
                            isDragging = true
                            emitScrollEvent("onScrollBeginDrag")
                        }
                    }
                    RecyclerView.SCROLL_STATE_SETTLING -> {
                        if (isDragging) {
                            isDragging = false
                            emitScrollEvent("onScrollEndDrag")
                        }
                        if (!isMomentumScrolling) {
                            isMomentumScrolling = true
                            emitScrollEvent("onMomentumScrollBegin")
                        }
                    }
                    RecyclerView.SCROLL_STATE_IDLE -> {
                        if (isDragging) {
                            isDragging = false
                            emitScrollEvent("onScrollEndDrag")
                        }
                        if (isMomentumScrolling) {
                            isMomentumScrolling = false
                            emitScrollEvent("onMomentumScrollEnd")
                        }
                    }
                }
            }

            override fun onScrolled(rv: RecyclerView, dx: Int, dy: Int) {
                val now = System.currentTimeMillis()
                if (now - lastScrollEventTime >= scrollEventThrottle) {
                    lastScrollEventTime = now
                    emitScrollEvent("onScroll")
                }
                // Track velocity for sync/async decisions
                adapter.scrollVelocity = if (horizontal) dx.toFloat() else dy.toFloat()
            }
        })
    }

    // --- Layout manager management ---

    private fun updateLayoutManager() {
        val orientation = if (horizontal) RecyclerView.HORIZONTAL else RecyclerView.VERTICAL

        val lm: RecyclerView.LayoutManager = when {
            masonry -> {
                StaggeredGridLayoutManager(numColumns, orientation).apply {
                    reverseLayout = inverted
                }
            }
            numColumns > 1 -> {
                GridLayoutManager(context, numColumns, orientation, inverted).apply {
                    // Allow items to span multiple columns via overrideItemLayout
                    spanSizeLookup = object : GridLayoutManager.SpanSizeLookup() {
                        override fun getSpanSize(position: Int): Int {
                            return getItemSpan(position)
                        }
                    }
                }
            }
            else -> {
                LinearLayoutManager(context, orientation, inverted).apply {
                    // Extra layout space for pre-rendering beyond viewport
                    // This is set via overriding calculateExtraLayoutSpace
                }
            }
        }

        recyclerView.layoutManager = lm
        updateExtraLayoutSpace()
    }

    private fun updateExtraLayoutSpace() {
        val lm = recyclerView.layoutManager
        if (lm is LinearLayoutManager) {
            // LinearLayoutManager and GridLayoutManager support extra layout space
            // We override this in a subclass approach or via reflection
            // For now, use the default prefetch behavior
        }
    }

    // --- Prop setters (called from ViewManager) ---

    fun setHorizontal(value: Boolean) {
        if (horizontal != value) {
            horizontal = value
            updateLayoutManager()
        }
    }

    fun setInverted(value: Boolean) {
        if (inverted != value) {
            inverted = value
            updateLayoutManager()
        }
    }

    fun setNumColumns(value: Int) {
        val cols = maxOf(1, value)
        if (numColumns != cols) {
            numColumns = cols
            updateLayoutManager()
        }
    }

    fun setMasonry(value: Boolean) {
        if (masonry != value) {
            masonry = value
            updateLayoutManager()
        }
    }

    fun setDataLength(value: Int) {
        adapter.dataLength = value
    }

    fun setDrawDistance(value: Int) {
        drawDistance = value
        updateExtraLayoutSpace()
    }

    fun setScrollEnabled(value: Boolean) {
        scrollEnabled = value
        recyclerView.isNestedScrollingEnabled = value && nestedScrollEnabled
    }

    fun setNestedScrollEnabled(value: Boolean) {
        nestedScrollEnabled = value
        recyclerView.isNestedScrollingEnabled = value && scrollEnabled
    }

    fun setShowsVerticalScrollIndicator(value: Boolean) {
        showsVerticalScrollIndicator = value
        recyclerView.isVerticalScrollBarEnabled = value && !horizontal
    }

    fun setShowsHorizontalScrollIndicator(value: Boolean) {
        showsHorizontalScrollIndicator = value
        recyclerView.isHorizontalScrollBarEnabled = value && horizontal
    }

    fun setOverScrollMode(mode: String) {
        recyclerView.overScrollMode = when (mode) {
            "always" -> View.OVER_SCROLL_ALWAYS
            "never" -> View.OVER_SCROLL_NEVER
            else -> View.OVER_SCROLL_IF_CONTENT_SCROLLS
        }
    }

    fun setDecelerationRate(rate: Float) {
        // RecyclerView doesn't have a direct deceleration rate setter.
        // We store it for potential custom fling behavior.
        decelerationRateFactor = rate
    }

    fun setPagingEnabled(value: Boolean) {
        if (pagingEnabled != value) {
            pagingEnabled = value
            if (value) {
                if (pagerSnapHelper == null) {
                    pagerSnapHelper = PagerSnapHelper()
                }
                pagerSnapHelper?.attachToRecyclerView(recyclerView)
            } else {
                pagerSnapHelper?.attachToRecyclerView(null)
            }
        }
    }

    fun setScrollEventThrottle(value: Int) {
        scrollEventThrottle = maxOf(1, value)
    }

    fun setContentContainerPadding(left: Int, top: Int, right: Int, bottom: Int) {
        recyclerView.setPadding(left, top, right, bottom)
    }

    fun setRefreshing(value: Boolean) {
        swipeRefreshLayout?.isRefreshing = value
    }

    fun setRefreshEnabled(value: Boolean) {
        if (value && swipeRefreshLayout == null) {
            // Create SwipeRefreshLayout wrapping RecyclerView
            val srl = SwipeRefreshLayout(context).apply {
                layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
                setOnRefreshListener {
                    emitSimpleEvent("onRefresh")
                }
            }
            removeView(recyclerView)
            srl.addView(recyclerView)
            addView(srl, 0)
            swipeRefreshLayout = srl
        } else if (!value && swipeRefreshLayout != null) {
            val srl = swipeRefreshLayout!!
            srl.removeView(recyclerView)
            removeView(srl)
            addView(recyclerView, 0)
            swipeRefreshLayout = null
        }
    }

    // --- Imperative scroll methods ---

    fun scrollToOffset(offset: Float, animated: Boolean) {
        val px = PixelUtil.toPixelFromDIP(offset.toDouble()).toInt()
        if (animated) {
            recyclerView.smoothScrollBy(
                if (horizontal) px - getScrollOffset() else 0,
                if (!horizontal) px - getScrollOffset() else 0
            )
        } else {
            recyclerView.scrollBy(
                if (horizontal) px - getScrollOffset() else 0,
                if (!horizontal) px - getScrollOffset() else 0
            )
        }
    }

    fun scrollToIndex(index: Int, animated: Boolean, viewPosition: Float, viewOffset: Float) {
        val lm = recyclerView.layoutManager ?: return
        val offsetPx = PixelUtil.toPixelFromDIP(viewOffset.toDouble()).toInt()

        when (lm) {
            is LinearLayoutManager -> {
                if (animated) {
                    recyclerView.smoothScrollToPosition(index)
                } else {
                    lm.scrollToPositionWithOffset(index, offsetPx)
                }
            }
            is StaggeredGridLayoutManager -> {
                if (animated) {
                    recyclerView.smoothScrollToPosition(index)
                } else {
                    lm.scrollToPositionWithOffset(index, offsetPx)
                }
            }
        }
    }

    fun scrollToEnd(animated: Boolean) {
        val count = adapter.itemCount
        if (count > 0) {
            if (animated) {
                recyclerView.smoothScrollToPosition(count - 1)
            } else {
                recyclerView.scrollToPosition(count - 1)
            }
        }
    }

    // --- Cell lifecycle callbacks (called by adapter) ---

    fun onCellRecycled(holder: FlashListViewHolder, position: Int) {
        // Send event to JS to render content for this position
        val surfaceId = UIManagerHelper.getSurfaceId(this)
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)

        val event = Arguments.createMap().apply {
            putInt("cellKey", holder.reactContainer.id)
            putInt("index", position)
            putInt("viewType", holder.itemType)
            putBoolean("isSync", shouldRenderSync(position))
        }

        eventDispatcher?.dispatchEvent(
            OnCellRenderRequestEvent(surfaceId, id, event)
        )
    }

    fun onCellUnbound(holder: FlashListViewHolder) {
        // Optionally notify JS that a cell was recycled
    }

    fun getItemViewType(position: Int): Int {
        return itemTypeMap.getOrDefault(position, 0)
    }

    fun setItemType(position: Int, type: Int) {
        itemTypeMap[position] = type
    }

    fun getItemSpan(position: Int): Int {
        // Default span of 1, can be overridden from JS
        return 1
    }

    // --- Sync/async rendering decision ---

    private fun shouldRenderSync(position: Int): Boolean {
        val lm = recyclerView.layoutManager as? LinearLayoutManager ?: return false
        val firstVisible = lm.findFirstVisibleItemPosition()
        val lastVisible = lm.findLastVisibleItemPosition()

        // Sync if the item is within or adjacent to the visible range
        // and we're scrolling fast
        val isNearViewport = position in (firstVisible - 2)..(lastVisible + 2)
        val isFastScroll = Math.abs(adapter.scrollVelocity) > 50

        return isNearViewport && isFastScroll
    }

    // --- Scroll event helpers ---

    private fun getScrollOffset(): Int {
        return if (horizontal) {
            recyclerView.computeHorizontalScrollOffset()
        } else {
            recyclerView.computeVerticalScrollOffset()
        }
    }

    private fun getContentSize(): Pair<Int, Int> {
        val width = recyclerView.computeHorizontalScrollRange()
        val height = recyclerView.computeVerticalScrollRange()
        return Pair(width, height)
    }

    private fun emitScrollEvent(eventName: String) {
        val surfaceId = UIManagerHelper.getSurfaceId(this)
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)

        val offset = getScrollOffset()
        val (contentWidth, contentHeight) = getContentSize()
        val layoutWidth = recyclerView.width
        val layoutHeight = recyclerView.height

        val event = Arguments.createMap().apply {
            putMap("contentOffset", Arguments.createMap().apply {
                putDouble("x", if (horizontal) PixelUtil.toDIPFromPixel(offset.toFloat()).toDouble() else 0.0)
                putDouble("y", if (!horizontal) PixelUtil.toDIPFromPixel(offset.toFloat()).toDouble() else 0.0)
            })
            putMap("contentSize", Arguments.createMap().apply {
                putDouble("width", PixelUtil.toDIPFromPixel(contentWidth.toFloat()).toDouble())
                putDouble("height", PixelUtil.toDIPFromPixel(contentHeight.toFloat()).toDouble())
            })
            putMap("layoutMeasurement", Arguments.createMap().apply {
                putDouble("width", PixelUtil.toDIPFromPixel(layoutWidth.toFloat()).toDouble())
                putDouble("height", PixelUtil.toDIPFromPixel(layoutHeight.toFloat()).toDouble())
            })
        }

        eventDispatcher?.dispatchEvent(
            FlashListScrollEvent(surfaceId, id, eventName, event)
        )
    }

    private fun emitSimpleEvent(eventName: String) {
        val surfaceId = UIManagerHelper.getSurfaceId(this)
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
        eventDispatcher?.dispatchEvent(
            FlashListSimpleEvent(surfaceId, id, eventName)
        )
    }

    // --- Event classes ---

    class OnCellRenderRequestEvent(
        surfaceId: Int,
        viewTag: Int,
        private val payload: WritableMap
    ) : Event<OnCellRenderRequestEvent>(surfaceId, viewTag) {
        override fun getEventName(): String = "onCellRenderRequest"
        override fun getEventData(): WritableMap = payload
    }

    class FlashListScrollEvent(
        surfaceId: Int,
        viewTag: Int,
        private val name: String,
        private val payload: WritableMap
    ) : Event<FlashListScrollEvent>(surfaceId, viewTag) {
        override fun getEventName(): String = name
        override fun getEventData(): WritableMap = payload
    }

    class FlashListSimpleEvent(
        surfaceId: Int,
        viewTag: Int,
        private val name: String
    ) : Event<FlashListSimpleEvent>(surfaceId, viewTag) {
        override fun getEventName(): String = name
        override fun getEventData(): WritableMap = Arguments.createMap()
    }
}
