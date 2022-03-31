import React, { useContext } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { DebugContext, DebugContextInterface } from "./DebugContext";
import { getDebugOptions, DebugOption } from "./DebugOptions";

const DebugScreen = () => {
  const debugContext = useContext<DebugContextInterface>(DebugContext);
  const debugOptions = getDebugOptions(debugContext);

  const renderItem = ({ item }: { item: DebugOption }) => {
    return (
      <View style={styles.row}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Switch onValueChange={item.onToggle} value={item.value} />
      </View>
    );
  };

  return (
    <FlashList
      keyExtractor={(item: DebugOption) => {
        return item.name;
      }}
      renderItem={renderItem}
      estimatedItemSize={44}
      ItemSeparatorComponent={Divider}
      data={debugOptions}
    />
  );
};

const Divider = () => {
  return <View style={styles.divider} />;
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
