import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";

export interface DebugButtonProps {
  onPress: () => void;
}

const DebugButton = (props: DebugButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={props.onPress}
      style={styles.touchableOpacityStyle}
    >
      <Image
        source={require("./debug-icon.png")}
        style={styles.floatingButtonStyle}
      />
    </TouchableOpacity>
  );
};

export default DebugButton;

const styles = StyleSheet.create({
  touchableOpacityStyle: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    right: 30,
    bottom: 30,
  },
  floatingButtonStyle: {
    resizeMode: "contain",
    width: 44,
    height: 44,
  },
});
