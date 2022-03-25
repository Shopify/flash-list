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
import { ListsProfiler } from "@shopify/react-native-performance-lists-profiler";
import { Platform, UIManager } from "react-native";

import List from "./List";
import PaginatedList from "./PaginatedList";
import Twitter from "./Twitter";
import { NavigationKeys, RootStackParamList } from "./constants";
import { ExamplesScreen } from "./ExamplesScreen";
import TwitterFlatList from "./TwitterFlatList";
import Reminders from "./Reminders";

const Stack = createStackNavigator<RootStackParamList>();

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
          <Stack.Screen name={NavigationKeys.REMINDERS} component={Reminders} />
          <Stack.Screen
            name={NavigationKeys.TWITTER_FLAT_LIST}
            component={TwitterFlatList}
            options={{ title: "Twitter" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ListsProfiler>
  );
};

export default App;
