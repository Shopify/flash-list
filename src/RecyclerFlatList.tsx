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
  GridLayoutProvider,
  LayoutProvider,
  ProgressiveListView,
  RecyclerListView,
  RecyclerListViewProps,
} from "recyclerlistview";
import invariant from "invariant";

import AutoLayoutView from "./AutoLayoutView";
import ItemContainer from "./CellContainer";
import WrapperComponent from "./WrapperComponent";

export interface RecyclerFlatListProps<T> extends FlatListProps<T> {
  estimatedHeight: number;

  /**
   * Visible height and width of the list. This is not the scroll content size.
   */
  estimatedListSize?: { height: number; width: number };
}

export interface RecyclerFlatListState<T> {
  dataProvider: DataProvider;
  numColumns: number;
  layoutProvider: LayoutProvider;
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
  };

  private static readonly RENDER_AHEAD_OFFSET = 250;

  constructor(props) {
    super(props);
    this.setup();

    // eslint-disable-next-line react/state-in-constructor
    this.state = RecyclerFlatList.getInitialState(props);
  }

  private setup() {
    const refreshingPrecondition = !(
      this.props.onRefresh && typeof this.props.refreshing !== "boolean"
    );
    const message =
      'Invariant Violation: `refreshing` prop must be set as a boolean in order to use `onRefresh`, but got `"undefined"`';
    invariant(refreshingPrecondition, message);
  }

  // Some of the state variables need to update when props change
  static getDerivedStateFromProps<T>(
    nextProps: RecyclerFlatListProps<T>,
    prevState: RecyclerFlatListState<T>
  ): RecyclerFlatListState<T> {
    const newState = { ...prevState };
    if (newState.numColumns !== nextProps.numColumns) {
      newState.numColumns = nextProps.numColumns || 1;
      newState.layoutProvider = RecyclerFlatList.getLayoutProvider(
        newState.numColumns,
        () => nextProps.estimatedHeight
      );
    }
    if (nextProps.data !== prevState.data) {
      newState.data = nextProps.data;
      newState.dataProvider = newState.dataProvider.cloneWithRows(
        nextProps.data as any[]
      );
    }
    return newState;
  }

  private static getInitialState<T>(
    props: RecyclerFlatListProps<T>
  ): RecyclerFlatListState<T> {
    const numColumns = props.numColumns || 1;
    const sizeProvider = () => props.estimatedHeight;
    const dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });
    return {
      numColumns,
      layoutProvider: RecyclerFlatList.getLayoutProvider(
        numColumns,
        sizeProvider
      ),
      dataProvider: dataProvider.cloneWithRows(props.data as any[]),
      data: props.data,
    };
  }

  // Using only grid layout provider as it can also act as a listview, sizeProvider is a function to support future overrides
  private static getLayoutProvider(
    numColumns: number,
    sizeProvider: (index) => number
  ) {
    return new GridLayoutProvider(
      // max span or, total columns
      numColumns,
      (index) => {
        // type of the item for given index
        return 0;
      },
      (index) => {
        // span of the item at given index, item can choose to span more than one column
        return 1;
      },
      (index) => {
        // estimated size of the item an given index
        return sizeProvider(index);
      }
    );
  }

  private onEndReached = () => {
    // known issue: RLV doesn't report distanceFromEnd
    this.props.onEndReached?.({ distanceFromEnd: 0 });
  };

  render() {
    if (this.state.dataProvider.getSize() === 0) {
      return this.props.ListEmptyComponent;
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

      return (
        <ProgressiveListView
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
          maxRenderAhead={3 * RecyclerFlatList.RENDER_AHEAD_OFFSET}
          finalRenderAheadOffset={RecyclerFlatList.RENDER_AHEAD_OFFSET}
          renderAheadStep={RecyclerFlatList.RENDER_AHEAD_OFFSET}
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
      <ItemContainer {...props} index={parentProps.index}>
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

  private rowRenderer = (type, data, index) => {
    // known issue: expected to pass separators which isn't available in RLV
    const elem = this.props.renderItem?.({ item: data, index } as any);
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
