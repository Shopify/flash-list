import React from "react";
import {
  View,
  RefreshControl,
  FlatListProps,
  LayoutChangeEvent,
  ViewStyle,
  ColorValue,
} from "react-native";
import {
  DataProvider,
  ProgressiveListView,
  RecyclerListView,
  RecyclerListViewProps,
} from "recyclerlistview";
import StickyContainer, { StickyContainerProps } from "recyclerlistview/sticky";

import AutoLayoutView, { BlankAreaEventHandler } from "./AutoLayoutView";
import ItemContainer from "./CellContainer";
import WrapperComponent, { PureComponentWrapper } from "./WrapperComponent";
import GridLayoutProviderWithProps from "./GridLayoutProviderWithProps";
import CustomError from "./errors/CustomError";
import ExceptionList from "./errors/ExceptionList";
import WarningList from "./errors/Warnings";

interface StickyProps extends StickyContainerProps {
  children: any;
}
const StickyHeaderContainer =
  StickyContainer as React.ComponentClass<StickyProps>;

export interface FlashListProps<T> extends FlatListProps<T> {
  // TODO: This is to make eslint silent. Out prettier and lint rules are conflicting.
  /**
   * Average or median size for elements in the list. Doesn't have to be very accurate but a good estimate can work better.
   * For vertical lists provide average height and for horizontal average width.
   */
  estimatedItemSize: number;

  /**
   * Visible height and width of the list. This is not the scroll content size.
   */
  estimatedListSize?: { height: number; width: number };

  /**
   * Specifies how far the first item is drawn from start of the list window or, offset of the first item of the list (not the header).
   * Needed if you're using initialScrollIndex prop. Before the initial draw the list cannot figure out the size of header or, any special margin/padding that might have been applied
   * using header styles etc.
   * If this isn't provided initialScrollIndex might not scroll to the provided index.
   */
  estimatedFirstItemOffset?: number;

  /**
   * Draw distance for advanced rendering (in dp/px)
   */
  drawDistance?: number;

  /**
   * Allows developers to override type of items. This will improve recycling if you have different types of items in the list
   * Right type will be used for the right item. Default type is 0
   * If you don't want to change for an indexes just return undefined.
   * Performance: This method is called very frequently. Keep it fast.
   */
  overrideItemType?: (
    item: T,
    index: number,
    extraData?: any
  ) => string | number | undefined;

  /**
   * with numColumns > 1 you can choose to increase span of some of the items. You can also modify estimated height for some items.
   * Modify the given layout. Do not return.
   * Performance: This method is called very frequently. Keep it fast.
   */
  overrideItemLayout?: (
    layout: { span?: number; size?: number },
    item: T,
    index: number,
    maxColumns: number,
    extraData?: any
  ) => void;

  /**
   * For debugging and exception use cases, internal props will be overriden with these values if used
   */
  overrideProps?: object;

  /**
   * Computes blank space that is visible to the user during scroll or list load. If list doesn't have enough items to fill the screen even then this will be raised.
   * Values reported: {
   *    offsetStart -> visible blank space on top of the screen (while going up). If value is greater than 0 then it's visible to user.
   *    offsetEnd -> visible blank space at the end of the screen (while going down). If value is greater than 0 then it's visible to user.
   *    blankArea -> max(offsetStart, offsetEnd) use this directly and look for values > 0
   * }
   * Please note that this event isn't synced with onScroll event but works with native onDraw/layoutSubviews. Events with values > 0 are blanks.
   * This event is raised even when there is no visible blank with negative values for extensibility however, for most use cases check blankArea > 0 and use the value.
   */
  onBlankArea?: BlankAreaEventHandler;

  contentContainerStyle?: ContentStyle;

  /**
   * This event is raised once the list has drawn items on the screen. It also reports @param elapsedTimeInMs which is the time it took to draw the items.
   * This is required because FlashList doesn't render items in the first cycle. Items are drawn after it measures itself at the end of first render.
   * If you're using ListEmptyComponent, this event is raised as soon as ListEmptyComponent is rendered.
   */
  onLoad?: (info: { elapsedTimeInMs: number }) => void;
}

export interface FlashListState<T> {
  dataProvider: DataProvider;
  numColumns: number;
  layoutProvider: GridLayoutProviderWithProps<FlashListProps<T>>;
  data?: ReadonlyArray<T> | null;
  extraData?: ExtraData<unknown>;
}

interface ExtraData<T> {
  value?: T;
}

export interface ContentStyle {
  backgroundColor?: ColorValue;
  paddingTop?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  padding?: string | number;
  paddingVertical?: string | number;
  paddingHorizontal?: string | number;
}

class FlashList<T> extends React.PureComponent<
  FlashListProps<T>,
  FlashListState<T>
> {
  private rlvRef?: RecyclerListView<RecyclerListViewProps, any>;
  private stickyContentContainerRef?: PureComponentWrapper;
  private listFixedDimensionSize = 0;
  private transformStyle = { transform: [{ scaleY: -1 }] };
  private distanceFromWindow = 0;
  private contentStyle: ContentStyle = {};
  private loadStartTime = 0;
  private isListLoaded = false;

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
    this.distanceFromWindow = props.estimatedFirstItemOffset || 0;
    // eslint-disable-next-line react/state-in-constructor
    this.state = FlashList.getInitialMutableState();
  }

  private validateProps() {
    if (this.props.onRefresh && typeof this.props.refreshing !== "boolean") {
      throw new CustomError(ExceptionList.refreshBooleanMissing);
    }
    if (!(this.props.estimatedItemSize > 0)) {
      throw new CustomError(ExceptionList.estimatedItemSizeMissing);
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
    if (Object.keys(this.props.style || {}).length > 0) {
      console.warn(WarningList.styleUnsupported);
    }
    const contentStyleInfo = this.getContentContainerInfo();
    if (contentStyleInfo.unsupportedKeys) {
      console.warn(WarningList.styleContentContainerUnsupported);
    }
    if (contentStyleInfo.paddingIgnored) {
      console.warn(WarningList.styleUnsupportedPaddingType);
    }
  }

  // Some of the state variables need to update when props change
  static getDerivedStateFromProps<T>(
    nextProps: FlashListProps<T>,
    prevState: FlashListState<T>
  ): FlashListState<T> {
    const newState = { ...prevState };
    if (prevState.numColumns !== nextProps.numColumns) {
      newState.numColumns = nextProps.numColumns || 1;
      newState.layoutProvider = FlashList.getLayoutProvider<T>(
        newState.numColumns,
        nextProps
      );
    }
    if (nextProps.data !== prevState.data) {
      newState.data = nextProps.data;
      newState.dataProvider = prevState.dataProvider.cloneWithRows(
        nextProps.data as any[]
      );
      newState.extraData = { ...prevState.extraData };
    }
    if (nextProps.extraData !== prevState.extraData?.value) {
      newState.extraData = { value: nextProps.extraData };
    }
    newState.layoutProvider.updateProps(nextProps);
    return newState;
  }

  private static getInitialMutableState<T>(): FlashListState<T> {
    return {
      data: null,
      layoutProvider: null!!,
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }),
      numColumns: 0,
    };
  }

  // Using only grid layout provider as it can also act as a listview, sizeProvider is a function to support future overrides
  private static getLayoutProvider<T>(
    numColumns: number,
    props: FlashListProps<T>
  ) {
    return new GridLayoutProviderWithProps<FlashListProps<T>>(
      // max span or, total columns
      numColumns,
      (index, props) => {
        // type of the item for given index
        const type = props.overrideItemType?.(
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
        return mutableLayout?.span || 1;
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
        return mutableLayout?.size || props.estimatedItemSize;
      },
      props
    );
  }

  private onEndReached = () => {
    // known issue: RLV doesn't report distanceFromEnd
    this.props.onEndReached?.({ distanceFromEnd: 0 });
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

  render() {
    if (this.state.dataProvider.getSize() === 0) {
      return (
        <View style={{ flex: 1 }}>
          {this.header()}
          {this.props.ListEmptyComponent || null}
        </View>
      );
    }
    this.contentStyle = this.getContentContainerInfo().style;

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
      ...restProps
    } = this.props;

    const finalDrawDistance = drawDistance === undefined ? 250 : drawDistance;

    return (
      <StickyHeaderContainer
        overrideRowRenderer={this.stickyRowRenderer}
        applyWindowCorrection={this.applyWindowCorrection}
        stickyHeaderIndices={stickyHeaderIndices}
      >
        <ProgressiveListView
          {...restProps}
          ref={this.recyclerRef}
          layoutProvider={this.state.layoutProvider}
          dataProvider={this.state.dataProvider}
          rowRenderer={this.rowRenderer}
          canChangeSize
          isHorizontal={Boolean(horizontal)}
          scrollViewProps={{
            onLayout: this.handleSizeChange,
            refreshControl:
              this.props.refreshControl || this.getRefreshControl(),
            style: { ...this.getTransform() },
            contentContainerStyle: {
              backgroundColor: this.contentStyle.backgroundColor,
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
          initialRenderIndex={initialScrollIndex || undefined}
          onItemLayout={this.raiseOnLoadEventIfNeeded}
        />
      </StickyHeaderContainer>
    );
  }

  private handleSizeChange = (event: LayoutChangeEvent) => {
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
    return (
      <>
        <PureComponentWrapper
          enabled={children.length > 0}
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
          onBlankAreaEvent={(event) => {
            this.props.onBlankArea?.(event);
          }}
          onLayout={(event) => {
            this.distanceFromWindow = this.props.horizontal
              ? event.nativeEvent.layout.x
              : event.nativeEvent.layout.y;
          }}
        >
          {children}
        </AutoLayoutView>
        <PureComponentWrapper
          enabled={children.length > 0}
          contentStyle={this.props.contentContainerStyle}
          horizontal={this.props.horizontal}
          header={this.props.ListFooterComponent}
          extraData={this.state.extraData}
          headerStyle={this.props.ListFooterComponentStyle}
          inverted={this.props.inverted}
          renderer={this.footer}
        />
      </>
    );
  };

  private itemContainer = (
    props: any,
    parentProps: any,
    children?: React.ReactNode
  ) => {
    return (
      <ItemContainer
        {...props}
        style={{
          ...props.style,
          flexDirection: this.props.horizontal ? "row" : "column",
          alignItems: "stretch",
          ...this.getTransform(),
        }}
        index={parentProps.index}
      >
        <WrapperComponent
          extendedState={parentProps.extendedState}
          internalSnapshot={parentProps.internalSnapshot}
          dataHasChanged={parentProps.dataHasChanged}
          data={parentProps.data}
        >
          <View
            style={{
              flexDirection:
                this.props.horizontal || this.props.numColumns === 1
                  ? "column"
                  : "row",
            }}
          >
            {children}
          </View>
          {this.separator(parentProps.index)}
        </WrapperComponent>
      </ItemContainer>
    );
  };

  private getTransform() {
    return (this.props.inverted && this.transformStyle) || undefined;
  }

  private getContentContainerInfo() {
    const {
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      padding,
      paddingVertical,
      paddingHorizontal,
      backgroundColor,
      ...rest
    } = (this.props.contentContainerStyle || {}) as ViewStyle;
    const unsupportedKeys = Object.keys(rest).length > 0;
    if (this.props.horizontal) {
      const paddingIgnored =
        padding || paddingVertical || paddingTop || paddingBottom;
      return {
        style: {
          paddingLeft: paddingLeft || paddingHorizontal || padding || 0,
          paddingRight: paddingRight || paddingHorizontal || padding || 0,
          backgroundColor,
        },
        unsupportedKeys,
        paddingIgnored,
      };
    } else {
      const paddingIgnored =
        padding || paddingHorizontal || paddingLeft || paddingRight;
      return {
        style: {
          paddingTop: paddingTop || paddingVertical || padding || 0,
          paddingBottom: paddingBottom || paddingVertical || padding || 0,
          backgroundColor,
        },
        unsupportedKeys,
        paddingIgnored,
      };
    }
  }

  private separator = (index: number) => {
    const leadingItem = this.props.data?.[index];
    const trailingItem = this.props.data?.[index + 1];
    if (trailingItem === undefined) {
      return null;
    }
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
    return (
      <>
        <View
          style={[this.props.ListFooterComponentStyle, this.getTransform()]}
        >
          {this.getValidComponent(this.props.ListFooterComponent)}
        </View>
        <View
          style={{
            paddingBottom: this.contentStyle.paddingBottom,
            paddingRight: this.contentStyle.paddingRight,
          }}
        />
      </>
    );
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
    this.checkAndUpdateStickyState();
  };

  private rowRendererWithIndex = (index: number) => {
    return this.rowRenderer(
      undefined,
      this.props.data?.[index],
      index,
      this.state.extraData
    );
  };

  private rowRenderer = (_: any, data: any, index: number, extraData: any) => {
    // known issue: expected to pass separators which isn't available in RLV
    return this.props.renderItem?.({
      item: data,
      index,
      extraData: extraData?.value,
    } as any) as JSX.Element;
  };

  private recyclerRef = (ref: any) => {
    this.rlvRef = ref;
  };

  private stickyContentRef = (ref: any) => {
    this.stickyContentContainerRef = ref;
  };

  private stickyRowRenderer = (_: any, __: any, index: number, ___: any) => {
    return (
      <PureComponentWrapper
        ref={this.stickyContentRef}
        enabled={this.checkAndUpdateStickyState()}
        arg={index}
        renderer={this.rowRendererWithIndex}
      />
    );
  };

  private checkAndUpdateStickyState = () => {
    const currentOffset = this.rlvRef?.getCurrentScrollOffset() || 0;
    const state = currentOffset >= this.distanceFromWindow;
    this.stickyContentContainerRef?.setEnabled(state);
    return state;
  };

  private raiseOnLoadEventIfNeeded = () => {
    if (!this.isListLoaded) {
      this.isListLoaded = true;
      this.props.onLoad?.({
        elapsedTimeInMs: Date.now() - this.loadStartTime,
      });
    }
  };

  public scrollToEnd(params?: { animated?: boolean | null | undefined }) {
    this.rlvRef?.scrollToEnd(Boolean(params?.animated));
  }

  // TODO: Improve accuracy with headers
  public scrollToIndex(params: {
    animated?: boolean | null | undefined;
    index: number;
    viewOffset?: number | undefined;
    viewPosition?: number | undefined;
  }) {
    // known issue: no support for view offset/position
    this.rlvRef?.scrollToIndex(params.index, Boolean(params.animated));
  }

  public scrollToItem(params: {
    animated?: boolean | null | undefined;
    item: any;
    viewPosition?: number | undefined;
  }) {
    this.rlvRef?.scrollToItem(params.item, Boolean(params.animated));
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
}

export default FlashList;
