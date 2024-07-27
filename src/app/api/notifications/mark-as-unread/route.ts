import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";

export async function PATCH() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.notifications.updateMany({
      where: {
        recipientId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return new Response();
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
