import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { tweets as tweetsData } from "./twitter/data/tweets";
import Tweet from "./twitter/models/Tweet";
import TweetCell from "./twitter/TweetCell";

// Example 1: Fade-in animation CellRendererComponent
const FadeInCellRenderer = (props: any) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      delay: props.index * 100,
      useNativeDriver: true,
    }).start();
  }, [opacity, props.index]);

  return (
    <Animated.View
      {...props}
      style={[
        props.style,
        {
          opacity,
        },
      ]}
    />
  );
};

// Example 2: Scale animation CellRendererComponent
const ScaleCellRenderer = (props: any) => {
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      delay: props.index * 50,
      useNativeDriver: true,
    }).start();
  }, [scale, props.index]);

  return (
    <Animated.View
      {...props}
      style={[
        props.style,
        {
          transform: [{ scale }],
        },
      ]}
    />
  );
};

// Main component that combines both examples
const FlashListCellRenderer = () => {
  const renderTweet = useCallback((info: { item: Tweet }) => {
    return <TweetCell tweet={info.item} />;
  }, []);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.header}>CellRendererComponent Examples</Text>
      <Text style={styles.description}>
        These examples demonstrate how to use CellRendererComponent to create
        custom animations and effects.
      </Text>

      <View style={styles.examplesContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Fade-In Animation</Text>
          <View style={{ flex: 1 }}>
            <FlashList
              data={tweetsData}
              renderItem={renderTweet}
              CellRendererComponent={FadeInCellRenderer}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>Scale Animation</Text>
          <View style={{ flex: 1 }}>
            <FlashList
              data={tweetsData}
              renderItem={renderTweet}
              CellRendererComponent={ScaleCellRenderer}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: "#666",
    lineHeight: 22,
  },
  examplesContainer: {
    flex: 1,
    flexDirection: "column",
  },
  container: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
});

export default FlashListCellRenderer;
