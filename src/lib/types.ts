import { Prisma } from "@prisma/client";
import { lucia } from "./auth";
export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    name: true,
    displayname: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        post: true,
        followers: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export const postDataInclude = {
  user: {
    select: {
      id: true,
      name: true,
      displayname: true,
      avatarUrl: true,
      bio: true,
    },
  },
  media: true,
  comments: {
    select: {
      userId: true,
    },
  },
  like: {
    select: {
      userId: true,
    },
  },
  Bookmarks: {
    select: {
      userId: true,
    },
  },
  _count: {
    select: {
      like: true,
      Bookmarks: true,
      comments: true,
    },
  },
} satisfies Prisma.PostInclude;

export type PostData = Prisma.PostGetPayload<{
  include: typeof postDataInclude;
}>;

export const UserDataSelect = {
  name: true,
  displayname: true,
  avatarUrl: true,
  id: true,
} satisfies Prisma.UserSelect;

export function getCommentInlcude(userId: string) {
  return {
    user: {
      select: getUserDataSelect(userId),
    },
  } satisfies Prisma.CommentsInclude;
}

export type CommentData = Prisma.CommentsGetPayload<{
  include: ReturnType<typeof getCommentInlcude>;
}>;

export interface CommentPage {
  comments: CommentData[];
  previousCursor: string | null;
}
