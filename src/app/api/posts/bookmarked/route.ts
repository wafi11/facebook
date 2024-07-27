import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getPostDataInclude } from "../../users/[userId]/followers/types";
import { PostsPage } from "../for-you/types";

export async function GET(
    req: NextRequest,
    { params }: { params: { postId: string } }
  ) {
    try {
      const { user: LoggedInUser } = await validateRequest();
      const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  
      const pageSize = 10;
  
      if (!LoggedInUser) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const post = await db.bookmarks.findMany({
        where: {
          userId: LoggedInUser.id,
        },
        include: {
          post: {
            include: getPostDataInclude(LoggedInUser.id),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });
  
      const nextCursor = post.length > pageSize ? post[pageSize].id : null;
  
      const data: PostsPage = {
        posts: post.slice(0, pageSize).map((book) => book.post),
        nextCursor,
      };
  
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }