/***
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import { useLinkProps } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { RecyclerFlatList } from "@shopify/recycler-flat-list";

export interface PaginatedListState {
  elems: [any]
}
/***
 * To test out just copy this component and render in you root component
 */
export default class PaginatedList extends React.Component<{}, PaginatedListState> {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return { elems: this._generateArray(0, 20) } as PaginatedListState
  }

  _generateArray(start, n) {
    let arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = start + i;
    }
    return arr;
  }

  render() {
    return (
      <RecyclerFlatList
        keyExtractor={(item) => {
          return item;
        }}
        renderItem={(data) => {
          const backgroundColor = data.item % 2 === 0 ? "#00a1f1" : "#ffbb00";
          return (
            <View style={{ ...styles.container, backgroundColor }}>
              <Text>Cell Id: {data.item}</Text>
            </View>
          );
        }}
        estimatedHeight={100}
        onEndReached={() => {
          const elems = this.state.elems;
          elems.push(...this._generateArray(elems.length, 20))
          this.setState({ elems: elems })
        }}
        onEndReachedThreshold={0.5}
        data={this.state.elems}
      />
    );
  }
}

const styles = {
  container: {
    justifyContent: "space-around",
    alignItems: "center",
    height: 120,
    backgroundColor: "#00a1f1",
  },
};
