/** *
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import { useLinkProps } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";

export interface PaginatedListState {
  elems: any[];
}

/** *
 * To test out just copy this component and render in you root component
 */
export default class PaginatedList extends React.Component<PaginatedListState> {
  state: PaginatedListState = this.getInitialState();

  private getInitialState() {
    return { elems: this._generateArray(0, 20) } as PaginatedListState;
  }

  private _generateArray(start, size) {
    const arr = new Array(size);
    for (let i = 0; i < size; i++) {
      arr[i] = start + i;
    }
    return arr;
  }

  render() {
    return (
      <FlashList
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
        estimatedItemSize={100}
        onEndReached={() => {
          // Since FlatList is a pure component, data reference should change for a render
          const elems = [...this.state.elems];
          elems.push(...this._generateArray(elems.length, 20));
          this.setState(() => {
            return { elems };
          });
        }}
        // known issue: Flatlist uses fraction of visible window while RLV wants pixels. Will fix later
        onEndReachedThreshold={100}
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
