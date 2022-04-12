/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import "react-native-gesture-handler";
import React from "react";
import { ListsProfiler } from "@shopify/react-native-performance-lists-profiler";
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
    <ListsProfiler
      onInteractive={(TTI) => {
        console.log(`TTI in millis: ${TTI}`);
      }}
      onBlankArea={(offsetStart, offsetEnd) => {
        console.log(`Blank area: ${Math.max(offsetStart, offsetEnd)}`);
      }}
    >
      <DebugContextProvider>
        <NavigationTree />
      </DebugContextProvider>
    </ListsProfiler>
  );
};

export default App;
