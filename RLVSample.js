import React, { Component, Props, PureComponent } from "react";
import { StyleSheet, TouchableOpacity, View, Text, FlatList, Image, Dimensions } from "react-native";
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview";


function randomString(len, charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}

const styles = StyleSheet.create({
  actionBar: {
    marginTop: 8,
    justifyContent: "space-between",
    marginRight: 16
  },
  actionButton: {
    width: 18,
    height: 18,
    margin: 8
  },
  timeline: {
    backgroundColor: "#FFF"
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#eee"
  },
  gray: {
    color: "#777",
    paddingRight: 2
  },
  sectionHeader: {
    backgroundColor: "#5f27cd",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sectionHeaderText: {
    fontWeight: "700",
    color: "white"
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
    fontWeight: "600"
  },
  shrink: {
    flexShrink: 1
  },
  avatar: {
    height: 44,
    width: 44,
    borderRadius: 22,
    marginRight: 16,
    flexShrink: 0,
    marginTop: 4
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom:4,
    paddingRight: 4
  },
  description: {
    fontSize: 15,
  },
  singleItem: {
    paddingHorizontal: 16,
    minHeight: 44,
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF"
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
});

export class HomeScreen extends Component {

fontSpecs = {
  fontFamily: undefined,
  fontSize: 24,
  fontStyle: 'italic',
  fontWeight: 'bold',
}
constructor(args) {
  super(args);
  this.width = Dimensions.get("window");

  this.layoutProvider = new LayoutProvider(
    index => {
      return 0;
    },
    (type, dim) => {
        switch (type) {
            default:
                dim.width = this.width;
                dim.height = 100;
        }
    }
  );
  
  var dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
  }); 
  this._rowRenderer = this.rowRenderer.bind(this);

  this.state = {
    dataProvider: dataProvider.cloneWithRows(this._generateArray(300))
  }
}
_generateArray = (n) => {
    let arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = i;
    }
    return arr;
}

tweets = () => { 
  var tweetsHashKeys = Array.from(Object.keys(mockData.globalObjects.tweets));
  var tweets = tweetsHashKeys.map((v) => { return mockData.globalObjects.tweets[v]; });
  var alotoftweets = [];
  for(var i = 0; i< tweets.length;++i){
    alotoftweets.push(JSON.parse(JSON.stringify(tweets[i])));
    alotoftweets.push(JSON.parse(JSON.stringify(tweets[i])));
    alotoftweets.push(JSON.parse(JSON.stringify(tweets[i])));
    alotoftweets.push(JSON.parse(JSON.stringify(tweets[i])));
    alotoftweets.push(JSON.parse(JSON.stringify(tweets[i])));
  }
  alotoftweets = alotoftweets.map(function(tweet){ 
    let r = (Math.random() + Math.random()).toString(36);
    tweet.id_str = randomString(24);
    return tweet;
  });

  return alotoftweets;
}
singleItem = (data) => {
  return <Text >Hello</Text> 
}

rowRenderer(type, data) {
  console.log("this.state.dataProviderowr")

  return this.singleItem(data);
};

render() {
  return (
    <View style={{backgroundColor: 'red', flex: 1}}>
    <RecyclerListView
        style={{backgroundColor: 'green', flex: 1}} 
      layoutProvider={this.layoutProvider}
      dataProvider={this.state.dataProvider}
      rowRenderer={this._rowRenderer}>
    </RecyclerListView>
    </View>
    // <FlatList
    // style={styles.timeline}
    // data={this.tweets()}
    // renderItem={ this.singleItem }
    // keyExtractor={this.keyExtractor}
    // ItemSeparatorComponent={this.divider}
    // maxToRenderPerBatch={30}
    // updateCellsBatchingPeriod={100}
    // windowSize={11}
    // />
  );
};

}

export default HomeScreen;