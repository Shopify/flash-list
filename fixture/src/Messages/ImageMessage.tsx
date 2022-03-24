import React from "react";
import { View, StyleSheet, Image } from "react-native";

interface ImageMessageProps {
  image: string;
  mine: boolean;
}

const ImageMessage = ({ image, mine }: ImageMessageProps) => {
  return (
    <View style={mine ? styles.mineImageWrapper : styles.otherImageWrapper}>
      <Image style={styles.image} source={{ uri: image }} />
    </View>
  );
};

export default ImageMessage;

const styles = StyleSheet.create({
  otherImageWrapper: {
    margin: 8,
  },
  mineImageWrapper: {
    margin: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  image: {
    width: "80%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
});
