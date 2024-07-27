import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { NextRequest } from "next/server";
import { postDataInclude, PostsPage } from "./types";
import {
  getPostDataInclude,
  getUserDataSelect,
} from "../../users/[userId]/followers/types";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Internal Server Erorr" });
    }

    const res = await db.post.findMany({
      include: getPostDataInclude(user.id),
      orderBy: {
        createdAt: "desc",
      },
      take: 3 + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = res.length > 3 ? res[3].id : null;

    const data: PostsPage = {
      posts: res.slice(0, 3),
      nextCursor,
    };
    return Response.json(data, { status: 201 });
  } catch (err) {
    console.log(err);
    return Response.json(
      {
        err: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
