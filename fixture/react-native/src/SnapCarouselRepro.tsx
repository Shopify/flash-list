import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

/**
 * Repro screen for issue #2427 - Android horizontal snapToInterval carousel
 * over-snapping to index 0 on a backward swipe.
 *
 * Swipe forward a few cards until recycling kicks in, then swipe backward.
 * The "settled on" readout should move one card at a time. Landing on card 1
 * from the middle of the list is the bug.
 */

const ITEMS = Array.from({ length: 20 }, (_, i) => String(i + 1));
const CARD_GAP = 12;

export const SnapCarouselRepro = () => {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 48;
  const snapInterval = cardWidth + CARD_GAP;

  const [active, setActive] = useState(0);
  const [offset, setOffset] = useState(0);

  const onSettle = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      setOffset(Math.round(x));
      setActive(Math.round(x / snapInterval));
    },
    [snapInterval]
  );

  return (
    <View style={styles.container} testID="SnapCarouselReproScreen">
      <Text style={styles.readout} testID="SnapCarouselActive">
        settled on: {active + 1}
      </Text>
      <Text style={styles.offset}>offset: {offset}</Text>
      <FlashList
        data={ITEMS}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        onMomentumScrollEnd={onSettle}
        onScrollEndDrag={onSettle}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardText}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: "#111" },
  readout: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 24,
  },
  offset: { fontSize: 18, color: "#9bd", paddingHorizontal: 24, marginTop: 4 },
  card: {
    height: 320,
    marginRight: CARD_GAP,
    marginTop: 20,
    backgroundColor: "tomato",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  cardText: { fontSize: 96, fontWeight: "bold", color: "#fff" },
});

export default SnapCarouselRepro;
