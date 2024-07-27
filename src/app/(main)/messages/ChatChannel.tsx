"use client";
import Sockets from "@/lib/socket";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useSession } from "../SessionProvider";
import { useSearchParams } from "next/navigation";
import crypto from "crypto";
import useMessagesStore, { Message } from "@/hooks/useStore";
import kyInstance from "@/components/utils/ky";
import { useInfiniteQuery } from "@tanstack/react-query";
import Infintinscroll from "@/components/ui/infiniteScroll";
import { ChatInput, CustomChannelHeader } from "./Channel";
import DeleteMessage from "./ButtonDelete";
import { io } from "socket.io-client";

const socket = io();
export interface MessageProps {
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: Date;
}

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
}
export default function ChatChannel({ open, openSidebar }: ChatChannelProps) {
  const { user } = useSession();
  const [message, setMessage] = useState("");
  const { addMessages } = useMessagesStore();
  const params = useSearchParams();
  const receiverId = params.get("receiver") ?? "";
  const combinedData = [user.id, receiverId].sort().join("");
  const hash = crypto.createHash("sha256").update(combinedData).digest("hex");
  const uniqueKey = `chat:${hash}:message:update`;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
    isSuccess,
  } = useInfiniteQuery({
    queryKey: ["messages", user.id, receiverId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/messages/DM/${receiverId}`,
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<any>(),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    socket.on(uniqueKey, (newMessage: Message) => {
      addMessages(newMessage);
    });

    return () => {
      socket.off(uniqueKey);
    };
  }, [socket, user.id, receiverId, addMessages, uniqueKey]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: MessageProps = {
        content: message,
        receiverId,
        senderId: user.id,
      };
      socket.emit("sendMessage", newMessage);
      setMessage("");
    }
  };

  {
    isLoading && <Loader2 className="animate-spin size-10" />;
  }

  {
    isSuccess && data.pages.length && <p>Data Not found</p>;
  }
  {
    isError && <p>Okeee</p>;
  }

  return (
    receiverId &&
    data?.pages && (
      <div className={cn("w-full md:block   relative h-full")}>
        <CustomChannelHeader openSidebar={openSidebar} data={receiverId} />
        <Infintinscroll
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
          className="flex-grow overflow-y-auto p-4 h-[400px]"
        >
          {data?.pages.map((page, i) => (
            <div key={i}>
              {page.messages.map((message: Message) => (
                <Fragment key={message.id}>
                  <div
                    className={`text-sm p-3 rounded-xl w-full max-w-[40%] my-3 ${
                      message.senderId === user.id
                        ? "ml-auto bg-blue-500 text-white"
                        : "mr-auto bg-gray-200"
                    }`}
                  >
                    <span className="grid space-y-1">
                      <strong>
                        {message.senderId === user.id ? "Me" : "Friend"}
                      </strong>
                      <strong>{message.content}</strong>
                    </span>
                    <span>{formatRelativeDate(message.createdAt)}</span>
                  </div>
                  {user.id === message.senderId && (
                    <DeleteMessage id={message.id} />
                  )}
                </Fragment>
              ))}
            </div>
          ))}
        </Infintinscroll>
        <ChatInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
        />
      </div>
    )
  );
}
