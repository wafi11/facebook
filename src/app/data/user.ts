"use server";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { cache } from "react";

export const getDirectMessages = cache(async (freindId: string) => {
  const { user: LogeedUser } = await validateRequest();

  if (!LogeedUser) {
    throw new Error("Unauthorized");
  }

  const user1 = await db.user.findUnique({
    where: {
      id: LogeedUser?.id,
    },
  });
  const user2 = await db.user.findUnique({
    where: {
      id: freindId,
    },
  });

  if (!user1 || !user2) {
    throw new Error("User Does not exist");
  }

  try {
    const messages = await db.directMessage.findMany({
      where: {
        OR: [
          { senderId: freindId, receiverId: LogeedUser.id },
          { senderId: LogeedUser?.id, receiverId: freindId },
        ],
      },
      select: {
        id: true,
        senderId: true,
        receiver: {
          select: {
            name: true,
            avatarUrl: true,
            displayname: true,
          },
        },
        receiverId: true,
        content: true,
        createdAt: true,
      },
    });
    return { response: messages };
  } catch (err) {
    return null;
  }
});

export const getUserByUsername = async (name: string) => {
  try {
    const data = await db.user.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
    return data;
  } catch {
    return { error: "Username already taken" };
  }
};
export const getUserById = async (id: string) => {
  try {
    const data = await db.user.findFirst({
      where: {
        id,
      },
    });
    return data;
  } catch {
    return { error: "Username already taken" };
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const data = await db.user.findFirst({
      where: {
        email: {
          equals: email,

          mode: "insensitive",
        },
      },
    });
    return data;
  } catch {
    return { error: "Username already taken" };
  }
};
