import React from "react";
import {
  StyleProp,
  View,
  ViewProps,
  ViewStyle,
  PixelRatio,
  RefreshControl,
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
import invariant from 'invariant'

export interface RecyclerFlatListProps extends ViewProps {
  data: Array<any>;
  estimatedHeight: number;
  renderItem: any;
  keyExtractor?: (data) => string;
  ItemSeparatorComponent: React.ComponentType<any> | null | undefined;
  numColumns: number;
  inverted: boolean;
  ListEmptyComponent: React.ComponentType<any> | null | undefined;
  ListHeaderComponent: React.ComponentType<any> | null | undefined;
  ListHeaderComponentStyle?: StyleProp<ViewStyle> | undefined | null;
  ListFooterComponent: React.ComponentType<any> | null | undefined;
  ListFooterComponentStyle?: StyleProp<ViewStyle> | undefined | null;
  horizontal: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number | undefined;
  onRefresh?: (() => void) | null | undefined;
  refreshing?: boolean | undefined;
}

export interface RecyclerFlatListState {
  dataProvider: DataProvider;
  numColumns: number;
  layoutProvider: LayoutProvider;
  data: Array<any>;
}

class RecyclerFlatList extends React.PureComponent<RecyclerFlatListProps, RecyclerFlatListState> {
  private _rowRenderer;
  private rlvRef?: RecyclerListView<RecyclerListViewProps, any>;

  constructor(props) {
    super(props);
    this.setup();
    this.state = RecyclerFlatList.getInitialState(props)
  }

  setup() {
    const refreshingPrecondition = !(this.props.onRefresh && typeof this.props.refreshing !== 'boolean');
    const message = "Invariant Violation: `refreshing` prop must be set as a boolean in order to use `onRefresh`, but got `\"undefined\"`";
    invariant(refreshingPrecondition, message);
    this._rowRenderer = this.rowRenderer.bind(this);
  }

  //Some of the state variables need to update when props change
  static getDerivedStateFromProps(nextProps: RecyclerFlatListProps, prevState: RecyclerFlatListState): RecyclerFlatListState {
    const newState = { ...prevState }
    if (newState.numColumns !== nextProps.numColumns) {
      newState.numColumns = nextProps.numColumns > 0 ? nextProps.numColumns : 1;
      newState.layoutProvider = RecyclerFlatList.getLayoutProvider(newState.numColumns, () => nextProps.estimatedHeight);
    }
    if (nextProps.data !== prevState.data) {
      newState.data = nextProps.data;
      newState.dataProvider = newState.dataProvider.cloneWithRows(nextProps.data)
    }
    return newState;
  }

  static getInitialState(props: RecyclerFlatListProps): RecyclerFlatListState {
    const numColumns = props.numColumns > 0 ? props.numColumns : 1;
    const sizeProvider = () => props.estimatedHeight;
    const dataProvider = new DataProvider((r1, r2) => { return r1 !== r2 });
    return { numColumns, layoutProvider: RecyclerFlatList.getLayoutProvider(numColumns, sizeProvider), dataProvider: dataProvider.cloneWithRows(props.data), data: props.data };
  }

  //Using only grid layout provider as it can also act as a listview, sizeProvider is a function to support future overrides
  static getLayoutProvider(numColumns: number, sizeProvider: (index) => number) {
    return new GridLayoutProvider(
      numColumns,    //max span or, total columns
      (index) => {   //type of the item for given index
        return 0;
      },
      (index) => {  //span of the item at given index, item can choose to span more than one column
        return 1;
      },
      (index) => {  //estimated size of the item an given index
        return sizeProvider(index);
      }
    );
  }

  onEndReached = () => {
    this.props.onEndReached?.()
  }

  footerComponent(props) {
    return function () {
      if (props.ListFooterComponentStyle) {
        return (
          <View style={props.ListFooterComponentStyle}>
            {props.ListFooterComponent()}
          </View>
        );
      } else if (props.ListFooterComponent) {
        return props.ListFooterComponent();
      }
      return <View />;
    };
  }

  render() {
    if (this.state.dataProvider.getSize() == 0) {
      return this.props.ListEmptyComponent;
    } else {
      let style = this.props.style ?? {};
      if (this.props.inverted === true) {
        style = [style, { transform: [{ scaleY: -1 }] }]
      }

      let scrollViewProps: object = { style };
      if (this.props.onRefresh) {
        const refreshControl = (<RefreshControl
          refreshing={this.props.refreshing as boolean}
          onRefresh={this.props.onRefresh}
        />);
        scrollViewProps = { ...scrollViewProps, refreshControl: refreshControl }
      }

      return (
        <RecyclerListView
          ref={this.recyclerRef}
          layoutProvider={this.state.layoutProvider}
          style={style as object}
          dataProvider={this.state.dataProvider}
          rowRenderer={this._rowRenderer}
          renderFooter={this.footerComponent(this.props)}
          canChangeSize={true}
          isHorizontal={this.props.horizontal}
          scrollViewProps={scrollViewProps}
          forceNonDeterministicRendering={true}
          renderItemContainer={this.renderItemContainer}
          renderContentContainer={this.renderContainer}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={this.props.onEndReachedThreshold}
        />
      );
    }
  }

  renderContainer(props, children) {
    // return <View {...props}>{children}</View>;
    return (
      <AutoLayoutView
        {...props}
        scrollOffset={props.scrollOffset}
        windowSize={props.windowSize}
        renderAheadOffset={props.renderAheadOffset}
        enableInstrumentation={true}
      >
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

  rowRenderer(type, data, index) {
    let header;
    if (index == 0 && this.props.ListHeaderComponent) {
      if (this.props.ListHeaderComponentStyle) {
        header = (
          <View style={this.props.ListHeaderComponentStyle}>
            {this.props.ListHeaderComponent}
          </View>
        );
      } else {
        header = this.props.ListHeaderComponent;
      }
    }

    let elem = this.props.renderItem({ item: data });
    let elements = [header, elem];
    if (this.props.ItemSeparatorComponent) {
      elements.push(this.props.ItemSeparatorComponent);
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
          {this.props.ItemSeparatorComponent && elements[2]}
        </>
      </View>
    );
  }

  private recyclerRef = (ref: any) => {
    this.rlvRef = ref
  }

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

  public scrollToItem(params: { animated?: boolean | null | undefined; item: any; viewPosition?: number | undefined }) {
    this.rlvRef?.scrollToItem(params.item, !!params.animated);
  }

  public scrollToOffset(params: { animated?: boolean | null | undefined; offset: number }) {
    const x = this.props.horizontal ? params.offset : 0;
    const y = this.props.horizontal ? 0 : params.offset;
    this.rlvRef?.scrollToOffset(x, y, !!params.animated);
  }
}

export default RecyclerFlatList;
