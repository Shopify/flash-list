/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import "react-native-gesture-handler";
import React from "react";
import { Platform, UIManager, View } from "react-native";

import { DebugContextProvider } from "./Debug";
import NavigationTree from "./NavigationTree";
import TwitterBenchmark from "./twitter/TwitterBenchmark";

const App = () => {
  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  return (
    <DebugContextProvider>
      <View style={{ flex: 1, backgroundColor: "red" }}>
        <TwitterBenchmark />
      </View>
    </DebugContextProvider>
  );
};

export default App;
