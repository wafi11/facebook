"use server";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";

export async function DeleteMessages(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const post = await db.directMessage.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Comments Not Found");

  if (post.senderId !== user.id) throw new Error("Unauthorized");

  const deleteComments = await db.directMessage.delete({
    where: { id },
    include: {
      sender: true,
    },
  });

  return deleteComments;
}

export interface MessageProps {
  senderId: string;
  receiverId: string;
  content: string;
  id: number;
  createdAt: Date;
}
