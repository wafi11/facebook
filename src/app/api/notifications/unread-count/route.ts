import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";

export interface NotificationsCount {
  unreadCount: number;
}

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Internal Server Erorr" });
    }

    const unreadCount = await db.notifications.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    });

    const data: NotificationsCount = {
      unreadCount,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        err: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
