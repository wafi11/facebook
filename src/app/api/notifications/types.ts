import { Prisma } from "@prisma/client";

export const NotificationsInclude = {
  issuer: {
    select: {
      name: true,
      displayname: true,
      avatarUrl: true,
    },
  },
  post: {
    select: {
      content: true,
    },
  },
} satisfies Prisma.NotificationsInclude;

export type NotificationData = Prisma.NotificationsGetPayload<{
  include: typeof NotificationsInclude;
}>;

export interface NotificationsPage {
  notification: NotificationData[];
  nextCursor: string | null;
}
