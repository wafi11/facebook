import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { MessagePage, MessagesDataSelect } from "./types";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<Response> {
  try {
    const { userId } = params;
    const { user: LoggedUser } = await validateRequest();

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 5;

    if (!LoggedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user1, user2] = await Promise.all([
      db.user.findUnique({ where: { id: LoggedUser.id } }),
      db.user.findUnique({ where: { id: userId } }),
    ]);

    if (!user1 || !user2) {
      return Response.json({ error: "User does not exist" }, { status: 404 });
    }

    const messages = await db.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: LoggedUser.id },
          { senderId: LoggedUser.id, receiverId: userId },
        ],
      },
      take: pageSize + 1,
      orderBy: {
        createdAt: "asc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      select: MessagesDataSelect,
    });

    const nextCursor =
      messages.length > pageSize ? messages[pageSize].id : null;

    const data: MessagePage = {
      messages: messages.slice(0, pageSize),
      nextCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
