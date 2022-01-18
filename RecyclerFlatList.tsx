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
} from "recyclerlistview";
import AutoLayoutView from "./AutoLayoutView";
import ItemContainer from "./CellContainer";
import WrapperComponent from "./WrapperComponent";

export interface RecyclerFlatListProps extends ViewProps {
  data: [any];
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
  getItemLayout?: ((
    data: Array<any> | null | undefined,
    index: number,
  ) => { length: number; offset: number; index: number }) | undefined;
}

class RecyclerFlatList extends React.PureComponent<RecyclerFlatListProps> {
  width: number;
  numColumns: number;
  private layoutProvider: LayoutProvider;
  private _rowRenderer;
  private dataProvider;
  private data;
  private keyExtractor;

  constructor(props) {
    super(props);
    this.data = this.props.data;
    this.numColumns = this.props.numColumns || 1;
    this.width = Dimensions.get("window").width;
    this.keyExtractor = this.props.keyExtractor ?? this.defaultKeyExtractor;

    this.layoutProvider = this.props.horizontal
      ? this.horizontalProvider()
      : this.verticalProvider();

    this.dataProvider = new DataProvider((r1, r2) => {
      // @ts-ignore
      return this.keyExtractor(r1) !== this.keyExtractor(r2);
    });
    this._rowRenderer = this.rowRenderer.bind(this);

    if (this.props.getItemLayout) {
      console.log("⚠️ WARNING: getItemLayout offset and index are ignored in RecyclerFlatList. The API only contains these attributes to be matching 1:1 FlatList API. This won't affect the layout neither the performance.");
    }
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

  heightForIndex(data, props, index) {
    if (props.getItemLayout) return props.getItemLayout(data, index).length;
    return 44;
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
        return this.heightForIndex(this.data, this.props, index);
      }
    );
  }
  verticalProvider() {
    return new LayoutProvider(
      (index) => {
        return 0;
      },
      (type, dim, index) => {
        switch (type) {
          default:
            dim.width = this.width / this.numColumns;
            dim.height = this.heightForIndex(this.data, this.props, index);
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
          layoutProvider={this.layoutProvider}
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
            {this.props.ListHeaderComponent()}
          </View>
        );
      } else {
        header = this.props.ListHeaderComponent();
      }
    }

    var elem = this.props.renderItem(data);
    var elements = [header, elem];
    if (this.props.ItemSeparatorComponent) {
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
}

export default RecyclerFlatList;
