package com.shopify.reactnative.flash_list

import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.facebook.react.views.view.ReactViewGroup

/**
 * ViewHolder that hosts a React Native view tree rendered by Fabric.
 *
 * The ReactViewGroup inside is managed by the JS side — when the adapter binds
 * a new index to this holder, we send an event to JS which renders the
 * appropriate content into this container. Yoga handles the child layout with
 * EXACTLY specs; we just need to size the container correctly.
 */
class FlashListViewHolder(
    val reactContainer: ReactViewGroup
) : RecyclerView.ViewHolder(reactContainer) {

    /** The data index currently bound to this holder, or -1 if unbound. */
    var boundIndex: Int = -1

    /** Whether this holder has received content from JS. */
    var hasContent: Boolean = false

    /** The item type string/number for recycling pool matching. */
    var itemType: Int = 0

    /**
     * Bind this holder to a new data index. The adapter will request JS to
     * render content for this index into our reactContainer.
     */
    fun bind(index: Int) {
        boundIndex = index
    }

    /**
     * Unbind — called when the holder is recycled. We don't remove children
     * here because React/Fabric manages the view tree lifecycle.
     */
    fun unbind() {
        boundIndex = -1
        hasContent = false
    }
}
