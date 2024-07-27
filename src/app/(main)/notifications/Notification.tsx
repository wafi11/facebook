import { NotificationData } from "@/app/api/notifications/types";
import UserProfile from "@/components/ui/userImage";
import { cn } from "@/lib/utils";
import { NotificationsType } from "@prisma/client";
import { Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";

interface NotificationsProps {
  notification: NotificationData;
}

export default function Notification({ notification }: NotificationsProps) {
  const notificationType: Record<
    NotificationsType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayname}  followed you`,
      href: `/users/${notification.issuer.name}`,
      icon: <User2 />,
    },
    COMMENT: {
      message: `${notification.issuer.displayname}  Comment on Your Post`,
      href: `post/${notification.postId}`,
      icon: <MessageCircle className="size-7 text-primary" />,
    },
    LiKE: {
      message: `${notification.issuer.displayname}  like your Post`,
      href: `post/${notification.postId}`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
    },
  };

  const { href, icon, message } = notificationType[notification.type];

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.read && "bg-primary/70"
        )}
      >
        <div className="my-1 ">{icon}</div>
        <div className="space-y-3">
          <UserProfile
            avatarUrl={notification.issuer.avatarUrl}
            size={36}
            className="w-20 h-20"
          />
          <div className="">
            <span className="font-bold">{notification.issuer.avatarUrl}</span>
            <span className="text-md ">{message}</span>
          </div>
          {notification.post && (
            <div className="line-clamp-3  whitespace-pre-line text-muted-foreground">
              {notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
