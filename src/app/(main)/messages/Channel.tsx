"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserProfile from "@/components/ui/userImage";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Menu, Send, User } from "lucide-react";

const fetchUser = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}/user`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

interface CustomChannelHeaderProps {
  openSidebar: () => void;
  data: string;
}

export function CustomChannelHeader({
  openSidebar,
  data,
  ...props
}: CustomChannelHeaderProps) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-info", data],
    queryFn: () => fetchUser(data),
  });

  if (isLoading) return <Loader2 className="animate-spin size-2" />;
  if (error)
    return <div>An error has occurred: {(error as Error).message}</div>;

  return (
    <div className="flex items-center gap-3 bg-accent w-full p-2">
      <Button size="icon" variant="ghost" onClick={openSidebar}>
        <Menu className="size-5" />
      </Button>
      <UserProfile avatarUrl={user.avatarUrl} className="w-10 h-10" />
      <div className="flex flex-col">
        <h2 className="font-bold">{user.name}</h2>
        <h2 className="text-xs">@{user.displayname}</h2>
      </div>
    </div>
  );
}

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export function ChatInput({
  message,
  setMessage,
  handleSendMessage,
}: ChatInputProps) {
  return (
    <div className="border-y-2 bg-gray-200 absolute bottom-0 w-full">
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="flex-grow focus:outline-none px-4 py-2 mx-auto"
        />
        <Button onClick={handleSendMessage} size="icon">
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  );
}
