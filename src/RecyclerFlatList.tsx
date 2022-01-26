import React from "react";
import {
  StyleProp,
  View,
  ViewStyle,
  RefreshControl,
  FlatListProps,
} from "react-native";
import {
  DataProvider,
  GridLayoutProvider,
  LayoutProvider,
  RecyclerListView,
  RecyclerListViewProps,
} from "recyclerlistview";
import AutoLayoutView from "./AutoLayoutView";
import ItemContainer from "./CellContainer";
import WrapperComponent from "./WrapperComponent";
import invariant from "invariant";

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
  data?: readonly T[] | null;
}

class RecyclerFlatList<T> extends React.PureComponent<
  RecyclerFlatListProps<T>,
  RecyclerFlatListState<T>
> {
  private rlvRef?: RecyclerListView<RecyclerListViewProps, any>;

  static props = {
    data: [],
  };

  constructor(props) {
    super(props);
    this.setup();
    this.state = RecyclerFlatList.getInitialState(props);
  }

  setup() {
    const refreshingPrecondition = !(
      this.props.onRefresh && typeof this.props.refreshing !== "boolean"
    );
    const message =
      'Invariant Violation: `refreshing` prop must be set as a boolean in order to use `onRefresh`, but got `"undefined"`';
    invariant(refreshingPrecondition, message);
  }

  //Some of the state variables need to update when props change
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

  static getInitialState<T>(
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

  //Using only grid layout provider as it can also act as a listview, sizeProvider is a function to support future overrides
  static getLayoutProvider(
    numColumns: number,
    sizeProvider: (index) => number
  ) {
    return new GridLayoutProvider(
      numColumns, //max span or, total columns
      (index) => {
        //type of the item for given index
        return 0;
      },
      (index) => {
        //span of the item at given index, item can choose to span more than one column
        return 1;
      },
      (index) => {
        //estimated size of the item an given index
        return sizeProvider(index);
      }
    );
  }

  onEndReached = () => {
    //known issue: RLV doesn't report distanceFromEnd
    this.props.onEndReached?.({ distanceFromEnd: 0 });
  };

  render() {
    if (this.state.dataProvider.getSize() == 0) {
      return this.props.ListEmptyComponent;
    } else {
      let style = this.props.style ?? {};
      if (this.props.inverted === true) {
        style = [style, { transform: [{ scaleY: -1 }] }];
      }

      let scrollViewProps: object = { style };
      if (this.props.onRefresh) {
        const refreshControl = (
          <RefreshControl
            refreshing={this.props.refreshing as boolean}
            onRefresh={this.props.onRefresh}
          />
        );
        scrollViewProps = {
          ...scrollViewProps,
          refreshControl: refreshControl,
        };
      }

      return (
        <RecyclerListView
          ref={this.recyclerRef}
          layoutProvider={this.state.layoutProvider}
          style={style as object}
          dataProvider={this.state.dataProvider}
          rowRenderer={this.rowRenderer}
          renderFooter={this.footer}
          canChangeSize={true}
          isHorizontal={!!this.props.horizontal}
          scrollViewProps={scrollViewProps}
          forceNonDeterministicRendering={true}
          renderItemContainer={this.renderItemContainer}
          renderContentContainer={this.renderContainer}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={this.props.onEndReachedThreshold || undefined}
          extendedState={this.props.extraData}
          layoutSize={this.props.estimatedListSize}
        />
      );
    }
  }

  renderContainer(props, children) {
    // return <View {...props}>{children}</View>;
    return (
      <AutoLayoutView {...props} enableInstrumentation={false}>
        {children}
      </AutoLayoutView>
    );
  }

  renderItemContainer = (props, parentProps, children) => {
    return (
      <ItemContainer {...props} index={parentProps.index}>
        <WrapperComponent
          // @ts-ignore
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

  separator(index) {
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

  header(index) {
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

  footer = () => {
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

  rowRenderer = (type, data, index) => {
    //known issue: expected to pass separators which isn't available in RLV
    let elem = this.props.renderItem?.({ item: data, index: index } as any);
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

  public scrollToEnd(params?: { animated?: boolean | null | undefined }) {
    this.rlvRef?.scrollToEnd(!!params?.animated);
  }

  public scrollToIndex(params: {
    animated?: boolean | null | undefined;
    index: number;
    viewOffset?: number | undefined;
    viewPosition?: number | undefined;
  }) {
    //known issue: no support for view offset/position
    this.rlvRef?.scrollToIndex(params.index, !!params.animated);
  }

  public scrollToItem(params: {
    animated?: boolean | null | undefined;
    item: any;
    viewPosition?: number | undefined;
  }) {
    this.rlvRef?.scrollToItem(params.item, !!params.animated);
  }

  public scrollToOffset(params: {
    animated?: boolean | null | undefined;
    offset: number;
  }) {
    const x = this.props.horizontal ? params.offset : 0;
    const y = this.props.horizontal ? 0 : params.offset;
    this.rlvRef?.scrollToOffset(x, y, !!params.animated);
  }
}

export default RecyclerFlatList;
