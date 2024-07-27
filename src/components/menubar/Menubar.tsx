import { Bell, Bookmark, Home, icons, Mail } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import NotificationButton from "@/app/(main)/notifications/NotificationButton";
import MessagesButton from "@/app/(main)/messages/MessagesNotif";

interface MenubarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenubarProps) {
  const { user } = await validateRequest();

  if (!user) {
    return null;
  }

  const unreadMessagecount = await db.directMessage.count({
    where: {
      senderId: user.id,
      read: false,
    },
  });

  const unreadNotificationCount = await db.notifications.count({
    where: {
      recipientId: user.id,
      read: false,
    },
  });

  return (
    <div className={className}>
      <Button
        className="flex items-center gap-3 justify-start"
        title={"Home"}
        variant={"ghost"}
        asChild
      >
        <Link href={"/"} className="">
          <span className="bg-secondary py-1 px-2 rounded-md">
            <Home />
          </span>
          <span className="hidden lg:inline ">Home</span>
        </Link>
      </Button>
      <NotificationButton
        initialState={{ unreadCount: unreadNotificationCount }}
      />
      <MessagesButton initialState={{ unreadCount: unreadMessagecount }} />
      <Button
        className="flex items-center gap-3 justify-start"
        title={"Bookmarks"}
        variant={"ghost"}
        asChild
      >
        <Link href={"/bookmarks"} className="">
          <span className="bg-secondary py-1 px-2 rounded-md">
            <Bookmark />
          </span>
          <span className="hidden lg:inline ">Bookmarks</span>
        </Link>
      </Button>
    </div>
  );
}
