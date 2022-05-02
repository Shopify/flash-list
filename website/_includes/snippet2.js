<FlashList
  renderItem={({ item }) => {
    <TweetCell item={item} />;
  }}
  getItemType={({ item }) => {
    item.type;
  }}
  data={tweets}
/>;
