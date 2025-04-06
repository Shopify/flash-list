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
import { Masonry } from "./Masonry";
import { ComplexMasonry } from "./ComplexMasonry";
import { SectionList } from "./SectionList";
import { Grid } from "./Grid";
import HorizontalList from "./HorizontalList";
import { Chat } from "./Chat";
import FlashListCellRenderer from "./CellRendererExamples";
import { HeaderFooterExample } from "./HeaderFooterExample";
import DynamicItems from "./DynamicItems";
import RecyclerViewHandlerTest from "./RecyclerViewHandlerTest";
import MovieList from "./MovieList";
import Carousel from "./Carousel";
import { LayoutOptions } from "./LayoutOptions";

const Stack = createStackNavigator<RootStackParamList>();

const NavigationTree = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animation: "none" }}>
        <Stack.Group>
          <Stack.Screen name="Examples" component={ExamplesScreen} />
          <Stack.Screen name="List" component={List} />
          <Stack.Screen name="Grid" component={Grid} />
          <Stack.Screen name="SectionList" component={SectionList} />
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
          <Stack.Screen name="DynamicItems" component={DynamicItems} />
          <Stack.Screen
            name="TweetDetailScreen"
            component={TweetDetailScreen}
          />
          <Stack.Screen name="Messages" component={Messages} />
          <Stack.Screen name="MessagesFlatList" component={MessagesFlatList} />
          <Stack.Screen name="TwitterBenchmark" component={TwitterBenchmark} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen
            name="HeaderFooterExample"
            component={HeaderFooterExample}
            options={{ title: "Header Footer Empty Example" }}
          />
          <Stack.Screen
            name="RecyclerViewHandlerTest"
            component={RecyclerViewHandlerTest}
            options={{ title: "RecyclerView Handler Test" }}
          />
          <Stack.Screen
            name="MovieList"
            component={MovieList}
            options={{ title: "Movie Streaming" }}
          />
          <Stack.Screen
            name="Carousel"
            component={Carousel}
            options={{ title: "Carousel Example" }}
          />
          <Stack.Screen
            name="LayoutOptions"
            component={LayoutOptions}
            options={{ title: "Layout Options" }}
          />
        </Stack.Group>
        <Stack.Screen name="Masonry" component={Masonry} />
        <Stack.Screen name="ComplexMasonry" component={ComplexMasonry} />
        <Stack.Screen name="HorizontalList" component={HorizontalList} />
        <Stack.Screen
          name="CellRendererExamples"
          component={FlashListCellRenderer}
          options={{ title: "CellRenderer Examples" }}
        />
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen name="Debug" component={DebugScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationTree;
