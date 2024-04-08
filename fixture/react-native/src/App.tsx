/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import "react-native-gesture-handler";
import React from "react";
import { Platform, UIManager } from "react-native";

import { DebugContextProvider } from "./Debug";
import NavigationTree from "./NavigationTree";

const App = () => {
  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  return (
    <DebugContextProvider>
      <NavigationTree />
    </DebugContextProvider>
  );
};

export default App;
