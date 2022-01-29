import React from "react";
import {
  StyleProp,
  View,
  ViewStyle,
  RefreshControl,
  FlatListProps,
  LayoutChangeEvent,
} from "react-native";
import {
  DataProvider,
  ProgressiveListView,
  RecyclerListView,
  RecyclerListViewProps,
} from "recyclerlistview";
import invariant from "invariant";

import AutoLayoutView from "./AutoLayoutView";
import ItemContainer from "./CellContainer";
import WrapperComponent from "./WrapperComponent";
import GridLayoutProviderWithProps from "./GridLayoutProviderWithProps";

export interface RecyclerFlatListProps<T> extends FlatListProps<T> {
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
   * Draw distance for rendering in advance in keeping items ready
   */
  renderAheadOffset?: number;

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
   * For debugging, internal props will be overriden with these values if used
   */
  overrideProps?: object;
}

export interface RecyclerFlatListState<T> {
  dataProvider: DataProvider;
  numColumns: number;
  layoutProvider: GridLayoutProviderWithProps<RecyclerFlatListProps<T>>;
  data?: ReadonlyArray<T> | null;
}

class RecyclerFlatList<T> extends React.PureComponent<
  RecyclerFlatListProps<T>,
  RecyclerFlatListState<T>
> {
  private rlvRef?: RecyclerListView<RecyclerListViewProps, any>;
  private listFixedDimensionSize = 0;

  static defaultProps = {
    data: [],
    numColumns: 1,
    renderAheadOffset: 250,
  };

  constructor(props) {
    super(props);
    this.setup();

    // eslint-disable-next-line react/state-in-constructor
    this.state = RecyclerFlatList.getDerivedStateFromProps(props, undefined);
  }

  private setup() {
    const refreshingPrecondition = !(
      this.props.onRefresh && typeof this.props.refreshing !== "boolean"
    );
    const message =
      'Invariant Violation: `refreshing` prop must be set as a boolean in order to use `onRefresh`, but got `"undefined"`';
    invariant(refreshingPrecondition, message);
    if (this.props.estimatedListSize) {
      if (this.props.horizontal) {
        this.listFixedDimensionSize = this.props.estimatedListSize.height;
      } else {
        this.listFixedDimensionSize = this.props.estimatedListSize.width;
      }
    }
  }

  // Some of the state variables need to update when props change
  static getDerivedStateFromProps<T>(
    nextProps: RecyclerFlatListProps<T>,
    prevState: RecyclerFlatListState<T> | undefined
  ): RecyclerFlatListState<T> {
    const oldState = prevState || RecyclerFlatList.getInitialMutableState();
    const newState = { ...oldState };
    if (oldState.numColumns !== nextProps.numColumns) {
      newState.numColumns = nextProps.numColumns || 1;
      newState.layoutProvider = RecyclerFlatList.getLayoutProvider<T>(
        newState.numColumns,
        nextProps
      );
    }
    if (nextProps.data !== oldState.data) {
      newState.data = nextProps.data;
      newState.dataProvider = oldState.dataProvider.cloneWithRows(
        nextProps.data as any[]
      );
    }
    newState.layoutProvider.updateProps(nextProps);
    return newState;
  }

  private static getInitialMutableState<T>(): RecyclerFlatListState<T> {
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
    props: RecyclerFlatListProps<T>
  ) {
    return new GridLayoutProviderWithProps<RecyclerFlatListProps<T>>(
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

  render() {
    if (this.state.dataProvider.getSize() === 0) {
      return this.props.ListEmptyComponent || null;
    } else {
      let style = this.props.style ?? {};
      if (this.props.inverted === true) {
        style = [style, { transform: [{ scaleY: -1 }] }];
      }

      let scrollViewProps: object = { style, onLayout: this.handleSizeChange };
      if (this.props.onRefresh) {
        const refreshControl = (
          <RefreshControl
            refreshing={this.props.refreshing as boolean}
            onRefresh={this.props.onRefresh}
          />
        );
        scrollViewProps = {
          ...scrollViewProps,
          refreshControl,
        };
      }

      const renderAheadOffset = this.props.renderAheadOffset || 250;

      return (
        <ProgressiveListView
          {...this.props}
          ref={this.recyclerRef}
          layoutProvider={this.state.layoutProvider}
          style={style as object}
          dataProvider={this.state.dataProvider}
          rowRenderer={this.rowRenderer}
          renderFooter={this.footer}
          canChangeSize
          isHorizontal={Boolean(this.props.horizontal)}
          scrollViewProps={scrollViewProps}
          forceNonDeterministicRendering
          renderItemContainer={this.itemContainer}
          renderContentContainer={this.container}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={this.props.onEndReachedThreshold || undefined}
          extendedState={this.props.extraData}
          layoutSize={this.props.estimatedListSize}
          maxRenderAhead={3 * renderAheadOffset}
          finalRenderAheadOffset={renderAheadOffset}
          renderAheadStep={renderAheadOffset}
          {...this.props.debug}
        />
      );
    }
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
  };

  private container(props, children) {
    // return <View {...props}>{children}</View>;
    return (
      <AutoLayoutView {...props} enableInstrumentation={false}>
        {children}
      </AutoLayoutView>
    );
  }

  private itemContainer = (props, parentProps, children) => {
    return (
      <ItemContainer
        {...props}
        style={[
          props.style,
          { minHeight: props.style.height, height: undefined },
        ]}
        index={parentProps.index}
      >
        <WrapperComponent
          extendedState={parentProps.extendedState}
          internalSnapshot={parentProps.internalSnapshot}
          dataHasChanged={parentProps.dataHasChanged}
          data={parentProps.data}
        >
          {children}
        </WrapperComponent>
      </ItemContainer>
    );
  };

  private separator(index) {
    const leadingItem = this.props.data?.[index];
    const trailingItem = this.props.data?.[index + 1];

    const props = {
      leadingItem,
      trailingItem,
      // TODO: Missing sections as we don't have this feature implemented yet. Implement section, leadingSection and trailingSection.
      // https://github.com/facebook/react-native/blob/8bd3edec88148d0ab1f225d2119435681fbbba33/Libraries/Lists/VirtualizedSectionList.js#L285-L294
    };
    if (this.props.ItemSeparatorComponent != null) {
      return <this.props.ItemSeparatorComponent {...props} />;
    }
    return undefined;
  }

  private header(index) {
    if (index !== 0) return undefined;
    const ListHeaderComponent = this.props.ListHeaderComponent;
    const style = this.props.ListHeaderComponentStyle || {};
    if (React.isValidElement(ListHeaderComponent)) {
      ListHeaderComponent.props = { style };
      return ListHeaderComponent;
    } else if (ListHeaderComponent != null) {
      console.log(style);
      return <ListHeaderComponent style={style} />;
    }
  }

  private footer = () => {
    const ListFooterComponent = this.props.ListFooterComponent;
    const style = this.props.ListFooterComponentStyle || {};
    if (React.isValidElement(ListFooterComponent)) {
      ListFooterComponent.props = { style };
      return ListFooterComponent;
    } else if (ListFooterComponent) {
      return <ListFooterComponent style={style} />;
    }
    return null;
  };

  private rowRenderer = (type, data, index, extraData) => {
    // known issue: expected to pass separators which isn't available in RLV
    const elem = this.props.renderItem?.({
      item: data,
      index,
      extraData,
    } as any);
    let elements = [this.header(index), elem];

    const separator = this.separator(index);
    if (separator != null) {
      elements.push(separator);
    }

    let style: StyleProp<ViewStyle> = { flex: 1 };
    if (this.props.inverted === true) {
      elements = elements.reverse();
      style = [style, { transform: [{ scaleY: -1 }] }];
    }

    return (
      <View style={style}>
        <>
          {elements[0]}
          {elements[1]}
          {elements[2]}
        </>
      </View>
    );
  };

  private recyclerRef = (ref: any) => {
    this.rlvRef = ref;
  };

  // eslint-disable-next-line @shopify/react-prefer-private-members
  public scrollToEnd(params?: { animated?: boolean | null | undefined }) {
    this.rlvRef?.scrollToEnd(Boolean(params?.animated));
  }

  // eslint-disable-next-line @shopify/react-prefer-private-members
  public scrollToIndex(params: {
    animated?: boolean | null | undefined;
    index: number;
    viewOffset?: number | undefined;
    viewPosition?: number | undefined;
  }) {
    // known issue: no support for view offset/position
    this.rlvRef?.scrollToIndex(params.index, Boolean(params.animated));
  }

  // eslint-disable-next-line @shopify/react-prefer-private-members
  public scrollToItem(params: {
    animated?: boolean | null | undefined;
    item: any;
    viewPosition?: number | undefined;
  }) {
    this.rlvRef?.scrollToItem(params.item, Boolean(params.animated));
  }

  // eslint-disable-next-line @shopify/react-prefer-private-members
  public scrollToOffset(params: {
    animated?: boolean | null | undefined;
    offset: number;
  }) {
    const x = this.props.horizontal ? params.offset : 0;
    const y = this.props.horizontal ? 0 : params.offset;
    this.rlvRef?.scrollToOffset(x, y, Boolean(params.animated));
  }
}

export default RecyclerFlatList;
