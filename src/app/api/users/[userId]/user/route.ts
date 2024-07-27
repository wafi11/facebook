import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";

export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const { user: loggedinUser } = await validateRequest();

    if (!loggedinUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        displayname: true,
      },
    });

    if (!user) {
      return Response.json({ error: "User NOt found " }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
