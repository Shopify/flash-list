<FlashList
  renderItem={({ item }) => {
    <TweetCell item={item} />;
  }}
  estimatedItemSize={50}
  data={tweets}
/>;
