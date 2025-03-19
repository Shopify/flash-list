import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { RecyclerView } from "@shopify/flash-list";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH * 0.8;
const SPACING = 12;
const FULL_ITEM_WIDTH = ITEM_WIDTH + SPACING * 2;

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
    image: "https://images.unsplash.com/photo-1579033385971-a7bc8c5f4b75",
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
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc32",
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
];

const Carousel = () => {
  const flatListRef = useRef(null);

  const renderItem = ({ item }: { item: CarouselItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          console.log(`Pressed ${item.title}`);
        }}
        style={[styles.itemContainer, { backgroundColor: item.color }]}
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
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Simple Carousel</Text>

      <RecyclerView
        ref={flatListRef}
        data={carouselData}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={FULL_ITEM_WIDTH}
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
    paddingVertical: 10,
    paddingHorizontal: SPACING,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    marginHorizontal: SPACING,
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
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
