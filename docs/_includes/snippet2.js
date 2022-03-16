<FlashList
  renderItem={({ item }) => {
    <TweetCell item={item} />;
  }}
  overrideItemType={({ item }) => {
    item.type;
  }}
  data={tweets}
/>;
