import React, { useContext } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { DebugContext, DebugContextInterface } from "./DebugContext";
import { getDebugItems, DebugItem, DebugOptionType } from "./DebugOptions";
import { TextInput } from "react-native-gesture-handler";

const DebugScreen = () => {
  const debugContext = useContext<DebugContextInterface>(DebugContext);
  const debugItems = getDebugItems(debugContext);

  const renderItem = ({ item }: { item: DebugItem }) => {
    return (
      <View style={styles.row}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        {inputComponent(item)}
      </View>
    );
  };

  return (
    <FlashList
      keyExtractor={(item: DebugItem) => {
        return item.name;
      }}
      renderItem={renderItem}
      estimatedItemSize={44}
      ItemSeparatorComponent={Divider}
      data={debugItems}
    />
  );
};

const Divider = () => {
  return <View style={styles.divider} />;
};

const inputComponent = (item: DebugItem) => {
  console.log(item.type);
  if (item.type === DebugOptionType.Switch) {
    return (
      <Switch
        onValueChange={(value) => {
          item.onValue(value);
        }}
        value={item.value as boolean}
        testID={item.testID}
      />
    );
  } else if (item.type === DebugOptionType.Input) {
    return (
      <TextInput
        onChangeText={(value) => {
          item.onValue(Number(value));
        }}
        placeholder={"Set value"}
        value={item.value ? item.value.toString() : undefined}
      />
    );
  }
};

export default DebugScreen;

const styles = StyleSheet.create({
  row: {
    flex: 1,
    backgroundColor: "#FFF",
    height: 44,
    paddingLeft: 16,
    paddingRight: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: {
    fontSize: 18,
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#DDD",
  },
});
