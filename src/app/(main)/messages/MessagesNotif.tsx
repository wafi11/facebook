"use client";
import { NotificationsCount } from "@/app/api/notifications/unread-count/route";
import { Button } from "@/components/ui/button";
import kyInstance from "@/components/utils/ky";
import { useQuery } from "@tanstack/react-query";
import { Bell, Mail } from "lucide-react";
import Link from "next/link";

interface Props {
  initialState: NotificationsCount;
}

export default function MessagesButton({ initialState }: Props) {
  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: () =>
      kyInstance.get("/api/messages/unread-count").json<NotificationsCount>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });

  return (
    <Button
      className="flex items-center  justify-start gap-3 "
      title="Notifications"
      variant={"ghost"}
      asChild
    >
      <Link href={"/messages"}>
        <div className="relative bg-secondary py-1 px-2 rounded-md">
          <Mail />
          {!!data.unreadCount && (
            <span className="absolute bg-black -right-1 -top-1 rounded-full bg-primary text-primary-foreground px-1 text-xs font-medium tabular-nums">
              {data.unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline">Messages</span>
      </Link>
    </Button>
  );
}
