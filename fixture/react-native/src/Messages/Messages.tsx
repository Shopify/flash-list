import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";

import MessageType from "./models/MessageType";
import initialMessages from "./data/messages";
import TextInputBar from "./TextInputBar";
import userName from "./userName";
import MessageItem from "./MessageItem";
import Message from "./models/Message";

const Messages = () => {
  const [messages, setMessages] = useState(initialMessages);

  const appendMessage = (text: string) => {
    const message = {
      id: Math.floor(Math.random() * 1000000).toString(),
      text,
      sender: userName,
      type: MessageType.Text,
    } as Message;
    setMessages([...messages, message]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
      style={styles.keyboardAvoidingViewStyles}
    >
      {/* @ts-ignore - Type compatibility issue between different React versions */}
      <FlashList
        renderItem={MessageItem}
        inverted
        estimatedItemSize={100}
        keyExtractor={(item) => {
          return item.id;
        }}
        maintainVisibleContentPosition={{
          autoscrollToBottomThreshold: 0.2,
          startRenderingFromBottom: true,
        }}
        overrideItemLayout={(layout, item) => {
          switch (item.type) {
            case MessageType.Image:
              layout.size = 200;
              break;
          }
        }}
        getItemType={(item) => {
          return item.type;
        }}
        data={messages}
      />
      <TextInputBar
        onSend={(text) => {
          appendMessage(text);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingViewStyles: {
    flex: 1,
    marginBottom: 40,
    backgroundColor: "white",
  },
});

export default Messages;
