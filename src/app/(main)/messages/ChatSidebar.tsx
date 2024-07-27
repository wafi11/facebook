import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MailPlus, SearchIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "../SessionProvider";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import kyInstance from "@/components/utils/ky";
import UserProfile from "@/components/ui/userImage";
import Link from "next/link";
import useMessagesStore from "@/hooks/useStore";

interface UserData {
  id: string;
  name: string;
  displayname: string | null;
  avatarUrl: string | null;
}

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  user: UserData[];
}

export default function ChatSidebar({ open, onClose, user }: ChatSidebarProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedSearchTerm = useDebounce(inputValue, 300);
  const { user: loggedInUser } = useSession();
  const { data, isLoading, status, refetch } = useQuery({
    queryKey: ["users", debouncedSearchTerm],
    queryFn: () =>
      kyInstance
        .get(`/api/users/search/${debouncedSearchTerm}`)
        .json<UserData[]>(),
    enabled: false,
    refetchInterval: 60 * 1000,
  });

  useEffect(() => {
    if (debouncedSearchTerm) {
      refetch();
    }
  }, [debouncedSearchTerm, refetch]);

  const renderContent = () => {
    if (isLoading) {
      return <Loader2 className="animate-spin size-10 mx-auto mt-4" />;
    }

    if (status === "success" && data?.length === 0) {
      return (
        <p className="text-center p-2">
          No users found. Try a different search term.
        </p>
      );
    }

    const usersToDisplay =
      data?.filter((i) => i.id !== loggedInUser.id) ||
      user.filter((I) => I.id !== loggedInUser.id);
    return usersToDisplay?.map((u) => (
      <Link
        href={`/messages?receiver=${u.id}`}
        className="flex gap-5 p-2 bg-secondary rounded-md"
        key={u.id}
      >
        <UserProfile
          avatarUrl={u.avatarUrl || "/placeholder.jpg"}
          className="w-10 h-10"
        />
        <span className="items-center">
          <p>{u.displayname}</p>
          <p className="text-sm text-gray-800">@{u.name}</p>
        </span>
      </Link>
    ));
  };

  return (
    <div
      className={cn(
        "size-full flex-col h-[500px] border-e md:flex md:w-80",
        open ? "flex" : "hidden"
      )}
    >
      <MenuHeader onClose={onClose} />
      <div className="relative p-2">
        <Input
          className=""
          placeholder="Search Contact..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button className="absolute right-[14px] top-[13px] rounded-full text-black">
          <SearchIcon className="size-5" />
        </button>
      </div>
      <div className="space-y-2 px-2">{renderContent()}</div>
    </div>
  );
}

interface MenuHeaderProps {
  onClose: () => void;
}

function MenuHeader({ onClose }: MenuHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-2">
      <div className="h-full md:hidden">
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="size-5" />
        </Button>
      </div>
      <h1 className="me-auto text-xl font-bold md:ms-2">Messages</h1>
    </div>
  );
}
