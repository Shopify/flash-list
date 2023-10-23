import React from "react";
import {
  View,
  RefreshControl,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  StyleSheet,
  NativeScrollEvent,
} from "react-native";
import {
  BaseItemAnimator,
  DataProvider,
  ProgressiveListView,
  RecyclerListView,
  RecyclerListViewProps,
  WindowCorrectionConfig,
} from "recyclerlistview";
import StickyContainer, { StickyContainerProps } from "recyclerlistview/sticky";

import AutoLayoutView from "./native/auto-layout/AutoLayoutView";
import CellContainer from "./native/cell-container/CellContainer";
import { PureComponentWrapper } from "./PureComponentWrapper";
import GridLayoutProviderWithProps from "./GridLayoutProviderWithProps";
import CustomError from "./errors/CustomError";
import ExceptionList from "./errors/ExceptionList";
import WarningList from "./errors/Warnings";
import ViewabilityManager from "./viewability/ViewabilityManager";
import {
  FlashListProps,
  RenderTarget,
  RenderTargetOptions,
} from "./FlashListProps";
import {
  getCellContainerPlatformStyles,
  getFooterContainer,
  getItemAnimator,
  PlatformConfig,
} from "./native/config/PlatformHelper";
import {
  ContentStyleExplicit,
  getContentContainerPadding,
  hasUnsupportedKeysInContentContainerStyle,
  updateContentStyle,
} from "./utils/ContentContainerUtils";

interface StickyProps extends StickyContainerProps {
  children: any;
}
const StickyHeaderContainer =
  StickyContainer as React.ComponentClass<StickyProps>;

export interface FlashListState<T> {
  dataProvider: DataProvider;
  numColumns: number;
  layoutProvider: GridLayoutProviderWithProps<T>;
  data?: ReadonlyArray<T> | null;
  extraData?: ExtraData<unknown>;
  renderItem?: FlashListProps<T>["renderItem"];
}

interface ExtraData<T> {
  value?: T;
}

class FlashList<T> extends React.PureComponent<
  FlashListProps<T>,
  FlashListState<T>
> {
  private rlvRef?: RecyclerListView<RecyclerListViewProps, any>;
  private stickyContentContainerRef?: PureComponentWrapper;
  private listFixedDimensionSize = 0;
  private transformStyle = PlatformConfig.invertedTransformStyle;
  private transformStyleHorizontal =
    PlatformConfig.invertedTransformStyleHorizontal;

  private distanceFromWindow = 0;
  private contentStyle: ContentStyleExplicit = {
    paddingBottom: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };

  private loadStartTime = 0;
  private isListLoaded = false;
  private windowCorrectionConfig: WindowCorrectionConfig = {
    value: {
      windowShift: 0,
      startCorrection: 0,
      endCorrection: 0,
    },
    applyToItemScroll: true,
    applyToInitialOffset: true,
  };

  private postLoadTimeoutId?: ReturnType<typeof setTimeout>;
  private sizeWarningTimeoutId?: ReturnType<typeof setTimeout>;

  private isEmptyList = false;
  private viewabilityManager: ViewabilityManager<T>;

  private itemAnimator?: BaseItemAnimator;

  static defaultProps = {
    data: [],
    numColumns: 1,
  };

  constructor(props: FlashListProps<T>) {
    super(props);
    this.loadStartTime = Date.now();
    this.validateProps();
    if (props.estimatedListSize) {
      if (props.horizontal) {
        this.listFixedDimensionSize = props.estimatedListSize.height;
      } else {
        this.listFixedDimensionSize = props.estimatedListSize.width;
      }
    }
    this.distanceFromWindow =
      props.estimatedFirstItemOffset ?? ((props.ListHeaderComponent && 1) || 0);
    // eslint-disable-next-line react/state-in-constructor
    this.state = FlashList.getInitialMutableState(this);
    this.viewabilityManager = new ViewabilityManager(this);
    this.itemAnimator = getItemAnimator();
  }

  private validateProps() {
    if (this.props.onRefresh && typeof this.props.refreshing !== "boolean") {
      throw new CustomError(ExceptionList.refreshBooleanMissing);
    }
    if (
      Number(this.props.stickyHeaderIndices?.length) > 0 &&
      this.props.horizontal
    ) {
      throw new CustomError(ExceptionList.stickyWhileHorizontalNotSupported);
    }
    if (Number(this.props.numColumns) > 1 && this.props.horizontal) {
      throw new CustomError(ExceptionList.columnsWhileHorizontalNotSupported);
    }

    // `createAnimatedComponent` always passes a blank style object. To avoid warning while using AnimatedFlashList we've modified the check
    // `style` prop can be an array. So we need to validate every object in array. Check: https://github.com/Shopify/flash-list/issues/651
    if (
      __DEV__ &&
      Object.keys(StyleSheet.flatten(this.props.style ?? {})).length > 0
    ) {
      console.warn(WarningList.styleUnsupported);
    }
    if (
      hasUnsupportedKeysInContentContainerStyle(
        this.props.contentContainerStyle
      )
    ) {
      console.warn(WarningList.styleContentContainerUnsupported);
    }
  }

  // Some of the state variables need to update when props change
  static getDerivedStateFromProps<T>(
    nextProps: Readonly<FlashListProps<T>>,
    prevState: FlashListState<T>
  ): FlashListState<T> {
    const newState = { ...prevState };
    if (prevState.numColumns !== nextProps.numColumns) {
      newState.numColumns = nextProps.numColumns || 1;
      newState.layoutProvider = FlashList.getLayoutProvider<T>(
        newState.numColumns,
        nextProps
      );
    } else if (prevState.layoutProvider.updateProps(nextProps).hasExpired) {
      newState.layoutProvider = FlashList.getLayoutProvider<T>(
        newState.numColumns,
        nextProps
      );
    }

    // RLV retries to reposition the first visible item on layout provider change.
    // It's not required in our case so we're disabling it
    newState.layoutProvider.shouldRefreshWithAnchoring = Boolean(
      !prevState.layoutProvider?.hasExpired
    );

    if (nextProps.data !== prevState.data) {
      newState.data = nextProps.data;
      newState.dataProvider = prevState.dataProvider.cloneWithRows(
        nextProps.data as any[]
      );
      if (nextProps.renderItem !== prevState.renderItem) {
        newState.extraData = { ...prevState.extraData };
      }
    }
    if (nextProps.extraData !== prevState.extraData?.value) {
      newState.extraData = { value: nextProps.extraData };
    }
    newState.renderItem = nextProps.renderItem;
    return newState;
  }

  private static getInitialMutableState<T>(
    flashList: FlashList<T>
  ): FlashListState<T> {
    let getStableId: ((index: number) => string) | undefined;
    if (
      flashList.props.keyExtractor !== null &&
      flashList.props.keyExtractor !== undefined
    ) {
      getStableId = (index) =>
        // We assume `keyExtractor` function will never change from being `null | undefined` to defined and vice versa.
        // Similarly, data should never be `null | undefined` when `getStableId` is called.
        flashList.props.keyExtractor!(
          flashList.props.data![index],
          index
        ).toString();
    }
    return {
      data: null,
      layoutProvider: null!!,
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }, getStableId),
      numColumns: 0,
    };
  }

  // Using only grid layout provider as it can also act as a listview, sizeProvider is a function to support future overrides
  private static getLayoutProvider<T>(
    numColumns: number,
    flashListProps: FlashListProps<T>
  ) {
    return new GridLayoutProviderWithProps<T>(
      // max span or, total columns
      numColumns,
      (index, props) => {
        // type of the item for given index
        const type = props.getItemType?.(
          props.data!![index],
          index,
          props.extraData
        );
        return type || 0;
      },
      (index, props, mutableLayout) => {
        // span of the item at given index, item can choose to span more than one column
        props.overrideItemLayout?.(
          mutableLayout,
          props.data!![index],
          index,
          numColumns,
          props.extraData
        );
        return mutableLayout?.span ?? 1;
      },
      (index, props, mutableLayout) => {
        // estimated size of the item an given index
        props.overrideItemLayout?.(
          mutableLayout,
          props.data!![index],
          index,
          numColumns,
          props.extraData
        );
        return mutableLayout?.size;
      },
      flashListProps
    );
  }

  private onEndReached = () => {
    this.props.onEndReached?.();
  };

  private getRefreshControl = () => {
    if (this.props.onRefresh) {
      return (
        <RefreshControl
          refreshing={Boolean(this.props.refreshing)}
          progressViewOffset={this.props.progressViewOffset}
          onRefresh={this.props.onRefresh}
        />
      );
    }
  };

  componentDidMount() {
    if (this.props.data?.length === 0) {
      this.raiseOnLoadEventIfNeeded();
    }
  }

  componentWillUnmount() {
    this.viewabilityManager.dispose();
    this.clearPostLoadTimeout();
    if (this.sizeWarningTimeoutId !== undefined) {
      clearTimeout(this.sizeWarningTimeoutId);
    }
  }

  render() {
    this.isEmptyList = this.state.dataProvider.getSize() === 0;
    updateContentStyle(this.contentStyle, this.props.contentContainerStyle);

    const {
      drawDistance,
      removeClippedSubviews,
      stickyHeaderIndices,
      horizontal,
      onEndReachedThreshold,
      estimatedListSize,
      initialScrollIndex,
      style,
      contentContainerStyle,
      renderScrollComponent,
      ...restProps
    } = this.props;

    // RecyclerListView simply ignores if initialScrollIndex is set to 0 because it doesn't understand headers
    // Using initialOffset to force RLV to scroll to the right place
    const initialOffset =
      (this.isInitialScrollIndexInFirstRow() && this.distanceFromWindow) ||
      undefined;
    const finalDrawDistance =
      drawDistance === undefined
        ? PlatformConfig.defaultDrawDistance
        : drawDistance;

    return (
      <StickyHeaderContainer
        overrideRowRenderer={this.stickyOverrideRowRenderer}
        applyWindowCorrection={this.applyWindowCorrection}
        stickyHeaderIndices={stickyHeaderIndices}
        style={
          this.props.horizontal
            ? { ...this.getTransform() }
            : { flex: 1, overflow: "hidden", ...this.getTransform() }
        }
      >
        <ProgressiveListView
          {...restProps}
          ref={this.recyclerRef}
          layoutProvider={this.state.layoutProvider}
          dataProvider={this.state.dataProvider}
          rowRenderer={this.emptyRowRenderer}
          canChangeSize
          isHorizontal={Boolean(horizontal)}
          scrollViewProps={{
            onScrollBeginDrag: this.onScrollBeginDrag,
            onLayout: this.handleSizeChange,
            refreshControl:
              this.props.refreshControl || this.getRefreshControl(),

            // Min values are being used to suppress RLV's bounded exception
            style: { minHeight: 1, minWidth: 1 },
            contentContainerStyle: {
              backgroundColor: this.contentStyle.backgroundColor,

              // Required to handle a scrollview bug. Check: https://github.com/Shopify/flash-list/pull/187
              minHeight: 1,
              minWidth: 1,

              ...getContentContainerPadding(this.contentStyle, horizontal),
            },
            ...this.props.overrideProps,
          }}
          forceNonDeterministicRendering
          renderItemContainer={this.itemContainer}
          renderContentContainer={this.container}
          onEndReached={this.onEndReached}
          onEndReachedThresholdRelative={onEndReachedThreshold || undefined}
          extendedState={this.state.extraData}
          layoutSize={estimatedListSize}
          maxRenderAhead={3 * finalDrawDistance}
          finalRenderAheadOffset={finalDrawDistance}
          renderAheadStep={finalDrawDistance}
          initialRenderIndex={
            (!this.isInitialScrollIndexInFirstRow() && initialScrollIndex) ||
            undefined
          }
          initialOffset={initialOffset}
          onItemLayout={this.onItemLayout}
          onScroll={this.onScroll}
          onVisibleIndicesChanged={
            this.viewabilityManager.shouldListenToVisibleIndices
              ? this.viewabilityManager.onVisibleIndicesChanged
              : undefined
          }
          windowCorrectionConfig={this.getUpdatedWindowCorrectionConfig()}
          itemAnimator={this.itemAnimator}
          suppressBoundedSizeException
          externalScrollView={
            renderScrollComponent as RecyclerListViewProps["externalScrollView"]
          }
        />
      </StickyHeaderContainer>
    );
  }

  private onScrollBeginDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    this.recordInteraction();
    this.props.onScrollBeginDrag?.(event);
  };

  private onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    this.recordInteraction();
    this.viewabilityManager.updateViewableItems();
    this.props.onScroll?.(event);
  };

  private getUpdatedWindowCorrectionConfig() {
    // If the initial scroll index is in the first row then we're forcing RLV to use initialOffset and thus we need to disable window correction
    // This isn't clean but it's the only way to get RLV to scroll to the right place
    // TODO: Remove this when RLV fixes this. Current implementation will also fail if column span is overridden in the first row.
    if (this.isInitialScrollIndexInFirstRow()) {
      this.windowCorrectionConfig.applyToInitialOffset = false;
    } else {
      this.windowCorrectionConfig.applyToInitialOffset = true;
    }
    this.windowCorrectionConfig.value.windowShift = -this.distanceFromWindow;
    return this.windowCorrectionConfig;
  }

  private isInitialScrollIndexInFirstRow() {
    return (
      (this.props.initialScrollIndex ?? this.state.numColumns) <
      this.state.numColumns
    );
  }

  private validateListSize(event: LayoutChangeEvent) {
    const { height, width } = event.nativeEvent.layout;
    if (Math.floor(height) <= 1 || Math.floor(width) <= 1) {
      console.warn(WarningList.unusableRenderedSize);
    }
  }

  private handleSizeChange = (event: LayoutChangeEvent) => {
    this.validateListSize(event);
    const newSize = this.props.horizontal
      ? event.nativeEvent.layout.height
      : event.nativeEvent.layout.width;
    const oldSize = this.listFixedDimensionSize;
    this.listFixedDimensionSize = newSize;

    // >0 check is to avoid rerender on mount where it would be redundant
    if (oldSize > 0 && oldSize !== newSize) {
      this.rlvRef?.forceRerender();
    }
    if (this.props.onLayout) {
      this.props.onLayout(event);
    }
  };

  private container = (props: object, children: React.ReactNode[]) => {
    this.clearPostLoadTimeout();
    return (
      <>
        <PureComponentWrapper
          enabled={this.isListLoaded || children.length > 0 || this.isEmptyList}
          contentStyle={this.props.contentContainerStyle}
          horizontal={this.props.horizontal}
          header={this.props.ListHeaderComponent}
          extraData={this.state.extraData}
          headerStyle={this.props.ListHeaderComponentStyle}
          inverted={this.props.inverted}
          renderer={this.header}
        />
        <AutoLayoutView
          {...props}
          onBlankAreaEvent={this.props.onBlankArea}
          onLayout={this.updateDistanceFromWindow}
          disableAutoLayout={this.props.disableAutoLayout}
        >
          {children}
        </AutoLayoutView>
        {this.isEmptyList
          ? this.getValidComponent(this.props.ListEmptyComponent)
          : null}
        <PureComponentWrapper
          enabled={this.isListLoaded || children.length > 0 || this.isEmptyList}
          contentStyle={this.props.contentContainerStyle}
          horizontal={this.props.horizontal}
          header={this.props.ListFooterComponent}
          extraData={this.state.extraData}
          headerStyle={this.props.ListFooterComponentStyle}
          inverted={this.props.inverted}
          renderer={this.footer}
        />
        {this.getComponentForHeightMeasurement()}
      </>
    );
  };

  private itemContainer = (props: any, parentProps: any) => {
    const CellRendererComponent =
      this.props.CellRendererComponent ?? CellContainer;
    return (
      <CellRendererComponent
        {...props}
        style={{
          ...props.style,
          flexDirection: this.props.horizontal ? "row" : "column",
          alignItems: "stretch",
          ...this.getTransform(),
          ...getCellContainerPlatformStyles(this.props.inverted!!, parentProps),
        }}
        index={parentProps.index}
      >
        <PureComponentWrapper
          extendedState={parentProps.extendedState}
          internalSnapshot={parentProps.internalSnapshot}
          data={parentProps.data}
          arg={parentProps.index}
          renderer={this.getCellContainerChild}
        />
      </CellRendererComponent>
    );
  };

  private updateDistanceFromWindow = (event: LayoutChangeEvent) => {
    const newDistanceFromWindow = this.props.horizontal
      ? event.nativeEvent.layout.x
      : event.nativeEvent.layout.y;

    if (this.distanceFromWindow !== newDistanceFromWindow) {
      this.distanceFromWindow = newDistanceFromWindow;
      this.windowCorrectionConfig.value.windowShift = -this.distanceFromWindow;
      this.viewabilityManager.updateViewableItems();
    }
  };

  private getTransform() {
    const transformStyle = this.props.horizontal
      ? this.transformStyleHorizontal
      : this.transformStyle;
    return (this.props.inverted && transformStyle) || undefined;
  }

  private separator = (index: number) => {
    // Make sure we have data and don't read out of bounds
    if (
      this.props.data === null ||
      this.props.data === undefined ||
      index + 1 >= this.props.data.length
    ) {
      return null;
    }

    const leadingItem = this.props.data[index];
    const trailingItem = this.props.data[index + 1];

    const props = {
      leadingItem,
      trailingItem,
      // TODO: Missing sections as we don't have this feature implemented yet. Implement section, leadingSection and trailingSection.
      // https://github.com/facebook/react-native/blob/8bd3edec88148d0ab1f225d2119435681fbbba33/Libraries/Lists/VirtualizedSectionList.js#L285-L294
    };
    const Separator = this.props.ItemSeparatorComponent;
    return Separator && <Separator {...props} />;
  };

  private header = () => {
    return (
      <>
        <View
          style={{
            paddingTop: this.contentStyle.paddingTop,
            paddingLeft: this.contentStyle.paddingLeft,
          }}
        />

        <View
          style={[this.props.ListHeaderComponentStyle, this.getTransform()]}
        >
          {this.getValidComponent(this.props.ListHeaderComponent)}
        </View>
      </>
    );
  };

  private footer = () => {
    /** The web version of CellContainer uses a div directly which doesn't compose styles the way a View does.
     * We will skip using CellContainer on web to avoid this issue. `getFooterContainer` on web will
     * return a View. */
    const FooterContainer = getFooterContainer() ?? CellContainer;
    return (
      <>
        <FooterContainer
          index={-1}
          style={[this.props.ListFooterComponentStyle, this.getTransform()]}
        >
          {this.getValidComponent(this.props.ListFooterComponent)}
        </FooterContainer>
        <View
          style={{
            paddingBottom: this.contentStyle.paddingBottom,
            paddingRight: this.contentStyle.paddingRight,
          }}
        />
      </>
    );
  };

  private getComponentForHeightMeasurement = () => {
    return this.props.horizontal &&
      !this.props.disableHorizontalListHeightMeasurement &&
      !this.isListLoaded &&
      this.state.dataProvider.getSize() > 0 ? (
      <View style={{ opacity: 0 }} pointerEvents="none">
        {this.rowRendererWithIndex(
          Math.min(this.state.dataProvider.getSize() - 1, 1),
          RenderTargetOptions.Measurement
        )}
      </View>
    ) : null;
  };

  private getValidComponent(
    component: React.ComponentType | React.ReactElement | null | undefined
  ) {
    const PassedComponent = component;
    return (
      (React.isValidElement(PassedComponent) && PassedComponent) ||
      (PassedComponent && <PassedComponent />) ||
      null
    );
  }

  private applyWindowCorrection = (
    _: any,
    __: any,
    correctionObject: { windowShift: number }
  ) => {
    correctionObject.windowShift = -this.distanceFromWindow;
    this.stickyContentContainerRef?.setEnabled(this.isStickyEnabled);
  };

  private rowRendererSticky = (index: number) => {
    return this.rowRendererWithIndex(index, RenderTargetOptions.StickyHeader);
  };

  private rowRendererWithIndex = (index: number, target: RenderTarget) => {
    // known issue: expected to pass separators which isn't available in RLV
    return this.props.renderItem?.({
      item: this.props.data![index],
      index,
      target,
      extraData: this.state.extraData?.value,
    }) as JSX.Element;
  };

  /**
   * This will prevent render item calls unless data changes.
   * Output of this method is received as children object so returning null here is no issue as long as we handle it inside our child container.
   * @module getCellContainerChild acts as the new rowRenderer and is called directly from our child container.
   */
  private emptyRowRenderer = () => {
    return null;
  };

  private getCellContainerChild = (index: number) => {
    return (
      <>
        <View
          style={{
            flexDirection:
              this.props.horizontal || this.props.numColumns === 1
                ? "column"
                : "row",
          }}
        >
          {this.rowRendererWithIndex(index, RenderTargetOptions.Cell)}
        </View>
        {this.separator(index)}
      </>
    );
  };

  private recyclerRef = (ref: any) => {
    this.rlvRef = ref;
  };

  private stickyContentRef = (ref: any) => {
    this.stickyContentContainerRef = ref;
  };

  private stickyOverrideRowRenderer = (
    _: any,
    __: any,
    index: number,
    ___: any
  ) => {
    return (
      <PureComponentWrapper
        ref={this.stickyContentRef}
        enabled={this.isStickyEnabled}
        arg={index}
        renderer={this.rowRendererSticky}
      />
    );
  };

  private get isStickyEnabled() {
    const currentOffset = this.rlvRef?.getCurrentScrollOffset() || 0;
    return currentOffset >= this.distanceFromWindow;
  }

  private onItemLayout = (index: number) => {
    // Informing the layout provider about change to an item's layout. It already knows the dimensions so there's not need to pass them.
    this.state.layoutProvider.reportItemLayout(index);
    this.raiseOnLoadEventIfNeeded();
  };

  private raiseOnLoadEventIfNeeded = () => {
    if (!this.isListLoaded) {
      this.isListLoaded = true;
      this.props.onLoad?.({
        elapsedTimeInMs: Date.now() - this.loadStartTime,
      });
      this.runAfterOnLoad();
    }
  };

  private runAfterOnLoad = () => {
    if (this.props.estimatedItemSize === undefined) {
      this.sizeWarningTimeoutId = setTimeout(() => {
        const averageItemSize = Math.floor(
          this.state.layoutProvider.averageItemSize
        );
        console.warn(
          WarningList.estimatedItemSizeMissingWarning.replace(
            "@size",
            averageItemSize.toString()
          )
        );
      }, 1000);
    }
    this.postLoadTimeoutId = setTimeout(() => {
      // This force update is required to remove dummy element rendered to measure horizontal list height when  the list doesn't update on its own.
      // In most cases this timeout will never be triggered because list usually updates atleast once and this timeout is cleared on update.
      if (this.props.horizontal) {
        this.forceUpdate();
      }
    }, 500);
  };

  private clearPostLoadTimeout = () => {
    if (this.postLoadTimeoutId !== undefined) {
      clearTimeout(this.postLoadTimeoutId);
      this.postLoadTimeoutId = undefined;
    }
  };

  /**
   * Disables recycling for the next frame so that layout animations run well.
   * Warning: Avoid this when making large changes to the data as the list might draw too much to run animations. Single item insertions/deletions
   * should be good. With recycling paused the list cannot do much optimization.
   * The next render will run as normal and reuse items.
   */
  public prepareForLayoutAnimationRender(): void {
    if (
      this.props.keyExtractor === null ||
      this.props.keyExtractor === undefined
    ) {
      console.warn(WarningList.missingKeyExtractor);
    } else {
      this.rlvRef?.prepareForLayoutAnimationRender();
    }
  }

  public scrollToEnd(params?: { animated?: boolean | null | undefined }) {
    this.rlvRef?.scrollToEnd(Boolean(params?.animated));
  }

  public scrollToIndex(params: {
    animated?: boolean | null | undefined;
    index: number;
    viewOffset?: number | undefined;
    viewPosition?: number | undefined;
  }) {
    const layout = this.rlvRef?.getLayout(params.index);
    const listSize = this.rlvRef?.getRenderedSize();

    if (layout && listSize) {
      const itemOffset = this.props.horizontal ? layout.x : layout.y;
      const fixedDimension = this.props.horizontal
        ? listSize.width
        : listSize.height;
      const itemSize = this.props.horizontal ? layout.width : layout.height;
      const scrollOffset =
        Math.max(
          0,
          itemOffset - (params.viewPosition ?? 0) * (fixedDimension - itemSize)
        ) - (params.viewOffset ?? 0);
      this.rlvRef?.scrollToOffset(
        scrollOffset,
        scrollOffset,
        Boolean(params.animated),
        true
      );
    }
  }

  public scrollToItem(params: {
    animated?: boolean | null | undefined;
    item: any;
    viewPosition?: number | undefined;
    viewOffset?: number | undefined;
  }) {
    const index = this.props.data?.indexOf(params.item) ?? -1;
    if (index >= 0) {
      this.scrollToIndex({ ...params, index });
    }
  }

  public scrollToOffset(params: {
    animated?: boolean | null | undefined;
    offset: number;
  }) {
    const x = this.props.horizontal ? params.offset : 0;
    const y = this.props.horizontal ? 0 : params.offset;
    this.rlvRef?.scrollToOffset(x, y, Boolean(params.animated));
  }

  public getScrollableNode(): number | null {
    return this.rlvRef?.getScrollableNode?.() || null;
  }

  /**
   * Allows access to internal recyclerlistview. This is useful for enabling access to its public APIs.
   * Warning: We may swap recyclerlistview for something else in the future. Use with caution.
   */
  /* eslint-disable @typescript-eslint/naming-convention */
  public get recyclerlistview_unsafe() {
    return this.rlvRef;
  }

  /**
   * Specifies how far the first item is from top of the list. This would normally be a sum of header size and top/left padding applied to the list.
   */
  public get firstItemOffset() {
    return this.distanceFromWindow;
  }

  /**
   * FlashList will skip using layout cache on next update. Can be useful when you know the layout will change drastically for example, orientation change when used as a carousel.
   */
  public clearLayoutCacheOnUpdate() {
    this.state.layoutProvider.markExpired();
  }

  /**
   * Tells the list an interaction has occurred, which should trigger viewability calculations, e.g. if waitForInteractions is true and the user has not scrolled.
   * This is typically called by taps on items or by navigation actions.
   */
  public recordInteraction = () => {
    this.viewabilityManager.recordInteraction();
  };
}

export default FlashList;
