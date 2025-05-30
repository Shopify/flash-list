import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { RecyclerView } from "@shopify/flash-list";

// Import available images
const profileImages = [
  require("./assets/tamara.jpg"),
  require("./assets/mohamad.jpg"),
  require("./assets/mubariz.jpg"),
  require("./assets/anabelle.jpg"),
  require("./assets/candice.jpg"),
];

const icons = {
  like: require("./assets/like.png"),
  comment: require("./assets/comment.png"),
  share: require("./assets/share.png"),
  retweet: require("./assets/retweet.png"),
};

// Types for our complex data structure
interface Story {
  id: string;
  username: string;
  avatar: any;
  isLive?: boolean;
  hasStory?: boolean;
}

interface Post {
  id: string;
  title: string;
  description: string;
  imageColor: string;
  likes: number;
  comments: number;
  category: string;
  author: string;
  avatar: any;
}

interface LiveStream {
  id: string;
  title: string;
  streamerName: string;
  viewers: number;
  category: string;
  thumbnailColor: string;
  avatar: any;
}

interface Topic {
  id: string;
  name: string;
  posts: number;
  trending: boolean;
  bgColor: string;
}

interface Channel {
  id: string;
  name: string;
  subscribers: string;
  verified: boolean;
  coverColor: string;
  avatar: any;
}

interface Section {
  id: string;
  type: "stories" | "posts" | "live" | "topics" | "channels";
  title: string;
  data: any[];
}

// Generate mock data
const generateStories = (): Story[] => {
  const usernames = [
    "You",
    "Sarah",
    "Mike",
    "Emma",
    "John",
    "Lisa",
    "David",
    "Anna",
  ];
  return usernames.map((username, index) => ({
    id: `story-${index}`,
    username,
    avatar: profileImages[index % profileImages.length],
    isLive: index === 2 || index === 5,
    hasStory: index !== 0,
  }));
};

const generatePosts = (count: number): Post[] => {
  const categories = ["Travel", "Food", "Tech", "Art", "Music", "Fashion"];
  const titles = [
    "Amazing sunset in Bali",
    "The future of AI",
    "Street art masterpiece",
    "Best coffee in town",
    "New album drops",
    "Fashion week highlights",
    "Hidden gems in Tokyo",
    "Coding best practices",
    "Contemporary art exhibition",
    "Gourmet experience",
  ];
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#DDA0DD",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `post-${i}`,
    title: titles[i % titles.length],
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    imageColor: colors[i % colors.length],
    likes: Math.floor(Math.random() * 10000) + 1000,
    comments: Math.floor(Math.random() * 1000) + 100,
    category: categories[i % categories.length],
    author: ["John", "Sarah", "Mike", "Emma"][i % 4],
    avatar: profileImages[i % profileImages.length],
  }));
};

const generateLiveStreams = (): LiveStream[] => {
  const streams = [
    {
      title: "Cooking Italian Pasta",
      streamerName: "ChefMaster",
      category: "Cooking",
    },
    {
      title: "Playing Chess Championship",
      streamerName: "GrandMaster",
      category: "Gaming",
    },
    { title: "Guitar Tutorial", streamerName: "MusicPro", category: "Music" },
    {
      title: "Yoga Morning Session",
      streamerName: "YogaGuru",
      category: "Fitness",
    },
    {
      title: "Tech Talk: React Native",
      streamerName: "DevExpert",
      category: "Tech",
    },
  ];
  const colors = ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12", "#9B59B6"];

  return streams.map((stream, index) => ({
    id: `live-${index}`,
    ...stream,
    viewers: Math.floor(Math.random() * 5000) + 500,
    thumbnailColor: colors[index % colors.length],
    avatar: profileImages[index % profileImages.length],
  }));
};

const generateTopics = (): Topic[] => {
  const topics = [
    { name: "#ReactNative", posts: 15420, trending: true },
    { name: "#FlashList", posts: 8932, trending: true },
    { name: "#MobileFirst", posts: 5621, trending: false },
    { name: "#Performance", posts: 12841, trending: true },
    { name: "#OpenSource", posts: 9234, trending: false },
    { name: "#TypeScript", posts: 18723, trending: true },
  ];
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

  return topics.map((topic, index) => ({
    id: `topic-${index}`,
    ...topic,
    bgColor: colors[index % colors.length],
  }));
};

const generateChannels = (): Channel[] => {
  const channels = [
    { name: "Tech Daily", subscribers: "1.2M", verified: true },
    { name: "Design Hub", subscribers: "850K", verified: true },
    { name: "Code Masters", subscribers: "2.1M", verified: true },
    { name: "Creative Mind", subscribers: "450K", verified: false },
    { name: "Dev Tips", subscribers: "3.5M", verified: true },
  ];
  const colors = ["#6366F1", "#14B8A6", "#F97316", "#EF4444", "#8B5CF6"];

  return channels.map((channel, index) => ({
    id: `channel-${index}`,
    ...channel,
    coverColor: colors[index % colors.length],
    avatar: profileImages[index % profileImages.length],
  }));
};

// Component for Stories section
const StoryItem = ({ item }: { item: Story }) => {
  return (
    <Pressable style={styles.storyContainer}>
      <View style={[styles.storyRing, item.isLive && styles.liveRing]}>
        <Image source={item.avatar} style={styles.storyAvatar} />
        {item.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <Text style={styles.storyUsername}>{item.username}</Text>
    </Pressable>
  );
};

// Component for Posts
const PostItem = ({ item }: { item: Post }) => {
  return (
    <Pressable style={styles.postContainer}>
      <View style={[styles.postImage, { backgroundColor: item.imageColor }]}>
        <View style={styles.postCategory}>
          <Text style={styles.postCategoryText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <Image source={item.avatar} style={styles.postAvatar} />
          <Text style={styles.postAuthor}>{item.author}</Text>
        </View>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.postDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Image source={icons.like} style={styles.statIcon} />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Image source={icons.comment} style={styles.statIcon} />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

// Component for Live Streams
const LiveStreamItem = ({ item }: { item: LiveStream }) => {
  return (
    <Pressable style={styles.liveStreamContainer}>
      <View
        style={[styles.liveThumbnail, { backgroundColor: item.thumbnailColor }]}
      >
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>LIVE</Text>
        </View>
        <View style={styles.viewerCount}>
          <Text style={styles.viewerText}>{item.viewers} watching</Text>
        </View>
      </View>
      <View style={styles.liveInfo}>
        <Text style={styles.liveTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.streamerInfo}>
          <Image source={item.avatar} style={styles.streamerAvatar} />
          <Text style={styles.streamerName}>{item.streamerName}</Text>
        </View>
      </View>
    </Pressable>
  );
};

// Component for Topics
const TopicItem = ({ item }: { item: Topic }) => {
  return (
    <Pressable
      style={[styles.topicContainer, { backgroundColor: item.bgColor }]}
    >
      <Text style={styles.topicName}>{item.name}</Text>
      <Text style={styles.topicPosts}>{item.posts.toLocaleString()} posts</Text>
      {item.trending && (
        <View style={styles.trendingBadge}>
          <Text style={styles.trendingText}>Trending</Text>
        </View>
      )}
    </Pressable>
  );
};

// Component for Channels
const ChannelItem = ({ item }: { item: Channel }) => {
  return (
    <Pressable style={styles.channelContainer}>
      <View
        style={[styles.channelCover, { backgroundColor: item.coverColor }]}
      />
      <View style={styles.channelInfo}>
        <Image source={item.avatar} style={styles.channelAvatar} />
        <View style={styles.channelDetails}>
          <View style={styles.channelNameRow}>
            <Text style={styles.channelName}>{item.name}</Text>
            {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
          </View>
          <Text style={styles.channelSubs}>{item.subscribers} subscribers</Text>
        </View>
        <Pressable style={styles.subscribeButton}>
          <Text style={styles.subscribeText}>Subscribe</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

// Section renderer
const SectionRow = ({ section }: { section: Section }) => {
  const renderItem = useCallback(
    (props: any) => {
      switch (section.type) {
        case "stories":
          return <StoryItem item={props.item} />;
        case "posts":
          return <PostItem item={props.item} />;
        case "live":
          return <LiveStreamItem item={props.item} />;
        case "topics":
          return <TopicItem item={props.item} />;
        case "channels":
          return <ChannelItem item={props.item} />;
        default:
          return null;
      }
    },
    [section.type]
  );

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <RecyclerView
        horizontal
        data={section.data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
};

const sections: Section[] = [
  {
    id: "section-1",
    type: "stories",
    title: "Stories",
    data: generateStories(),
  },
  {
    id: "section-2",
    type: "posts",
    title: "Featured Posts",
    data: generatePosts(10),
  },
  {
    id: "section-3",
    type: "live",
    title: "Live Now",
    data: generateLiveStreams(),
  },
  {
    id: "section-4",
    type: "topics",
    title: "Trending Topics",
    data: generateTopics(),
  },
  {
    id: "section-5",
    type: "channels",
    title: "Popular Channels",
    data: generateChannels(),
  },
  {
    id: "section-6",
    type: "posts",
    title: "Recommended For You",
    data: generatePosts(8),
  },
];

const data = Array.from({ length: 1000 }).map((_, index) => {
  const mappedSection = sections[index % sections.length];
  const shouldReverse = Math.ceil(index / sections.length) % 2 === 0;
  return {
    ...mappedSection,
    id: `section-${index}`,
    data: shouldReverse
      ? [...mappedSection.data].reverse()
      : mappedSection.data,
  };
});

// Main component
const ShowcaseApp = () => {
  const renderSection = useCallback(
    ({ item }: { item: Section }) => <SectionRow section={item} />,
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <RecyclerView
        data={data}
        renderItem={renderSection}
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const ListHeader = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Discover</Text>
    <Text style={styles.headerSubtitle}>
      Explore amazing content from creators worldwide
    </Text>
  </View>
);

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#212529",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 16,
    color: "#212529",
  },
  horizontalList: {
    paddingHorizontal: 12,
  },
  // Stories styles
  storyContainer: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  storyRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#e9ecef",
  },
  liveRing: {
    borderColor: "#dc3545",
  },
  storyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  liveBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#dc3545",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  storyUsername: {
    marginTop: 8,
    fontSize: 12,
    color: "#495057",
  },
  // Posts styles
  postContainer: {
    width: width * 0.65,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postImage: {
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: "flex-end",
    padding: 12,
  },
  postCategory: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  postCategoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  postContent: {
    padding: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  postAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 12,
  },
  postStats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 16,
    height: 16,
    tintColor: "#6c757d",
  },
  statText: {
    fontSize: 12,
    color: "#6c757d",
  },
  // Live stream styles
  liveStreamContainer: {
    width: width * 0.55,
    marginHorizontal: 8,
  },
  liveThumbnail: {
    height: 140,
    borderRadius: 12,
    padding: 8,
    justifyContent: "space-between",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 53, 69, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
    marginRight: 4,
  },
  liveLabel: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  viewerCount: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  viewerText: {
    color: "white",
    fontSize: 12,
  },
  liveInfo: {
    marginTop: 8,
  },
  liveTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  streamerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  streamerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  streamerName: {
    fontSize: 13,
    color: "#6c757d",
  },
  // Topics styles
  topicContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 16,
    marginHorizontal: 8,
    width: width * 0.4,
    justifyContent: "center",
  },
  topicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  topicPosts: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  trendingBadge: {
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  trendingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  // Channels styles
  channelContainer: {
    width: width * 0.6,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  channelCover: {
    height: 80,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  channelInfo: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  channelDetails: {
    flex: 1,
  },
  channelNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  channelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  verifiedBadge: {
    fontSize: 14,
    color: "#0d6efd",
    marginLeft: 4,
  },
  channelSubs: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 2,
  },
  subscribeButton: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ShowcaseApp;
