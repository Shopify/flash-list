import Message from "../models/Message";
import MessageType from "../models/MessageType";

const messages: Message[] = [
  {
    id: "1234",
    text: "Bought this awesome mechanical gaming board and its worth every penny.",
    sender: "John",
    type: MessageType.Text,
  },
  {
    id: "1235",
    type: MessageType.Image,
    sender: "John",
    image:
      "https://images.unsplash.com/photo-1633226340451-29bcbe324dd5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1925&q=80",
  },
  {
    id: "1236",
    avatar:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    sender: "Ben",
    text: "This looks rad!",
    type: MessageType.Text,
  },
  {
    id: "1237",
    avatar:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    sender: "Ben",
    text: "Which one is it?",
    type: MessageType.Text,
  },
  {
    id: "1238",
    avatar:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    sender: "Ben",
    text: "I love it that you guys are there and I get to relive my hometown through your videos!!",
    type: MessageType.Text,
  },
  {
    id: "1239",
    avatar:
      "https://pbs.twimg.com/profile_images/1322197728865198082/g4WuGbeF_400x400.jpg",
    sender: "John",
    text: "This is the Keychron K2",
    type: MessageType.Text,
  },
  {
    id: "1240",
    avatar:
      "https://pbs.twimg.com/profile_images/1307291020896415751/88Y44-3e_400x400.jpg",
    sender: "John",
    text: "Later I'll send your more photos so you can see it better!",
    type: MessageType.Text,
  },
  {
    id: "1241",
    image:
      "https://images.unsplash.com/photo-1609873351079-6ee9287632b7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=926&q=80",
    avatar:
      "https://pbs.twimg.com/profile_images/1226790134005346304/JVbc1FuN_400x400.jpg",
    sender: "John",
    type: MessageType.Image,
  },
  {
    id: "1242",
    image:
      "https://images.unsplash.com/photo-1616933067445-4b556aa759c7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80",
    avatar:
      "https://pbs.twimg.com/profile_images/1226790134005346304/JVbc1FuN_400x400.jpg",
    sender: "John",
    type: MessageType.Image,
  },
  {
    id: "1243",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
    sender: "John",
    text: "Some more photos from the first episode!",
    type: MessageType.Text,
  },
  {
    id: "1244",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
    sender: "Lizzie",
    text: "I like it!",
    type: MessageType.Text,
  },
];

const reversedMessages = messages.reverse();
export default reversedMessages;
