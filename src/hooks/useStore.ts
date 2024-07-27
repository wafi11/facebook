import { create } from "zustand";

export interface Message {
  id: string;
  senderId: string;
  receiver: {
    name: string;
    displayname: string | null;
    avatarUrl: string | null;
  };
  content: string;
  createdAt: Date;
}

interface MessageStoreState {
  messages: Message[];
  addMessages: (message: Message) => void;
  setMessages: (message: Message[]) => void;
}

const useMessagesStore = create<MessageStoreState>((set) => ({
  messages: [],
  addMessages: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
}));

export default useMessagesStore;
