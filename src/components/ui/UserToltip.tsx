"use client";
import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo } from "@/app/api/posts/for-you/types";
import { UserData } from "@/app/api/users/[userId]/followers/types";
import React, { PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import Link from "next/link";
import UserProfile from "./userImage";
import ButtonFollow from "./ButtonFollow";
import Linkfy from "./LinkItUrl";
import FollowerCount from "./followerCount";

interface Props extends PropsWithChildren {
  user: UserData | any;
}

export default function UserToolTip({ children, user }: Props) {
  const { user: LoggedInUser } = useSession();

  const followerState: FollowerInfo = {
    followers: user._count.followers,
    isFollowingByUser:
      user?.followers?.some(
        ({ followerId }: any) => followerId === LoggedInUser?.id
      ) ?? false,
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52 ">
            <div className="flex items-center justify-between gap-2">
              <Link className="" href={`/users/${user.name}`}>
                <UserProfile size={70} avatarUrl={user.avatarUrl} />
              </Link>
              {LoggedInUser?.id !== user.id && (
                <ButtonFollow initialState={followerState} userId={user.id} />
              )}
            </div>
            <div className="">
              <Link href={`/users/${user.name}`}>
                <div className="text-lg font-semibold hover:underline">
                  {user.name}
                </div>
                <div className="text-muted-foreground">@{user.displayname}</div>
              </Link>
            </div>
            {user.bio && (
              <Linkfy>
                <div className="line-clamp-4  whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkfy>
            )}
            <FollowerCount userId={user.id} initialState={followerState} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
