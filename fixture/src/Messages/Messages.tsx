import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import React, { useRef, useState } from "react";

import MessageType from "./models/MessageType";
import TextInputBar from "./TextInputBar";
import userName from "./userName";
import MessageItem from "./MessageItem";
import Message from "./models/Message";

const Messages = () => {
  const [messages, setMessages] = useState([] as Message[]);

  const appendMessage = (text: string) => {
    const message = {
      id: Math.floor(Math.random() * 1000000).toString(),
      text,
      sender: userName,
      type: MessageType.Text,
    } as Message;
    setMessages([message, ...messages]);
    requestAnimationFrame(() => {
      if (
        flashListRef.current?.experimentalFindApproxFirstVisibleIndex()! < 2
      ) {
        flashListRef.current?.scrollToIndex({ index: 0, animated: true });
      }
    });
  };

  const flashListRef = useRef<FlashList<Message>>(null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
      style={styles.keyboardAvoidingViewStyles}
    >
      <FlashList
        ref={flashListRef}
        renderItem={MessageItem}
        inverted
        estimatedItemSize={100}
        keyExtractor={(item) => {
          return item.id;
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
        experimentalMaintainTopContentPosition
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
