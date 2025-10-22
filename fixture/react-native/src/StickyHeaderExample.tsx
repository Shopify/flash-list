import React, {
  forwardRef,
  ForwardedRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Text, View, Switch, StyleSheet } from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";

// Define our data structure
type Item =
  | {
      type: "basic";
      title: string;
    }
  | {
      type: "header";
      title: string;
    };

const data: Item[] = Array.from({ length: 300 }, (_, index) =>
  index % 20 === 0
    ? {
        type: "header",
        title: `Header ${index / 20 + 1}`,
      }
    : {
        type: "basic",
        title: `Item ${index - Math.floor(index / 20) + 1}`,
      }
);

const headerIndices = data
  .map((item, index) => (item.type === "header" ? index : null))
  .filter((item) => item !== null) as number[];

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}
const Toggle = ({ label, value, onChange }: ToggleProps) => {
  return (
    <View style={styles.toggleContainer}>
      <Text>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
};

const ItemSeparator = () => {
  return <View style={styles.itemSeparator} />;
};

// Create our masonry component
export const StickyHeaderExample = forwardRef(
  (_: unknown, ref: ForwardedRef<unknown>) => {
    const [stickyHeadersEnabled, setStickyHeadersEnabled] = useState(false);
    const [withStickyHeaderOffset, setWithStickyHeaderOffset] = useState(false);
    const [withStickyHeaderBackground, setWithStickyHeaderBackground] =
      useState(false);

    // Memoize the renderItem function
    const renderItem = useCallback(
      ({ item }: { item: Item }) => (
        <View style={item.type === "header" ? styles.headerItem : styles.item}>
          <Text>{item.title}</Text>
        </View>
      ),
      []
    );

    const stickyHeaderConfig = useMemo(
      () => ({
        offset: withStickyHeaderOffset ? 44 : 0,
        backdropComponent: withStickyHeaderBackground ? (
          <View style={styles.stickyHeaderBackdropContainer}>
            <View style={styles.stickyHeaderBackground} />
          </View>
        ) : undefined,
      }),
      [withStickyHeaderOffset, withStickyHeaderBackground]
    );

    return (
      <View
        style={styles.container}
        key={`${stickyHeadersEnabled}-${withStickyHeaderOffset}-${withStickyHeaderBackground}`}
      >
        <View>
          <Toggle
            label="Enable Sticky Headers"
            value={stickyHeadersEnabled}
            onChange={setStickyHeadersEnabled}
          />
          <Toggle
            label="Sticky Header Offset"
            value={withStickyHeaderOffset}
            onChange={setWithStickyHeaderOffset}
          />
          <Toggle
            label="Sticky Header Background"
            value={withStickyHeaderBackground}
            onChange={setWithStickyHeaderBackground}
          />
        </View>
        <View style={styles.listContainer}>
          <FlashList
            ref={ref as React.RefObject<FlashListRef<Item>>}
            renderItem={renderItem}
            alwaysBounceVertical
            data={data}
            stickyHeaderIndices={
              stickyHeadersEnabled ? headerIndices : undefined
            }
            stickyHeaderConfig={stickyHeaderConfig}
            ItemSeparatorComponent={ItemSeparator}
          />
        </View>
      </View>
    );
  }
);
StickyHeaderExample.displayName = "StickyHeaderExample";

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
  stickyHeaderBackdropContainer: {
    position: "absolute",
    width: "100%",
    inset: 0,
  },
  stickyHeaderBackground: {
    height: 44,
    backgroundColor: "#40C4FF4C",
  },
  headerItem: {
    height: 44,
    backgroundColor: "#FFAB40AA",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  item: {
    height: 44,
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
});
