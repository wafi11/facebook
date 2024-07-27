import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { BookmarksInfo } from "./types";
import { getPostDataInclude } from "@/app/api/users/[userId]/followers/types";
import { NextRequest } from "next/server";
import { PostsPage } from "../../for-you/types";


export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { user: LoggedInUser } = await validateRequest();

    if (!LoggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.bookmarks.upsert({
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
    });

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

    await db.bookmarks.deleteMany({
      where: {
        userId: LoggedInUser.id,
        postId: params.postId,
      },
    });

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
