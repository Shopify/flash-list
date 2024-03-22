import React, { useState } from "react";
import { View, StyleSheet, Image, TextInput, Pressable } from "react-native";

interface TextInputBarProps {
  onSend: (text: string) => void;
}

const TextInputBar = ({ onSend }: TextInputBarProps) => {
  const [text, setText] = useState("");

  return (
    <View style={styles.textInputBar}>
      <TextInput
        style={styles.textInput}
        autoCorrect={false}
        multiline
        onChangeText={setText}
        value={text}
      />
      <Pressable
        style={styles.sendButtonWrapper}
        onPress={() => {
          if (text.length < 1) {
            return;
          }
          onSend(text);
          setText("");
        }}
      >
        <Image
          style={[
            styles.sendButton,
            text.length < 1 ? { opacity: 0.3 } : { opacity: 1 },
          ]}
          source={require("assets/send.png")}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  textInputBar: {
    width: "100%",
    flexDirection: "row",
    flexGrow: 0,
  },
  textInput: {
    borderRadius: 20,
    borderColor: "#ddd",
    borderWidth: 0.5,
    paddingHorizontal: 16,
    fontSize: 16,
    margin: 8,
    paddingVertical: 8,
    paddingTop: 8,
    paddingRight: 40,
    flexGrow: 0,
    minWidth: "95%",
  },
  sendButtonWrapper: {
    position: "absolute",
    bottom: -4,
    right: 0,
    width: 44,
    height: 44,
    flexShrink: 0,
  },
  sendButton: {
    width: 28,
    height: 28,
  },
});

export default TextInputBar;
