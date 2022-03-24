import React from "react";
import { StyleSheet, View, Image, Text, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";

import Author from "./models/Author";
import Tweet from "./models/Tweet";

export interface TweetCellProps {
  tweet: Tweet;
}

const tweetActions = (
  retweets: React.ReactNode,
  comments: React.ReactNode,
  likes: React.ReactNode
) => {
  return (
    <View style={[styles.rowActions, styles.actionBar]}>
      <View style={styles.elemAction}>
        <Image
          style={styles.actionButton}
          source={require("./assets/comment.png")}
        />
        <Text style={styles.actionText}>{comments}</Text>
      </View>
      <View style={styles.elemAction}>
        <Image
          style={styles.actionButton}
          source={require("./assets/retweet.png")}
        />
        <Text style={styles.actionText}>{retweets}</Text>
      </View>
      <View style={styles.elemAction}>
        <Image
          style={styles.actionButton}
          source={require("./assets/like.png")}
        />
        <Text style={styles.actionText}>{likes}</Text>
      </View>
      <Image
        style={styles.actionButton}
        source={require("./assets/share.png")}
      />
    </View>
  );
};

const avatar = (author: Author) => {
  const imageUrl = author.avatar.replace("_normal", "");
  return <FastImage style={styles.avatar} source={{ uri: imageUrl }} />;
};
interface GrayTextProps {
  children: React.ReactNode;
  numberOfLines?: number;
  style?: ViewStyle;
}

const GrayText = ({ children, numberOfLines, style }: GrayTextProps) => {
  return (
    <Text style={[style, styles.gray]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};
const tweetImage = (tweet: Tweet) => {
  if (tweet.image !== undefined) {
    return (
      <FastImage style={styles.tweetImage} source={{ uri: tweet.image }} />
    );
  }
  return <></>;
};
const likedText = (tweet: Tweet) => {
  if (tweet.someLiked !== undefined) {
    return (
      <View style={styles.likedRow}>
        <Image
          style={styles.actionButton}
          source={require("./assets/like.png")}
        />
        <Text style={styles.likedText}>{tweet.someLiked}</Text>
      </View>
    );
  }
  return <></>;
};

const TweetCell = ({ tweet }: TweetCellProps) => {
  return (
    <View style={styles.singleItem}>
      {likedText(tweet)}
      <View style={styles.row}>
        {avatar(tweet.author)}
        <View style={{ flexShrink: 1, flexGrow: 1 }}>
          <View style={styles.rowTop}>
            <Text numberOfLines={1} style={styles.header}>
              {tweet.author.name}
            </Text>
            <GrayText style={styles.author} numberOfLines={1}>
              @{tweet.author.screenName}
            </GrayText>
            <GrayText>·</GrayText>
            <GrayText>2h</GrayText>
          </View>
          <Text style={styles.description}>{tweet.fullText}</Text>
          {tweetImage(tweet)}
          <View style={styles.rowActions}>
            {tweetActions(
              tweet.retweetCount,
              tweet.replyCount,
              tweet.favoriteCount
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  author: {
    flexShrink: 1,
  },
  actionBar: {
    marginTop: 8,
    justifyContent: "space-between",
    marginRight: 16,
  },
  likedRow: {
    flexDirection: "row",
    marginLeft: 32,
  },
  likedText: {
    fontWeight: "700",
    marginBottom: 4,
    paddingLeft: 0,
    color: "#666",
    fontSize: 12,
  },
  actionButton: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  gray: {
    color: "#777",
    fontSize: 13,
    paddingRight: 2,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 8,
    flexShrink: 0,
  },
  header: {
    fontSize: 14,
    fontWeight: "bold",
    paddingBottom: 4,
    paddingRight: 4,
    color: "#000",
  },
  description: {
    fontSize: 14,
    color: "#000",
  },
  singleItem: {
    paddingHorizontal: 15,
    minHeight: 44,
    flex: 1,
    paddingTop: 11,
    paddingBottom: 13,
    backgroundColor: "#FFF",
  },
  rowTop: {
    flexDirection: "row",
  },
  rowActions: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
  },
  elemAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  actionText: {
    fontSize: 12,
    color: "#444",
  },
  tweetImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default TweetCell;
