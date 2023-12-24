export enum SupportedMessage {
  AddChat = "ADD_CHAT",
  updatedChat = "UPDATED_CHAT",
}

type MessagePayload = {
    roomId: string;
    message: string;
    name: string;
    upvotes: number;
    chatId: string;
  };

export type OutgoingMessage = {
  type: SupportedMessage.AddChat;
  payload: MessagePayload
} | {
    type: SupportedMessage.updatedChat;
    payload: Partial<MessagePayload>
  };
