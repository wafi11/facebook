import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { LikeInfo } from "./types";
import { PrismaPromise } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { user: LoggedInUser } = await validateRequest();

    if (!LoggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await db.post.findUnique({
      where: { id: params.postId },
      select: {
        like: {
          where: {
            postId: params.postId,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            like: true,
          },
        },
      },
    });
    if (!post) {
      return Response.json({ error: "Post not Found" }, { status: 404 });
    }

    const data: LikeInfo = {
      like: post._count.like,
      isLikedByUser: !!post.like.length,
    };

    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { user: LoggedInUser } = await validateRequest();

    if (!LoggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await db.post.findUnique({
      where: { id: params.postId },
      select: {
        userId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post Not Found" }, { status: 404 });
    }

    await db.$transaction([
      db.like.upsert({
        where: {
          userId_postId: {
            userId: LoggedInUser.id,
            postId: params.postId,
          },
        },
        create: {
          userId: LoggedInUser.id,
          postId: params.postId,
        },
        update: {},
      }),
      ...(LoggedInUser.id !== post.userId
        ? [
            db.notifications.create({
              data: {
                issuerId: LoggedInUser.id,
                recipientId: post.userId as string,
                postId: params.postId,
                type: "LiKE",
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { user: LoggedInUser } = await validateRequest();

    if (!LoggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await db.post.findUnique({
      where: { id: params.postId },
      select: {
        userId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post Not Found" }, { status: 404 });
    }

    await db.$transaction([
      db.like.deleteMany({
        where: {
          userId: LoggedInUser.id,
          postId: params.postId,
        },
      }),
      db.notifications.deleteMany({
        where: {
          issuerId: LoggedInUser.id,
          recipientId: post.userId as string,
          postId: params.postId,
          type: "LiKE",
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
