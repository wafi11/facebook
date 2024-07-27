"use server";
import { getPostDataInclude } from "@/app/api/users/[userId]/followers/types";
import { validateRequest } from "@/lib/auth";
import { createPostsSchema } from "@/lib/vaidationSchema";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content, mediaIds } = createPostsSchema.parse(input);

  const newPost = await prisma?.post.create({
    data: {
      content,
      userId: user.id,
      media: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
