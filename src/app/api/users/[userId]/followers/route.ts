import { validateRequest } from "@/lib/auth";
import { FollowerInfo } from "../../../posts/for-you/types";
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
        followers: {
          where: {
            followerId: loggedinUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User NOt found " }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowingByUser: !!user.followers.length,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const { user: loggedinUser } = await validateRequest();

    if (!loggedinUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.$transaction([
      db.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedinUser.id,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedinUser.id,
          followingId: userId,
        },
        update: {},
      }),
      db.notifications.create({
        data: {
          issuerId: loggedinUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.log(error);
    // Return an internal server error response in case of any errors
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const { user: loggedinUser } = await validateRequest();

    if (!loggedinUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.$transaction([
      db.follow.deleteMany({
        where: {
          followerId: loggedinUser.id,
          followingId: userId,
        },
      }),
      db.notifications.deleteMany({
        where: {
          issuerId: loggedinUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);
    return Response.json("Delete Succes ", { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
