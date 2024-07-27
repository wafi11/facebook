import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
export interface MessageCountInfo {
  unreadCount: number;
}

export interface messagesCount {
  unreadCount: number;
}

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unreadCount = await db.directMessage.count({
      where: {
        receiverId: user.id,
        read: false,
      },
    });

    const data: messagesCount = {
      unreadCount,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
