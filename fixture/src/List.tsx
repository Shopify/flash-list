/***
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React from "react";
import { View, Text } from "react-native";
import { RecyclerFlatList } from "@shopify/recycler-flat-list";

/***
 * To test out just copy this component and render in you root component
 */
export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  _generateArray(n) {
    let arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = i;
    }
    return arr;
  }

  render() {
    return (
      <RecyclerFlatList
        refreshing={this.state.refreshing}
        onRefresh={() => {
          this.setState({ refreshing: true });
          setTimeout(() => {
            this.setState({ refreshing: false });
          }, 2000);
        }}
        keyExtractor={(item) => {
          return item;
        }}
        renderItem={({ item }) => {
          const backgroundColor = item % 2 === 0 ? "#00a1f1" : "#ffbb00";
          return (
            <View style={{ ...styles.container, backgroundColor }}>
              <Text>Cell Id: {item}</Text>
            </View>
          );
        }}
        estimatedHeight={100}
        data={this._generateArray(3000)}
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
