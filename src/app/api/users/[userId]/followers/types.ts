import { Prisma } from "@prisma/client";

export function getUserDataSelect(loggedinUserId: string) {
  return {
    id: true,
    name: true,
    displayname: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedinUserId,
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

export function getPostDataInclude(loggedinUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedinUserId),
    },
    media: true,
    comments: {
      where: {
        userId: loggedinUserId,
      },
      select: {
        userId: true,
      },
    },
    like: {
      where: {
        userId: loggedinUserId,
      },
      select: {
        userId: true,
      },
    },
    Bookmarks: {
      where: {
        userId: loggedinUserId,
      },
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
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;
