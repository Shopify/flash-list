import React from "react";
import { Button, StyleSheet, View } from "react-native";

export interface DebugButtonProps {
  onPress: () => void;
}

const DebugButton = (props: DebugButtonProps) => {
  return (
    <View style={styles.pressableStyle}>
      <Button
        onPress={props.onPress}
        title="DEBUG"
        color="red"
        testID="debug-button"
      />
    </View>
  );
};

export default DebugButton;

const styles = StyleSheet.create({
  pressableStyle: {
    position: "absolute",

    alignItems: "center",
    justifyContent: "center",
    right: 30,
    bottom: 30,
  },
});
