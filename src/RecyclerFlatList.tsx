import React from "react";
import {
  StyleProp,
  View,
  ViewProps,
  ViewStyle,
  PixelRatio,
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

export interface RecyclerFlatListProps extends ViewProps {
  data: [any];
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
}

export interface RecyclerFlatListState {
  numColumns: number;
  layoutProvider: LayoutProvider;
}

class RecyclerFlatList extends React.PureComponent<RecyclerFlatListProps, RecyclerFlatListState> {
  private _rowRenderer;
  private dataProvider;
  private data;
  private keyExtractor;
  private rlvRef?: RecyclerListView<RecyclerListViewProps, any>;

  constructor(props) {
    super(props);
    this.data = this.props.data;
    this.keyExtractor = this.props.keyExtractor ?? this.defaultKeyExtractor;

    this.dataProvider = new DataProvider((r1, r2) => {
      // @ts-ignore
      return this.keyExtractor(r1) !== this.keyExtractor(r2);
    });
    this._rowRenderer = this.rowRenderer.bind(this);

    this.state = RecyclerFlatList.getInitialState(props);
  }

  //Some of the state variables need to update when props change
  static getDerivedStateFromProps(nextProps: RecyclerFlatListProps, prevState: RecyclerFlatListState): RecyclerFlatListState {
    const newState = { ...prevState }
    if (newState.numColumns !== nextProps.numColumns) {
      newState.numColumns = nextProps.numColumns > 0 ? nextProps.numColumns : 1;
      newState.layoutProvider = RecyclerFlatList.getLayoutProvider(newState.numColumns, () => nextProps.estimatedHeight);
    }
    return newState;
  }

  static getInitialState(props: RecyclerFlatListProps): RecyclerFlatListState {
    const numColumns = props.numColumns > 0 ? props.numColumns : 1;
    const sizeProvider = () => props.estimatedHeight;
    return { numColumns, layoutProvider: RecyclerFlatList.getLayoutProvider(numColumns, sizeProvider) };
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


  // Taken from here: https://github.com/facebook/react-native/blob/main/Libraries/Lists/VirtualizeUtils.js#L233
  defaultKeyExtractor = (item: any, index: number) => {
    if (typeof item === "object" && item?.key != null) {
      return item.key;
    }
    if (typeof item === "object" && item?.id != null) {
      return item.id;
    }
    return String(index);
  };




  parseData(data) {
    return data.map(function (elem) {
      return { item: elem };
    });
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
    if (this.data.length == 0) {
      return this.props.ListEmptyComponent;
    } else {
      var style = {};
      Object.assign(style, this.props.style);
      if (this.props.inverted === true) {
        Object.assign(style, { transform: [{ scaleY: -1 }] });
      }

      return (
        <RecyclerListView
          ref={this.recyclerRef}
          layoutProvider={this.state.layoutProvider}
          style={style as Object}
          dataProvider={this.dataProvider.cloneWithRows(this.data)}
          rowRenderer={this._rowRenderer}
          renderFooter={this.footerComponent(this.props)}
          canChangeSize={true}
          isHorizontal={this.props.horizontal}
          scrollViewProps={{ style }}
          forceNonDeterministicRendering={true}
          renderItemContainer={this.renderItemContainer}
          renderContentContainer={this.renderContainer}
        />
      );
    }
  }

  renderContainer(props, children) {
    // return <View {...props}>{children}</View>;
    return (
      <AutoLayoutView
        {...props}
        scrollOffset={PixelRatio.getPixelSizeForLayoutSize(props.scrollOffset)}
        windowSize={PixelRatio.getPixelSizeForLayoutSize(props.windowSize)}
        renderAheadOffset={PixelRatio.getPixelSizeForLayoutSize(
          props.renderAheadOffset
        )}
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
    var header;
    if (index == 0 && this.props.ListHeaderComponent) {
      if (this.props.ListHeaderComponentStyle) {
        header = (
          <View style={this.props.ListHeaderComponentStyle}>
            {/* @ts-ignore */}
            {this.props.ListHeaderComponent()}
          </View>
        );
      } else {
        // prettier-ignore
        { /* @ts-ignore */ }
        header = this.props.ListHeaderComponent();
      }
    }

    var elem = this.props.renderItem(data);
    var elements = [header, elem];
    if (this.props.ItemSeparatorComponent) {
      // prettier-ignore
      { /* @ts-ignore */ }
      elements.push(this.props.ItemSeparatorComponent());
    }

    const style = { flex: 1 };

    if (this.props.inverted === true) {
      elements = elements.reverse();
      Object.assign(style, { transform: [{ scaleY: -1 }] });
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
