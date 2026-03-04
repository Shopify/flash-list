import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";

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

let nextId = 0;

export function ChatInverted() {
  const listRef = useRef<FlashListRef<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    generateInitialMessages(20)
  );

  const loadOlderMessages = useCallback(() => {
    const newMessages = Array.from({ length: 10 }, () =>
      generateRandomMessage()
    );
    setMessages((prev) => [...prev, ...newMessages]);
  }, []);

  const addNewMessage = useCallback(() => {
    const newMessage = generateRandomMessage();
    setMessages((prev) => [newMessage, ...prev]);
  }, []);

  const renderItem = useCallback((info: { item: ChatMessage }) => {
    return <MessageBubble message={info.item} />;
  }, []);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea} testID="ChatInvertedScreen">
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.topButton]}
            onPress={loadOlderMessages}
          >
            <Text style={styles.buttonText}>Load Older</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.bottomButton]}
            onPress={addNewMessage}
          >
            <Text style={styles.buttonText}>New Message</Text>
          </Pressable>
        </View>

        <FlashList
          ref={listRef}
          data={messages}
          inverted
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={loadOlderMessages}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>Beginning of chat</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

function generateInitialMessages(count: number): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const minutesAgo = i;
    const timestamp = new Date(now.getTime() - minutesAgo * 60000);

    messages.push({
      id: `msg-${nextId++}`,
      text: messageTexts[i % messageTexts.length],
      sender: i % 2 === 0 ? "user" : "other",
      timestamp,
    });
  }

  return messages;
}

function generateRandomMessage(): ChatMessage {
  const id = nextId++;
  return {
    id: `msg-${id}`,
    text: messageTexts[id % messageTexts.length],
    sender: id % 2 === 0 ? "user" : "other",
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
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    color: "#999",
    fontSize: 14,
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
