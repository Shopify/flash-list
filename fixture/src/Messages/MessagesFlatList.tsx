import { KeyboardAvoidingView, StyleSheet, FlatList } from "react-native";
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
      behavior="padding"
      keyboardVerticalOffset={100}
      style={styles.keyboardAvoidingViewStyles}
    >
      <FlatList renderItem={MessageItem} inverted data={messages} />
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

export default MessagesFlatList;
