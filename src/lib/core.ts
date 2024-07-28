import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { validateRequest } from "./auth";
import db from "./prisma";

const f = createUploadthing();

export const OurFileRouter = {
  avatar: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldData = metadata.user.avatarUrl;
      if (oldData) {
        const key = oldData.split(
          `/a/${process.env.NEXT_APP_UPLOADTHING_APP_ID}/`
        )[1];

        await new UTApi().deleteFiles(key);
      }
      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_APP_UPLOADTHING_APP_ID}/`
      );

      await db.user.update({
        where: { id: metadata.user.id },
        data: {
          avatarUrl: newAvatarUrl,
        },
      });

      return { avatarUrl: newAvatarUrl };
    }),
  media: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      const media = await db.media.create({
        data: {
          url: file.url.replace(
            "/f/",
            `/a/${process.env.NEXT_APP_UPLOADTHING_APP_ID}/`
          ),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRoute = typeof OurFileRouter;
