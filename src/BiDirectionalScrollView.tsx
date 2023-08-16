// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/**
 * This file comes courtsey of steuerbot and their work on react-native-bidirectional-flatlist. Huge thanks for helping
 * solve this problem with fling!
 * */

import React, { Component, forwardRef } from "react";
import {
  PixelRatio,
  Platform,
  ScrollView as ScrollViewRN,
  ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";

import { BidirectionalList } from "./BidirectionalList";
import type { ShiftFunction } from "./types";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ScrollViewRNRaw: Component<ScrollViewProps> = ScrollViewRN.render().type;

export class ScrollViewComponent extends ScrollViewRNRaw {
  constructor(props: ScrollViewProps) {
    super(props);
  }

  shift: ShiftFunction = ({
    offset,
    height,
  }: {
    offset: number;
    height: number;
  }) => {
    this._scrollViewRef.setNativeProps({
      shiftOffset: PixelRatio.getPixelSizeForLayoutSize(offset),
      shiftHeight: PixelRatio.getPixelSizeForLayoutSize(height),
    });
  };

  render() {
    const NativeDirectionalScrollView = BidirectionalFlatlist;
    const NativeDirectionalScrollContentView = View;

    const contentContainerStyle = [this.props.contentContainerStyle];

    const contentSizeChangeProps =
      this.props.onContentSizeChange == null
        ? null
        : {
            onLayout: this._handleContentOnLayout,
          };

    const { stickyHeaderIndices } = this.props;
    const children = this.props.children;

    const hasStickyHeaders =
      Array.isArray(stickyHeaderIndices) && stickyHeaderIndices.length > 0;

    const contentContainer = (
      <NativeDirectionalScrollContentView
        {...contentSizeChangeProps}
        ref={this._setInnerViewRef}
        style={contentContainerStyle}
        removeClippedSubviews={
          // Subview clipping causes issues with sticky headers on Android and
          // would be hard to fix properly in a performant way.
          Platform.OS === "android" && hasStickyHeaders
            ? false
            : this.props.removeClippedSubviews
        }
        collapsable={false}
      >
        {children}
      </NativeDirectionalScrollContentView>
    );

    const alwaysBounceHorizontal =
      this.props.alwaysBounceHorizontal === undefined
        ? this.props.horizontal
        : this.props.alwaysBounceHorizontal;

    const alwaysBounceVertical =
      this.props.alwaysBounceVertical === undefined
        ? !this.props.horizontal
        : this.props.alwaysBounceVertical;

    const baseStyle = styles.baseVertical;
    const props = {
      ...this.props,
      alwaysBounceHorizontal,
      alwaysBounceVertical,
      style: StyleSheet.compose(baseStyle, this.props.style),
      // Override the onContentSizeChange from props, since this event can
      // bubble up from TextInputs
      onContentSizeChange: null,
      onLayout: this._handleLayout,
      onMomentumScrollBegin: this._handleMomentumScrollBegin,
      onMomentumScrollEnd: this._handleMomentumScrollEnd,
      onResponderGrant: this._handleResponderGrant,
      onResponderReject: this._handleResponderReject,
      onResponderRelease: this._handleResponderRelease,
      onResponderTerminationRequest: this._handleResponderTerminationRequest,
      onScrollBeginDrag: this._handleScrollBeginDrag,
      onScrollEndDrag: this._handleScrollEndDrag,
      onScrollShouldSetResponder: this._handleScrollShouldSetResponder,
      onStartShouldSetResponder: this._handleStartShouldSetResponder,
      onStartShouldSetResponderCapture:
        this._handleStartShouldSetResponderCapture,
      onTouchEnd: this._handleTouchEnd,
      onTouchMove: this._handleTouchMove,
      onTouchStart: this._handleTouchStart,
      onTouchCancel: this._handleTouchCancel,
      onScroll: this._handleScroll,
      scrollEventThrottle: hasStickyHeaders
        ? 1
        : this.props.scrollEventThrottle,
      sendMomentumEvents: Boolean(
        this.props.onMomentumScrollBegin || this.props.onMomentumScrollEnd
      ),
      // default to true
      snapToStart: this.props.snapToStart !== false,
      // default to true
      snapToEnd: this.props.snapToEnd !== false,
      // pagingEnabled is overridden by snapToInterval / snapToOffsets
      pagingEnabled: Platform.select({
        // on iOS, pagingEnabled must be set to false to have snapToInterval / snapToOffsets work
        ios:
          this.props.pagingEnabled === true &&
          this.props.snapToInterval == null &&
          this.props.snapToOffsets == null,
        // on Android, pagingEnabled must be set to true to have snapToInterval / snapToOffsets work
        android:
          this.props.pagingEnabled === true ||
          this.props.snapToInterval != null ||
          this.props.snapToOffsets != null,
      }),
    };

    // const { decelerationRate } = this.props;
    // if (decelerationRate != null) {
    //   props.decelerationRate = processDecelerationRate(decelerationRate);
    // }

    return (
      <NativeDirectionalScrollView {...props} ref={this._setNativeRef}>
        {contentContainer}
      </NativeDirectionalScrollView>
    );
  }
}

const styles = StyleSheet.create({
  baseVertical: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: "column",
    overflow: "scroll",
  },
});

export type ScrollViewType = typeof ScrollViewRN & {
  shift: (options: { offset: number; height: number }) => void;
};

// eslint-disable-next-line react/display-name
export const BidirectionalScrollView: ScrollViewType = forwardRef<
  ScrollViewType,
  ScrollViewProps
>((props, ref) => {
  return <ScrollViewComponent {...props} ref={ref} />;
});
