import React from "react";
import {
  Dimensions,
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
  estimatedHeight?: number;
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
}

export interface RecyclerFlatListState {
  dataProvider: DataProvider
}

class RecyclerFlatList extends React.PureComponent<RecyclerFlatListProps, RecyclerFlatListState> {
  width: number;
  numColumns: number;
  private layoutProvider: LayoutProvider;
  private _rowRenderer;
  private dataProvider;
  private data;
  private keyExtractor;
  private rlvRef?: RecyclerListView<RecyclerListViewProps, any>;

  constructor(props) {
    super(props);
    this.setup();
  }

  setup() {
    this.numColumns = this.props.numColumns || 1;
    this.width = Dimensions.get("window").width;
    this.keyExtractor = this.props.keyExtractor ?? this.defaultKeyExtractor;

    this.layoutProvider = this.props.horizontal
      ? this.horizontalProvider()
      : this.verticalProvider();

    this._rowRenderer = this.rowRenderer.bind(this);

    this.data = this.parseData(this.props.data);
    this.dataProvider = new DataProvider((r1, r2) => {
      // @ts-ignore
      return this.keyExtractor(r1) !== this.keyExtractor(r2);
    });
    this.state = {
      dataProvider: this.dataProvider.cloneWithRows(this.data)
    }
  }

  updateDataProvider() {
    this.data = this.parseData(this.props.data);
    this.setState({
      dataProvider: this.dataProvider.cloneWithRows(this.data)
    })
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

  onEndReached = () => {
    this.props.onEndReached?.()
    this.updateDataProvider()
  }

  horizontalProvider() {
    return new GridLayoutProvider(
      1,
      (index) => {
        return 0;
      },
      (index) => {
        return 1;
      },
      (index) => {
        return 100;
      }
    );
  }
  verticalProvider() {
    return new LayoutProvider(
      (index) => {
        return 0;
      },
      (type, dim) => {
        switch (type) {
          default:
            dim.width = this.width / this.numColumns;
            if (this.props.estimatedHeight) {
              dim.height = this.props.estimatedHeight;
            } else {
              dim.height = 44;
            }
        }
      }
    );
  }

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
          layoutProvider={this.layoutProvider}
          style={style as Object}
          dataProvider={this.state.dataProvider}
          rowRenderer={this._rowRenderer}
          renderFooter={this.footerComponent(this.props)}
          canChangeSize={true}
          isHorizontal={this.props.horizontal}
          scrollViewProps={{ style }}
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
