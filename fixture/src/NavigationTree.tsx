import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import TwitterFlatList from "./TwitterFlatList";
import Reminders from "./Reminders";
import List from "./List";
import PaginatedList from "./PaginatedList";
import Twitter from "./Twitter";
import { NavigationKeys, RootStackParamList } from "./constants";
import { ExamplesScreen } from "./ExamplesScreen";
import { DebugScreen } from "./Debug";

const Stack = createStackNavigator<RootStackParamList>();

const NavigationTree = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
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
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen name={NavigationKeys.DEBUG} component={DebugScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationTree;
