import MessageType from "./MessageType";

export interface TextMessage {
  text: string;
  avatar?: string;
  sender: string;
  type: MessageType.Text;
}

export interface ImageMessage {
  avatar?: string;
  type: MessageType.Image;
  sender: string;
  image: string;
}

type Message = ImageMessage | TextMessage;

export default Message;
