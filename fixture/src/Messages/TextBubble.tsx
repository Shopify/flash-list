import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

import Avatar from "./Avatar";

interface TextBubbleProps {
  text: string;
  avatar?: string;
  mine: boolean;
  name: string;
}

const TextBubble = ({ text, mine, avatar, name }: TextBubbleProps) => {
  return (
    <View style={mine ? {} : styles.otherBubbleWrapper}>
      <Avatar avatar={mine ? undefined : avatar} />
      <View style={mine ? styles.mineInfo : styles.otherInfo}>
        <Text style={mine ? styles.none : styles.name}> {name} </Text>
        <Text style={mine ? styles.mineBubble : styles.otherBubble}>
          {text}
        </Text>
      </View>
      <Image
        style={mine ? styles.mineArrow : styles.otherArrow}
        source={
          mine ? require("assets/arrow.png") : require("assets/arrowOther.png")
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  otherBubbleWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  mineInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  otherInfo: {
    display: "flex",
  },
  name: {
    color: "#666",
    fontWeight: "400",
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 0,
  },
  none: {
    display: "none",
    width: 0,
  },
  mineBubble: {
    backgroundColor: "#077FFF",
    color: "#FFF",
    borderRadius: 16,
    borderColor: "#fff",
    margin: 8,
    padding: 12,
    overflow: "hidden",
    marginLeft: 60,
    marginRight: 15,
  },
  otherBubble: {
    marginRight: 60,
    backgroundColor: "#E9E9EA",
    color: "#000",
    borderRadius: 16,
    borderColor: "#fff",
    margin: 8,
    marginTop: 4,
    padding: 12,
    overflow: "hidden",
  },
  mineArrow: {
    position: "absolute",
    right: 9,
    bottom: 7,
    width: 21,
    height: 16,
  },
  otherArrow: {
    position: "absolute",
    left: 44,
    bottom: 7,
    width: 21,
    height: 16,
  },
});

export default TextBubble;
