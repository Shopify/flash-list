import MessageType from "./MessageType";

export interface TextMessage {
  id: string;
  text: string;
  avatar?: string;
  sender: string;
  type: MessageType.Text;
}

export interface ImageMessage {
  id: string;
  avatar?: string;
  type: MessageType.Image;
  sender: string;
  image: string;
}

type Message = ImageMessage | TextMessage;

export default Message;
