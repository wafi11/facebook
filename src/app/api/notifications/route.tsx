import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { NextRequest } from "next/server";
import { NotificationsInclude, NotificationsPage } from "./types";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Internal Server Erorr" });
    }

    const notif = await db.notifications.findMany({
      where: {
        recipientId: user.id,
      },
      include: NotificationsInclude,
      orderBy: { createdAt: "asc" },
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = notif.length > pageSize ? notif[pageSize].id : null;

    const data: NotificationsPage = {
      notification: notif.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
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
