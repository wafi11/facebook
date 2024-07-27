"use server";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { getCommentInlcude, PostData } from "@/lib/types";
import { createComments } from "@/lib/vaidationSchema";

export async function SubmitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthrrized");

  const { content: contentValidated } = createComments.parse({ content });

  const [newComments] = await db.$transaction([
    db.comments.create({
      data: {
        comment: contentValidated,
        postId: post.id,
        userId: user.id,
      },
      include: getCommentInlcude(user.id),
    }),
    ...(post.user?.id !== user.id
      ? [
          db.notifications.create({
            data: {
              issuerId: user.id,
              recipientId: post.user?.id as string,
              postId: post.id,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  return newComments;
}

export async function DeleteComments(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const post = await db.comments.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Comments Not Found");

  if (post.userId !== user.id) throw new Error("Unauthorized");

  const deleteComments = await db.comments.delete({
    where: { id },
    include: getCommentInlcude(user.id),
  });

  return deleteComments;
}
