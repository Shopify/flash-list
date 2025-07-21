import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

const messageTexts = [
  "Hey, how are you?",
  "What's up?",
  "Did you see that new movie?",
  "I'm working on a new project",
  "Let's catch up soon!",
  "Have you tried the new restaurant downtown?",
  "Just finished reading an amazing book",
  "Can you send me that file?",
  "Are we still meeting tomorrow?",
  "The weather is beautiful today!",
];

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    generateInitialMessages(14)
  );

  const addMessageAtTop = useCallback(() => {
    const newMessages = Array.from({ length: 10 }, (_, i) =>
      generateRandomMessage(i)
    );
    setMessages((prev) => [...newMessages, ...prev]);
  }, []);

  const addMessageAtBottom = useCallback(() => {
    const newMessage = generateRandomMessage(messages.length);
    setMessages((prev) => [...prev, newMessage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = useCallback((info: { item: ChatMessage }) => {
    return <MessageBubble message={info.item} />;
  }, []);

  const maintainVisibleContentPositionConfig = useMemo(
    () => ({
      autoscrollToBottomThreshold: 0.1,
      startRenderingFromBottom: true,
    }),
    []
  );

  const listHeaderComponent = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Example</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea} testID="ChatScreen">
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat Example</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.topButton]}
            onPress={addMessageAtTop}
          >
            <Text style={styles.buttonText}>Add at Top</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.bottomButton]}
            onPress={addMessageAtBottom}
          >
            <Text style={styles.buttonText}>Add at Bottom</Text>
          </Pressable>
        </View>

        <FlashList
          data={messages}
          maintainVisibleContentPosition={maintainVisibleContentPositionConfig}
          onStartReached={() => {
            console.log("onStartReached");
            addMessageAtTop();
          }}
          ListHeaderComponent={listHeaderComponent}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </View>
    </SafeAreaView>
  );
}

function generateInitialMessages(count: number): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const minutesAgo = count - i;
    const timestamp = new Date(now.getTime() - minutesAgo * 60000);

    messages.push({
      id: `msg-${i}`,
      text: messageTexts[i % messageTexts.length],
      sender: i % 2 === 0 ? "user" : "other",
      timestamp,
    });
  }

  return messages;
}

function generateRandomMessage(index: number): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    text: messageTexts[index % messageTexts.length],
    sender: index % 2 === 0 ? "user" : "other",
    timestamp: new Date(),
  };
}

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.sender === "user";

  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{message.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  topButton: {
    backgroundColor: "#4a90e2",
  },
  bottomButton: {
    backgroundColor: "#50c878",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  messageBubbleContainer: {
    paddingHorizontal: 12,
    marginVertical: 4,
    flexDirection: "row",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: "#dcf8c6",
    borderBottomRightRadius: 1,
  },
  otherMessage: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 1,
  },
  messageText: {
    fontSize: 16,
    color: "#000000",
  },
});
