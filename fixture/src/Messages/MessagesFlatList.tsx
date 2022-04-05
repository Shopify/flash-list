import {
  KeyboardAvoidingView,
  StyleSheet,
  FlatList,
  Platform,
  View,
} from "react-native";
import React, { useState } from "react";

import MessageType from "./models/MessageType";
import initialMessages from "./data/messages";
import TextInputBar from "./TextInputBar";
import userName from "./userName";
import MessageItem from "./MessageItem";
import Message from "./models/Message";

const MessagesFlatList = () => {
  const [messages, setMessages] = useState(initialMessages);

  const appendMessage = (text: string) => {
    const message = {
      text,
      sender: userName,
      type: MessageType.Text,
    } as Message;

    setMessages([message, ...messages]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
      style={styles.keyboardAvoidingViewStyles}
    >
      <FlatList
        renderItem={MessageItem}
        inverted
        data={messages}
        style={styles.list}
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
  list: {
    flex: 1,
  },
});

export default MessagesFlatList;
