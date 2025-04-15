import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { RecyclerView } from "@shopify/flash-list";

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
}

const carouselData: CarouselItem[] = [
  {
    id: "1",
    title: "Northern Lights",
    description: "Experience the magic of the aurora borealis",
    image: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22",
    color: "#4E7A9B",
  },
  {
    id: "2",
    title: "Santorini Sunset",
    description: "Breathtaking views of the Aegean Sea",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
    color: "#D98F6C",
  },
  {
    id: "3",
    title: "Tropical Paradise",
    description: "Crystal clear waters and palm trees",
    image: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb",
    color: "#56A97D",
  },
  {
    id: "4",
    title: "Mountain Expedition",
    description: "Conquer the highest peaks",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    color: "#7C6C77",
  },
  {
    id: "5",
    title: "Desert Adventure",
    description: "Discover the beauty of sand dunes",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35",
    color: "#C19875",
  },
  {
    id: "6",
    title: "Tokyo Nights",
    description: "Explore vibrant urban landscapes",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26",
    color: "#614B79",
  },
  {
    id: "7",
    title: "Forest Retreat",
    description: "Find peace among towering trees",
    image: "https://images.unsplash.com/photo-1511497584788-876760111969",
    color: "#3E5641",
  },
  {
    id: "8",
    title: "Coastal Journey",
    description: "Follow dramatic cliffs and ocean views",
    image: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220",
    color: "#6A8CAA",
  },
  {
    id: "9",
    title: "Snowy Peaks",
    description: "Winter wonderland adventures await",
    image: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6",
    color: "#8A9BAA",
  },
];

const Carousel = () => {
  const flatListRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();

  const renderItem = useCallback(
    ({ item }: { item: CarouselItem }) => {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            console.log(`Pressed ${item.title}`);
          }}
          style={[
            styles.itemContainer,
            { backgroundColor: item.color, width: screenWidth * 0.8 },
          ]}
        >
          <Image
            source={{ uri: `${item.image}?auto=format&fit=crop&w=800&q=80` }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [screenWidth]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Simple Carousel</Text>
      <RecyclerView
        style={{ flex: 1 }}
        ref={flatListRef}
        data={carouselData}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth * 0.8 + 32}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        scrollEventThrottle={16}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
  },
  flatListContent: {
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  itemContainer: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  textContainer: {
    padding: 15,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#FFFFFFCC",
  },
});

export default Carousel;
