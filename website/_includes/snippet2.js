<FlashList
  renderItem={({ item }) => {
    <TweetCell item={item} />;
  }}
  getItemType={({ item }) => {
    return item.type;
  }}
  data={tweets}
/>;
