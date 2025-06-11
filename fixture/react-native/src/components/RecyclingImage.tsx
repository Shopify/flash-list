import React, { useMemo, useRef } from "react";
import { Animated, Image, ImageProps, Platform } from "react-native";

interface RecyclingImageProps extends Omit<ImageProps, "source"> {
  source: { uri?: string };
}
const isIOS = Platform.OS === "ios";

const RecyclingImageIOS = (props: RecyclingImageProps) => {
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useMemo(() => {
    animatedOpacity.setValue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.source.uri]);

  return (
    <Animated.Image
      {...props}
      style={[props.style, { opacity: animatedOpacity }]}
      onLoad={() => {
        animatedOpacity.setValue(1);
      }}
    />
  );
};

const RecyclingImageAndroid = (props: RecyclingImageProps) => {
  return <Image {...props} />;
};

export const RecyclingImage = isIOS ? RecyclingImageIOS : RecyclingImageAndroid;
