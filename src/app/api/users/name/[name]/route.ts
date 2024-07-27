import { validateRequest } from "@/lib/auth";
import { getUserDataSelect } from "../../[userId]/followers/types";
import db from "@/lib/prisma";

export async function GET(
  req: Request,
  { params: { name } }: { params: { name: string } }
) {
  try {
    const { user: loggedinUser } = await validateRequest();

    if (!loggedinUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: getUserDataSelect(loggedinUser.id),
    });

    if (!user) {
      return Response.json({ error: "User Not Found" }, { status: 404 });
    }

    return Response.json(user, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
