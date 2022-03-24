import { KeyboardAvoidingView, StyleSheet, FlatList } from "react-native";
import React, { useState } from "react";

import MessageType from "./models/MessageType";
import initialMessages from "./data/messages";
import TextInputBar from "./TextInputBar";
import UserName from "./UserName";
import MessageItem from "./MessageItem";
import Message from "./models/Message";

const MessagesFlatList = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const appendMessage = (text: string) => {
    const message = {
      text,
      sender: UserName,
      type: MessageType.Text,
    } as Message;

    setMessages((messages) => [message, ...messages]);
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={100}
      style={styles.keyboardAvoidingViewStyles}
    >
      <FlatList renderItem={MessageItem} inverted data={messages} />
      <TextInputBar
        onSend={function (text: string): void {
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
    backgroundColor: "#fff",
  },
});

export default MessagesFlatList;
