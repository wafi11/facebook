import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getPostDataInclude } from "../followers/types";
import { PostsPage } from "../../../posts/for-you/types";

export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 3;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await db.post.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: getPostDataInclude(user.id),
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };
    return Response.json(data, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal Server Erorr" }, { status: 500 });
  }
}
