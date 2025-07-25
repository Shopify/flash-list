<FlashList
  renderItem={({ item }) => {
    return <TweetCell item={item} />;
  }}
  data={tweets}
/>;
