import React from "react";
import { StyleSheet, Image, View, Text } from "react-native";

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
    <View style={[styles.row, styles.actionBar]}>
      <View style={styles.rowTop}>
        <Image
          style={styles.actionButton}
          source={require("./assets/comment.png")}
        />
        <Text>{comments}</Text>
      </View>
      <View style={styles.rowTop}>
        <Image
          style={styles.actionButton}
          source={require("./assets/retweet.png")}
        />
        <Text>{retweets}</Text>
      </View>
      <View style={styles.rowTop}>
        <Image
          style={styles.actionButton}
          source={require("./assets/like.png")}
        />
        <Text>{likes}</Text>
      </View>
      <Image
        style={styles.actionButton}
        source={require("./assets/share.png")}
      />
    </View>
  );
};

const avatar = (author: Author) => {
  const image_url = author.avatar.replace("_normal", "");
  return <Image style={styles.avatar} source={{ uri: image_url }} />;
};

const TweetCell = (tweet: Tweet) => {
  const item = tweet.item;
  return (
    <View style={styles.singleItem}>
      <View style={styles.row}>
        {avatar(item.author)}
        <View style={styles.shrink}>
          <View style={styles.rowTop}>
            <Text numberOfLines={1} style={styles.header}>
              {item.author.name}
            </Text>
            <Text style={styles.gray}>@{item.author.screenName}</Text>
            <Text style={styles.gray}>·</Text>
            <Text style={styles.gray}>2h</Text>
          </View>
          <Text style={styles.description}>{item.fullText}</Text>
          {tweetActions(item.retweetCount, item.replyCount, item.favoriteCount)}
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
    margin: 8,
  },
  timeline: {
    backgroundColor: "#FFF",
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#eee",
  },
  gray: {
    color: "#777",
    paddingRight: 2,
  },
  sectionHeader: {
    backgroundColor: "#5f27cd",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderText: {
    fontWeight: "700",
    color: "white",
  },
  listHeader: {
    backgroundColor: "#eee",
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listHeaderText: {
    fontSize: 24,
    color: "#333",
    fontWeight: "600",
  },
  shrink: {
    flexShrink: 1,
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
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 4,
    paddingRight: 4,
  },
  description: {
    fontSize: 15,
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
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default TweetCell;
