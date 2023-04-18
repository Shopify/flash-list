/**
 * This file comes courtsey of steuerbot and their work on react-native-bidirectional-flatlist. Huge thanks for helping
 * solve this problem with fling!
 * */

package com.shopify.reactnative.flash_list;

import android.content.Context;
import android.util.Log;
import android.view.View;
import android.widget.OverScroller;

import androidx.annotation.Nullable;
import androidx.core.view.ViewCompat;

import com.facebook.common.logging.FLog;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.views.scroll.ReactScrollView;

import java.lang.reflect.Field;

public class DoubleSidedScrollView extends ReactScrollView {

    private OverScroller mScroller;
    private boolean mTriedToGetScroller;
    protected double mShiftHeight = 0;
    protected double mShiftOffset = 0;

    public DoubleSidedScrollView(Context context) {
        super(context, null);
    }

    public void setShiftHeight(double shiftHeight) {
        mShiftHeight = shiftHeight;
        Log.d("ScrollView", "set shiftHeight " + shiftHeight);
    }

    public void setShiftOffset(double shiftOffset) {
        mShiftOffset = shiftOffset;
        adjustOverscroller();
        Log.d("ScrollView", "set shiftOffset " + shiftOffset);
    }

    protected void adjustOverscroller() {
        int scrollWindowHeight = getHeight() - getPaddingBottom() - getPaddingTop();
        if(mShiftOffset != 0) {
            // correct
            scrollTo(0, getScrollY() + (int) mShiftOffset);
            if(getOverScrollerFromParent() != null && !getOverScrollerFromParent().isFinished()) {

                // get current directed velocity from scroller
                int direction = getOverScrollerFromParent().getFinalY() - getOverScrollerFromParent().getStartY() > 0 ? 1 : -1;
                float velocity = getOverScrollerFromParent().getCurrVelocity() * direction;
                // stop and restart animation again
                getOverScrollerFromParent().abortAnimation();
                mScroller.fling(
                        getScrollX(), // startX
                        getScrollY(), // startY
                        0, // velocityX
                        (int)velocity, // velocityY
                        0, // minX
                        0, // maxX
                        0, // minY
                        Integer.MAX_VALUE, // maxY
                        0, // overX
                        scrollWindowHeight / 2 // overY
                );
                ViewCompat.postInvalidateOnAnimation(this);
            }
        }
        mShiftHeight = 0;
        mShiftOffset = 0;
    }

    @Override
    public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
        super.onLayoutChange(v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom);
        adjustOverscroller();
    }

    @Nullable
    private OverScroller getOverScrollerFromParent() {
        if(mTriedToGetScroller) {
            return mScroller;
        }
        mTriedToGetScroller = true;
        Field field = null;
        try {
            field = ReactScrollView.class.getDeclaredField("mScroller");
            field.setAccessible(true);
        } catch (NoSuchFieldException e) {
            FLog.w(
                    "ScrollView",
                    "Failed to get mScroller field for ScrollView! "
                            + "This app will exhibit the bounce-back scrolling bug :(");
        }

        if(field != null) {
            Object scrollerValue = null;
            try {
                scrollerValue = field.get(this);
                if (scrollerValue instanceof OverScroller) {
                    mScroller = (OverScroller) scrollerValue;
                } else {
                    FLog.w(
                            ReactConstants.TAG,
                            "Failed to cast mScroller field in ScrollView (probably due to OEM changes to AOSP)! "
                                    + "This app will exhibit the bounce-back scrolling bug :(");
                    mScroller = null;
                }
            } catch (IllegalAccessException e) {
                throw new RuntimeException("Failed to get mScroller from ScrollView!", e);
            }
        }
        return mScroller;
    }
}
