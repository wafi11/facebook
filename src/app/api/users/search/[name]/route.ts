import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { getUserDataSelect } from "../../[userId]/followers/types";

export async function GET(
  req: Request,
  { params: { name } }: { params: { name: string } }
) {
  const { user: loggedinUser } = await validateRequest();

  if (!loggedinUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
          {
            displayname: {
              contains: name,
              mode: "insensitive",
            },
          },
        ],
        NOT: {
          id: loggedinUser.id,
        },
      },
      select: getUserDataSelect(loggedinUser.id),
      take: 10,
    });

    return Response.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
