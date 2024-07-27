"use server";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";

export async function deletePost(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const post = await db.post.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Post Not Found");
  if (post.userId !== user.id) throw new Error("Internal Server Erorr");

  const deletePost = await db.post.delete({
    where: { id },
    include: postDataInclude,
  });

  return deletePost;
}
