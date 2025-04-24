import React, { useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRecyclingState, RecyclerView } from "@shopify/flash-list";

// Types for our data
interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  posterColor: string;
  rating: number;
  isFeatured?: boolean;
}

interface Category {
  id: number;
  title: string;
  movies: Movie[];
}

// Generate random movies
const generateMovies = (count: number, isFeatured = false): Movie[] => {
  const genres = [
    "Action",
    "Comedy",
    "Drama",
    "Thriller",
    "Sci-Fi",
    "Fantasy",
    "Horror",
    "Romance",
    "Adventure",
    "Animation",
  ];

  const colors = [
    "#1E3A8A", // Dark Blue
    "#14532D", // Dark Green
    "#7E22CE", // Purple
    "#B91C1C", // Dark Red
    "#0E7490", // Teal
    "#3730A3", // Indigo
    "#0F766E", // Dark Teal
    "#9D174D", // Pink
    "#B45309", // Amber
    "#065F46", // Emerald
    "#4C1D95", // Violet
    "#831843", // Fuchsia
  ];

  const titles = [
    "Cosmic Odyssey",
    "Midnight Shadows",
    "The Last Guardian",
    "Eternal Echoes",
    "Quantum Paradox",
    "Forgotten Realms",
    "Stellar Conquest",
    "Whispers in the Dark",
    "Chronicles of Time",
    "Mystic Legends",
    "Digital Dreams",
    "Parallel Worlds",
    "Neon Horizon",
    "Frozen Memories",
    "Galactic Frontier",
    "Silent Witness",
    "Primal Instinct",
    "Crimson Tide",
    "Emerald City",
    "Phantom Protocol",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    title: titles[i % titles.length],
    year: 2020 + (i % 5),
    genre: genres[i % genres.length],
    posterColor: colors[i % colors.length],
    rating: 3 + (i % 3) + (i % 10) / 10,
    isFeatured,
  }));
};

// Generate categories with movies
const generateCategories = (): Category[] => {
  return [
    {
      id: 1,
      title: "Trending Now",
      movies: generateMovies(15),
    },
    {
      id: 2,
      title: "New Releases",
      movies: generateMovies(15),
    },
    {
      id: 3,
      title: "Award Winners",
      movies: generateMovies(15),
    },
    {
      id: 4,
      title: "Recommended For You",
      movies: generateMovies(15),
    },
    {
      id: 5,
      title: "Critically Acclaimed",
      movies: generateMovies(15),
    },
    {
      id: 6,
      title: "Blockbusters",
      movies: generateMovies(15),
    },
    {
      id: 7,
      title: "Critically Acclaimed",
      movies: generateMovies(15),
    },
    {
      id: 8,
      title: "Critically Acclaimed",
      movies: generateMovies(15),
    },
    {
      id: 9,
      title: "Critically Acclaimed",
      movies: generateMovies(15),
    },
    {
      id: 10,
      title: "Critically Acclaimed",
      movies: generateMovies(15),
    },
    {
      id: 11,
      title: "Critically Acclaimed",
      movies: generateMovies(15),
    },
    {
      id: 12,
      title: "Critically Acclaimed",
      movies: generateMovies(15),
    },
    {
      id: 13,
      title: "Critically Acclaimed",
      movies: generateMovies(15),
    },
  ];
};

// Featured movie component
const FeaturedMovie = ({ movie }: { movie: Movie }) => {
  return (
    <View style={styles.featuredContainer}>
      <View
        style={[styles.featuredPoster, { backgroundColor: movie.posterColor }]}
      >
        <Text style={styles.featuredTitle}>{movie.title}</Text>
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredYear}>{movie.year}</Text>
          <Text style={styles.featuredGenre}>{movie.genre}</Text>
          <Text style={styles.featuredRating}>★ {movie.rating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.featuredDetails}>
        <Text style={styles.featuredTagline}>Featured Title</Text>
        <Pressable style={styles.playButton}>
          <Text style={styles.playButtonText}>▶ Play</Text>
        </Pressable>
        <Pressable style={styles.infoButton}>
          <Text style={styles.infoButtonText}>ⓘ More Info</Text>
        </Pressable>
      </View>
    </View>
  );
};

// Movie poster component
const MoviePoster = ({ item }: { item: Movie }) => {
  const [isExpanded, setIsExpanded] = useRecyclingState(false, [item.id]);

  return (
    <Pressable
      style={styles.posterContainer}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <View
        style={[
          styles.poster,
          { backgroundColor: item.posterColor },
          isExpanded && styles.posterExpanded,
        ]}
      >
        <Text style={styles.posterTitle}>{item.title}</Text>
        {isExpanded && (
          <View style={styles.posterInfo}>
            <Text style={styles.posterYear}>{item.year}</Text>
            <Text style={styles.posterGenre}>{item.genre}</Text>
            <Text style={styles.posterRating}>★ {item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

// Category row component
const CategoryRow = ({ category }: { category: Category }) => {
  useEffect(() => {
    console.log("Moview row mount", category.title);
  }, []);

  const renderMoviePoster = useCallback(
    ({ item }: { item: Movie }) => <MoviePoster item={item} />,
    []
  );

  return (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category.title}</Text>
      <View style={styles.horizontalListContainer}>
        <RecyclerView
          horizontal
          data={category.movies}
          renderItem={renderMoviePoster}
          keyExtractor={(item) => `${category.id}-${item.id}`}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

// Main component
const MovieList = () => {
  const featuredMovie = useMemo(() => generateMovies(1, true)[0], []);

  const categories = useMemo(() => generateCategories(), []);

  const renderFeaturedMovie = useCallback(
    () => <FeaturedMovie movie={featuredMovie} />,
    [featuredMovie]
  );

  const renderCategoryRow = useCallback(
    ({ item }: { item: Category }) => <CategoryRow category={item} />,
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.listContainer}>
        <RecyclerView
          data={categories}
          onLoad={({ elapsedTimeInMs }) => {
            console.log("onLoad ------------>", elapsedTimeInMs);
          }}
          ListHeaderComponent={renderFeaturedMovie}
          renderItem={renderCategoryRow}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");
const posterWidth = width / 3 - 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  listContainer: {
    flex: 1,
  },
  horizontalListContainer: {},
  // Featured movie styles
  featuredContainer: {
    marginBottom: 24,
  },
  featuredPoster: {
    height: 240,
    justifyContent: "flex-end",
    padding: 16,
  },
  featuredTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  featuredInfo: {
    flexDirection: "row",
    marginTop: 8,
  },
  featuredYear: {
    color: "white",
    marginRight: 12,
    fontSize: 14,
  },
  featuredGenre: {
    color: "white",
    marginRight: 12,
    fontSize: 14,
  },
  featuredRating: {
    color: "white",
    fontSize: 14,
  },
  featuredDetails: {
    padding: 16,
  },
  featuredTagline: {
    color: "#E50914",
    fontWeight: "bold",
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 8,
  },
  playButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  infoButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  infoButtonText: {
    color: "white",
  },
  // Category styles
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 12,
  },
  // Poster styles
  posterContainer: {
    marginLeft: 8,
    marginRight: 8,
  },
  poster: {
    width: posterWidth,
    height: posterWidth * 1.5,
    borderRadius: 8,
    justifyContent: "flex-end",
    padding: 8,
    overflow: "hidden",
  },
  posterExpanded: {
    height: posterWidth * 1.8,
  },
  posterTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  posterInfo: {
    marginTop: 8,
  },
  posterYear: {
    color: "white",
    fontSize: 12,
  },
  posterGenre: {
    color: "white",
    fontSize: 12,
  },
  posterRating: {
    color: "white",
    fontSize: 12,
  },
});

export default MovieList;
