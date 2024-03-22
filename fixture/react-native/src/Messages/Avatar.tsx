import React from "react";
import { StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";

interface AvatarProps {
  avatar?: string;
}

const Avatar = ({ avatar }: AvatarProps) => {
  if (avatar === undefined) {
    return null;
  }
  return <FastImage style={styles.avatar} source={{ uri: avatar }} />;
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    height: 30,
    width: 30,
    borderRadius: 15,
    margin: 8,
    marginRight: 0,
    marginTop: 0,
    flexShrink: 0,
  },
});
