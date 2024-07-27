import { Metadata } from "next";
import Chat from "./Chat";
import db from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Messages",
};

async function getData() {
  const datas = await db.user.findMany({
    select: {
      avatarUrl: true,
      displayname: true,
      name: true,
      id: true,
    },
    take: 5,
  });
  return datas;
}

export default async function Page() {
  const user = await getData();
  return <Chat user={user} />;
}
