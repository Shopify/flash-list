import React from "react";

import Message from "./models/Message";
import ImageMessage from "./ImageMessage";
import TextBubble from "./TextBubble";
import UserName from "./UserName";
import MessageType from "./models/MessageType";

const MessageItem = ({ item }: { item: Message }) => {
  const mine = item.sender === UserName;
  switch (item.type) {
    case MessageType.Text:
      return (
        <TextBubble
          text={item.text}
          mine={mine}
          avatar={item.avatar}
          name={item.sender}
        />
      );
    case MessageType.Image:
      return <ImageMessage image={item.image} mine={mine} />;
  }
};

export default MessageItem;
