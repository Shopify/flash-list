import React from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import FastImage from "react-native-fast-image";

export interface Author {
  name: string;
  avatar: string;
  screenName: string;
}

export interface TweetItem {
  author: Author;
  fullText: string;
  retweetCount: number;
  replyCount: number;
  favoriteCount: number;
}

export interface Tweet {
  item: TweetItem;
}

const tweetActions = (retweets, comments, likes) => {
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
  const placeholder_url = author.avatar;
  const image_url = author.avatar.replace("_normal", "");
  return (
    <FastImage
      style={styles.avatar}
      source={{ uri: image_url }}
      placeholderSource={{ uri: placeholder_url }}
    />
  );
};

const TweetCell = (tweet: Tweet) => {
  const item = tweet.item;
  return (
    <View style={styles.singleItem}>
      <View style={styles.row}>
        {avatar(item.author)}
        <View style={[styles.shrink, styles.grow]}>
          <View style={styles.rowTop}>
            <Text numberOfLines={1} style={styles.header}>
              {item.author.name}
            </Text>
            <Text style={[styles.gray, styles.shrink]} numberOfLines={1}>
              @{item.author.screenName}
            </Text>
            <Text style={styles.gray}>·</Text>
            <Text style={styles.gray}>2h</Text>
          </View>
          <Text style={styles.description}>{item.fullText}</Text>
          <View style={styles.rowActions}>
            {tweetActions(
              item.retweetCount,
              item.replyCount,
              item.favoriteCount
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionBar: {
    marginTop: 8,
    justifyContent: "space-between",
    marginRight: 16,
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
  shrink: {
    flexShrink: 1,
  },
  grow: {
    flexGrow: 1,
  },
  avatar: {
    height: 44,
    width: 44,
    borderRadius: 22,
    marginRight: 16,
    flexShrink: 0,
    marginTop: 4,
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
    paddingHorizontal: 16,
    minHeight: 44,
    flex: 1,
    padding: 16,
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  actionText: {
    fontSize: 12,
    color: "#444",
  },
  ellipsis: {
    flexWrap: "wrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

export default TweetCell;
