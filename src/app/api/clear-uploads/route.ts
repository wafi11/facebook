import db from "@/lib/prisma";
import { UTApi } from "uploadthing/server";

export async function GET(req: Request) {
  try {
    const header = req.headers.get("Authorization");

    if (header !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        {
          message: "Invalid Authorization header",
        },
        { status: 401 }
      );
    }

    const unusedMedia = await db.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 24),
              },
            }
          : {}),
      },
      select: {
        id: true,
        url: true,
      },
    });

    new UTApi().deleteFiles(
      unusedMedia.map(
        (map) =>
          map.url.split(`/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)[1]
      )
    );

    await db.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id),
        },
      },
    });

    return new Response();
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
