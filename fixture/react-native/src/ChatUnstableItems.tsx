import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  FlashList,
  FlashListRef,
  useRecyclingState,
} from "@shopify/flash-list";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

const messageTexts = [
  "Hey, how are you?",
  "Hey, how are you? Hey, how are you? Hey, how are you? Hey, how are you?",
  "What's up?",
  "What's up? What's up? What's up?",
  "Did you see that new movie?",
  "I'm working on a new project",
  "Let's catch up soon!",
  "Have you tried the new restaurant downtown?",
  "Have you tried the new restaurant downtown?, Have you tried the new restaurant downtown?, Have you tried the new restaurant downtown?, Have you tried the new restaurant downtown?",
  "Just finished reading an amazing book",
  "Can you send me that file?",
  "Are we still meeting tomorrow?",
  [
    "Are we still meeting tomorrow?",
    "Are we still meeting tomorrow?",
    "Are we still meeting tomorrow?",
    "Are we still meeting tomorrow?",
    "Are we still meeting tomorrow?",
    "Are we still meeting tomorrow?",
    "Are we still meeting tomorrow?",
  ].join(" "),
  "The weather is beautiful today!",
  "The weather is beautiful today! The weather is beautiful today!",
];

export function ChatUnstableItems() {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    generateInitialMessages(300)
  );
  const listRef = useRef<FlashListRef<ChatMessage>>(null);

  const addMessageAtTop = useCallback(() => {
    const newMessages = Array.from({ length: 50 }, (_, i) =>
      generateRandomMessage(i)
    );
    setMessages((prev) => [...newMessages, ...prev]);
  }, []);

  // const addMessageAtBottom = useCallback(() => {
  //   const newMessage = generateRandomMessage(messages.length);
  //   setMessages((prev) => [...prev, newMessage]);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Mirror stream-chat-react-native's "tap a reply" timing pattern:
  // the tap schedules a state update; the actual scrollToIndex runs on a
  // later tick via setTimeout(0). This separates the re-render (where
  // applyOffsetCorrection can fire its stray scrollBy with the anchor's
  // stale layout snapshot) from the scrollToIndex call (which would
  // otherwise have already set pauseOffsetCorrection.current = true and
  // suppressed the stray scrollBy).
  const [scrollTarget, setScrollTarget] = useState<number | null>(null);

  useEffect(() => {
    if (scrollTarget === null) return undefined;
    const id = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: scrollTarget,
        animated: true,
        viewPosition: 0.5,
      });
      setScrollTarget(null);
    }, 0);
    return () => clearTimeout(id);
  }, [scrollTarget]);

  const scrollToItem25 = useCallback(() => {
    setScrollTarget(150);
  }, []);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const renderItem = useCallback((info: { item: ChatMessage }) => {
    return <MessageBubble message={info.item} />;
  }, []);

  const maintainVisibleContentPositionConfig = useMemo(
    () => ({
      animateAutoScrollToBottom: true,
      autoscrollToBottomThreshold: 1,
      startRenderingFromBottom: true,
    }),
    []
  );

  const listHeaderComponent = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Example</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea} testID="ChatUnstableItemsScreen">
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat Example</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.topButton]}
            onPress={addMessageAtTop}
          >
            <Text style={styles.buttonText}>Add at Top</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.scrollBottomButton]}
            onPress={scrollToBottom}
          >
            <Text style={styles.buttonText}>Scroll to Bottom</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.scrollButton]}
            onPress={scrollToItem25}
          >
            <Text style={styles.buttonText}>Scroll to 25</Text>
          </Pressable>
        </View>

        <FlashList
          ref={listRef}
          data={messages}
          maintainVisibleContentPosition={maintainVisibleContentPositionConfig}
          // onStartReached={() => {
          //   console.log("onStartReached");
          //   addMessageAtTop();
          // }}
          ListHeaderComponent={listHeaderComponent}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </View>
    </SafeAreaView>
  );
}

function generateInitialMessages(count: number): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const minutesAgo = count - i;
    const timestamp = new Date(now.getTime() - minutesAgo * 60000);

    messages.push({
      id: `msg-${i}`,
      text: `${i}. ${messageTexts[i % messageTexts.length]}`,
      sender: i % 2 === 0 ? "user" : "other",
      timestamp,
    });
  }

  return messages;
}

function generateRandomMessage(index: number): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    text: `${index}. ${messageTexts[index % messageTexts.length]}`,
    sender: index % 2 === 0 ? "user" : "other",
    timestamp: new Date(),
  };
}

// deterministic hash, to be used as seed for the randomizer
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// deterministic random based on a seed - we probably want this
// in order to not mess measurements on every scroll (again emulating
// actual message state which settles after some time)
function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface MessageProfile {
  paddingVertical: number;
  paddingHorizontal: number;
  textRepeat: number;
  hasImage: boolean;
  imageWidth: number;
  imageRenderedHeight: number;
  imagePlaceholderHeight: number;
  imageSeed: number;
}

function computeProfile(messageId: string): MessageProfile {
  const rand = mulberry32(hashString(messageId));
  const hasImage = rand() < 0.35;
  // The image is requested at imageRenderedHeight px tall, but we render
  // the <Image> at imagePlaceholderHeight until onLoad fires, at which
  // point we swap to the full height. That swap tries to emulate a real
  // measurement drift: between the moment the user settles at the bottom
  // (anchor snapshot taken) and the moment they tap, inflight image loads
  // keep growing nearby bubbles, drifting firstVisibleItemLayout.current
  // relative to live layout.
  const imageRenderedHeight = 90 + Math.floor(rand() * 130);
  return {
    paddingVertical: 8 + Math.floor(rand() * 16),
    paddingHorizontal: 10 + Math.floor(rand() * 8),
    textRepeat: 1 + Math.floor(rand() * 3),
    hasImage,
    imageWidth: 180 + Math.floor(rand() * 60),
    imageRenderedHeight,
    imagePlaceholderHeight: Math.max(40, imageRenderedHeight - 60),
    imageSeed: hashString(messageId),
  };
}

const MessageImage = ({
  uri,
  width,
  placeholderHeight,
  finalHeight,
}: {
  uri: string;
  width: number;
  placeholderHeight: number;
  finalHeight: number;
}) => {
  // useRecyclingState resets to `false` whenever `uri` changes — i.e. when
  // FlashList recycles this cell to a different message. That guarantees
  // every cell-image swap goes through the placeholder → finalHeight
  // transition and produces a real onLoad-driven layout shift, which is
  // the production-style drift mechanism we're using to make
  // firstVisibleItemLayout.current go stale.
  const [loaded, setLoaded] = useRecyclingState(false, [uri]);
  return (
    <Image
      source={{ uri }}
      resizeMode="cover"
      onLoad={() => setLoaded(true)}
      style={{
        width,
        height: loaded ? finalHeight : placeholderHeight,
        borderRadius: 10,
        marginBottom: 6,
        backgroundColor: "#dddddd",
      }}
    />
  );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.sender === "user";
  const profile = useMemo(() => computeProfile(message.id), [message.id]);
  const text = useMemo(() => {
    if (profile.textRepeat === 1) return message.text;
    return Array(profile.textRepeat).fill(message.text).join(" ");
  }, [message.text, profile.textRepeat]);

  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.otherMessage,
          {
            paddingVertical: profile.paddingVertical,
            paddingHorizontal: profile.paddingHorizontal,
          },
        ]}
      >
        {profile.hasImage && (
          <MessageImage
            uri={`https://picsum.photos/seed/${profile.imageSeed}/${profile.imageWidth}/${profile.imageRenderedHeight}`}
            width={profile.imageWidth}
            placeholderHeight={profile.imagePlaceholderHeight}
            finalHeight={profile.imageRenderedHeight}
          />
        )}
        <Text style={styles.messageText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: "45%",
    flexGrow: 1,
    margin: 4,
  },
  topButton: {
    backgroundColor: "#4a90e2",
  },
  scrollButton: {
    backgroundColor: "#e2a04a",
  },
  scrollBottomButton: {
    backgroundColor: "#9c4ae2",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  messageBubbleContainer: {
    paddingHorizontal: 12,
    marginVertical: 4,
    flexDirection: "row",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: "#dcf8c6",
    borderBottomRightRadius: 1,
  },
  otherMessage: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 1,
  },
  messageText: {
    fontSize: 16,
    color: "#000000",
  },
});
