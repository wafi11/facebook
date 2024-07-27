"use client";
import React, { useEffect, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatChannel from "./ChatChannel";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/components/utils/ky";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  user: {
    avatarUrl: string | null;
    displayname: string | null;
    name: string;
    id: string;
  }[];
}

const Chat = ({ user }: Props) => {
  const [show, setShow] = useState(false);
  const params = useSearchParams();
  const receiverId = params.get("receiver") ?? "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () => kyInstance.patch("/api/messages/mark-as-unread"),
    onSuccess: () => {
      queryClient.setQueryData(["unread-messages-count"], {
        unreadCount: 0,
      });
    },
    onError(error) {
      toast({
        description: "Cancel Update Messages",
      });
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);
  return (
    <main className="bg-card w-full  flex h-[500px]">
      <ChatSidebar onClose={() => setShow(true)} open={show} user={user} />
      {receiverId && (
        <ChatChannel open={!show} openSidebar={() => setShow(false)} />
      )}
    </main>
  );
};

export default Chat;
