<FlashList
  renderItem={({ item }) => {
    return <TweetCell item={item} />;
  }}
  getItemType={({ item }) => {
    return item.type;
  }}
  data={tweets}
/>;
