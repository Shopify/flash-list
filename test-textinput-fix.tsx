/**
 * Test case for GitHub Issue #1980: FlashList TextInput Focus/Text Duplication on Scroll
 * 
 * This test demonstrates that the fix prevents TextInput focus and text from being
 * duplicated when scrolling, even when keyExtractor is not provided.
 * 
 * Before the fix:
 * - When focusing/typing in the last TextInput and scrolling up, the focus and text
 *   would appear on the first TextInput due to React key reuse during recycling.
 * 
 * After the fix:
 * - Each data item gets a unique stable ID using WeakMap, preventing incorrect key reuse.
 * - Focus and text remain only on the intended TextInput.
 */

import { FlashList } from "@shopify/flash-list";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function TestTextInputFix() {
  // Create 40 items without explicit IDs (simulating the bug scenario)
  const data = Array.from({ length: 40 }, (_, index) => ({
    question: `Question ${index + 1}`,
  }));

  // Note: No keyExtractor is provided - this is the scenario that caused the bug
  // The fix ensures that even without keyExtractor, each item gets a unique stable ID

  const renderItem = ({
    item,
  }: {
    item: { question: string };
  }) => (
    <View style={styles.itemContainer}>
      <TextInput 
        style={styles.input} 
        placeholder={item.question}
        testID={`textinput-${item.question}`}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={renderItem}
        estimatedItemSize={50}
        // keyExtractor is intentionally NOT provided to test the fix
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
  },
});

/**
 * How to test:
 * 1. Run this component in a React Native app
 * 2. Scroll to the bottom of the list
 * 3. Focus on the last TextInput (Question 40) and type some text
 * 4. Scroll back to the top
 * 5. Verify that the first TextInput (Question 1) does NOT have focus or the typed text
 * 
 * Expected behavior (with fix):
 * - Only the TextInput where you typed should retain the text
 * - No other TextInput should show focus or text duplication
 * 
 * Previous behavior (without fix):
 * - The first TextInput would incorrectly show the focus and text from the last TextInput
 */
