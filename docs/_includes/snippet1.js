<FlashList
  renderItem={({ item }) => {
    return <TweetCell item={item} />;
  }}
  estimatedItemSize={50}
  data={tweets}
/>;
