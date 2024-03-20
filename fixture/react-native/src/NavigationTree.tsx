import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Reminders from "./Reminders";
import List from "./List";
import PaginatedList from "./PaginatedList";
import { Twitter, TwitterFlatList, TweetDetailScreen } from "./twitter";
import ContactsSectionList from "./contacts/ContactsSectionList";
import Contacts from "./contacts/Contacts";
import { RootStackParamList } from "./constants";
import { ExamplesScreen } from "./ExamplesScreen";
import { DebugScreen } from "./Debug";
import { Messages, MessagesFlatList } from "./Messages";
import TwitterBenchmark from "./twitter/TwitterBenchmark";
import TwitterCustomCellContainer from "./twitter/CustomCellRendererComponent";
import { Masonry } from "./Masonry";

const Stack = createStackNavigator<RootStackParamList>();

const NavigationTree = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen name="Examples" component={ExamplesScreen} />
          <Stack.Screen name="List" component={List} />
          <Stack.Screen name="PaginatedList" component={PaginatedList} />
          <Stack.Screen name="Twitter" component={Twitter} />
          <Stack.Screen name="Reminders" component={Reminders} />
          <Stack.Screen
            name="TwitterFlatList"
            component={TwitterFlatList}
            options={{ title: "Twitter" }}
          />
          <Stack.Screen name="Contacts" component={Contacts} />
          <Stack.Screen
            name="ContactsSectionList"
            component={ContactsSectionList}
            options={{ title: "Contacts" }}
          />
          <Stack.Screen
            name="TweetDetailScreen"
            component={TweetDetailScreen}
          />
          <Stack.Screen name="Messages" component={Messages} />
          <Stack.Screen name="MessagesFlatList" component={MessagesFlatList} />
          <Stack.Screen name="TwitterBenchmark" component={TwitterBenchmark} />
          <Stack.Screen
            name="TwitterCustomCellContainer"
            component={TwitterCustomCellContainer}
          />
        </Stack.Group>
        <Stack.Screen name="Masonry" component={Masonry} />
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen name="Debug" component={DebugScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationTree;
