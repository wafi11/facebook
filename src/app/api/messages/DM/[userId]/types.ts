import { UserDataSelect } from "@/app/api/posts/for-you/types";
import { Prisma } from "@prisma/client";

export const MessagesDataSelect = {
  id: true,
  receiverId: true,
  content: true,
  createdAt: true,
  senderId: true,
  read: true,
  receiver: {
    select: UserDataSelect,
  },
  sender: {
    select: UserDataSelect,
  },
} satisfies Prisma.DirectMessageSelect;

export type MessageData = Prisma.DirectMessageGetPayload<{
  include: typeof MessagesDataSelect;
}>;

export interface MessagePage {
  messages: MessageData[];
  nextCursor: string | null;
}
