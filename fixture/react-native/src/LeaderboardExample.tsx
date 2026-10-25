import React, {
  forwardRef,
  ForwardedRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import {
  FlashList,
  type FlashListRef,
  type ListRenderItemInfo,
} from "@shopify/flash-list";

interface Player {
  rank: number;
  name: string;
  points: number;
  isCurrentUser: boolean;
}

const PLAYER_COUNT = 500;
const CURRENT_USER_RANK = 237;

const players: Player[] = Array.from({ length: PLAYER_COUNT }, (_, index) => {
  const rank = index + 1;
  const isCurrentUser = rank === CURRENT_USER_RANK;
  return {
    rank,
    name: isCurrentUser ? "You" : `Player ${rank}`,
    points: (PLAYER_COUNT - index) * 37,
    isCurrentUser,
  };
});

const currentUserIndex = CURRENT_USER_RANK - 1;

// The same index is sticky as a header and as a footer, so the current user's row
// sticks to the top when scrolled past and to the bottom before it is reached
const currentUserStickyIndices = [currentUserIndex];

const ItemSeparator = () => {
  return <View style={styles.itemSeparator} />;
};

export const LeaderboardExample = forwardRef(
  (_: unknown, ref: ForwardedRef<unknown>) => {
    const listRef = useRef<FlashListRef<Player>>(null);
    useImperativeHandle(ref, () => listRef.current);

    const [hideRelatedCell, setHideRelatedCell] = useState(false);

    const scrollToCurrentUser = useCallback(() => {
      listRef.current?.scrollToIndex({
        index: currentUserIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }, []);

    const renderItem = useCallback(
      ({ item, target }: ListRenderItemInfo<Player>) => {
        const isSticky = target === "StickyHeader" || target === "StickyFooter";
        const row = (
          <View
            style={[
              styles.row,
              item.isCurrentUser && styles.currentUserRow,
              isSticky && styles.stickyRow,
            ]}
          >
            <Text style={styles.rank}>#{item.rank}</Text>
            <Text style={[styles.name, item.isCurrentUser && styles.bold]}>
              {item.name}
            </Text>
            <Text style={styles.points}>{item.points} pts</Text>
          </View>
        );
        // Only the pinned copy jumps to the real row
        return isSticky ? (
          <Pressable onPress={scrollToCurrentUser}>{row}</Pressable>
        ) : (
          row
        );
      },
      [scrollToCurrentUser]
    );

    const stickyHeaderConfig = useMemo(
      () => ({ hideRelatedCell }),
      [hideRelatedCell]
    );
    const stickyFooterConfig = useMemo(
      () => ({ hideRelatedCell }),
      [hideRelatedCell]
    );

    return (
      <View style={styles.container} key={`${hideRelatedCell}`}>
        <View style={styles.toggleContainer}>
          <Text>Hide Related Cell</Text>
          <Switch value={hideRelatedCell} onValueChange={setHideRelatedCell} />
        </View>
        <Text style={styles.hint}>
          Your rank stays visible: pinned to the top after you scroll past it,
          and to the bottom before you reach it. Tap it to jump to your row.
        </Text>
        <View style={styles.listContainer}>
          <FlashList
            ref={listRef}
            data={players}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.rank}`}
            stickyHeaderIndices={currentUserStickyIndices}
            stickyFooterIndices={currentUserStickyIndices}
            stickyHeaderConfig={stickyHeaderConfig}
            stickyFooterConfig={stickyFooterConfig}
            ItemSeparatorComponent={ItemSeparator}
          />
        </View>
      </View>
    );
  }
);
LeaderboardExample.displayName = "LeaderboardExample";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  hint: {
    paddingHorizontal: 16,
    color: "#555555",
  },
  listContainer: {
    borderRadius: 20,
    backgroundColor: "#C0C0CC",
    margin: 16,
    overflow: "hidden",
    flex: 1,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "#CDCDCD",
  },
  row: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  currentUserRow: {
    backgroundColor: "#FFE082",
  },
  stickyRow: {
    backgroundColor: "#FFCA28",
  },
  rank: {
    width: 56,
    color: "#555555",
  },
  name: {
    flex: 1,
  },
  bold: {
    fontWeight: "bold",
  },
  points: {
    color: "#555555",
  },
});
