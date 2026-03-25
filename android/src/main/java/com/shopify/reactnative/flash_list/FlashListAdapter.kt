package com.shopify.reactnative.flash_list

import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.views.view.ReactViewGroup

/**
 * RecyclerView.Adapter that bridges native recycling with React Native's
 * Fabric rendering. Each ViewHolder contains a ReactViewGroup that JS
 * renders into via the cell registry pattern.
 *
 * The adapter does NOT render items itself — it notifies JS when a cell
 * needs content, and JS responds by mounting a React tree into the
 * ViewHolder's ReactViewGroup.
 */
class FlashListAdapter(
    private val reactContext: ReactContext,
    private val flashListView: FlashListView
) : RecyclerView.Adapter<FlashListViewHolder>() {

    /** Total number of data items (set from JS via props). */
    var dataLength: Int = 0
        set(value) {
            if (field != value) {
                field = value
                notifyDataSetChanged()
            }
        }

    /** Number of distinct view types (for recycling pools). */
    private var viewTypeCount: Int = 1

    /** Scroll velocity for sync/async render decision. */
    var scrollVelocity: Float = 0f

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FlashListViewHolder {
        val container = ReactViewGroup(reactContext).apply {
            layoutParams = RecyclerView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }
        return FlashListViewHolder(container).also {
            it.itemType = viewType
        }
    }

    override fun onBindViewHolder(holder: FlashListViewHolder, position: Int) {
        holder.bind(position)
        // Notify JS to render content for this cell
        flashListView.onCellRecycled(holder, position)
    }

    override fun onViewRecycled(holder: FlashListViewHolder) {
        super.onViewRecycled(holder)
        holder.unbind()
        // Notify JS that this cell was recycled
        flashListView.onCellUnbound(holder)
    }

    override fun getItemCount(): Int = dataLength

    override fun getItemViewType(position: Int): Int {
        return flashListView.getItemViewType(position)
    }
}
