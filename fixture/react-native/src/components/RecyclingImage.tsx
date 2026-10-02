import React, { useLayoutEffect, useRef } from "react";
import { Animated, Image, ImageProps, Platform } from "react-native";

interface RecyclingImageProps extends Omit<ImageProps, "source"> {
  source: { uri?: string };
}
const isIOS = Platform.OS === "ios";

const RecyclingImageIOS = (props: RecyclingImageProps) => {
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    animatedOpacity.setValue(0);
  }, [animatedOpacity, props.source.uri]);

  return (
    <Animated.Image
      {...props}
      style={[props.style, { opacity: animatedOpacity }]}
      onLoad={(event) => {
        animatedOpacity.setValue(1);
        props.onLoad?.(event);
      }}
    />
  );
};

const RecyclingImageAndroid = (props: RecyclingImageProps) => {
  return <Image {...props} />;
};

export const RecyclingImage = isIOS ? RecyclingImageIOS : RecyclingImageAndroid;
