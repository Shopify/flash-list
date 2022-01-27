/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  useOnNativeBlankAreaEvents,
  useReactNativePerformanceFlipperPlugin,
} from "@shopify/recycler-flat-list";

import List from "./List";
import PaginatedList from "./PaginatedList";
import Twitter from "./Twitter";
import { NavigationKeys, RootStackParamList } from "./constants";
import { ExamplesScreen } from "./ExamplesScreen";

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  useOnNativeBlankAreaEvents((offsetStart, offsetEnd, blankArea) => {
    console.log(`Blank area: ${blankArea}`);
  });
  useReactNativePerformanceFlipperPlugin();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={NavigationKeys.EXAMPLES}
          component={ExamplesScreen}
        />
        <Stack.Screen name={NavigationKeys.LIST} component={List} />
        <Stack.Screen
          name={NavigationKeys.PAGINATED_LIST}
          component={PaginatedList}
        />
        <Stack.Screen name={NavigationKeys.TWITTER} component={Twitter} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
