import { FollowerInfo } from "@/app/api/posts/for-you/types";
import {
  getUserDataSelect,
  UserData,
} from "@/app/api/users/[userId]/followers/types";
import TrendsSidebar from "@/components/sidebar/TrendsSIdebar";
import { Button } from "@/components/ui/button";
import ButtonFollow from "@/components/ui/ButtonFollow";
import FollowerCount from "@/components/ui/followerCount";
import UserProfile from "@/components/ui/userImage";
import { validateRequest } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import React, { cache } from "react";
import UserPosts from "./UserPosts";
import EditProfileButton from "./EditProfileButton";

interface PageProps {
  user: UserData;
  loggedInUser: string;
}

interface Props {
  params: {
    name: string;
  };
}

const getUser = cache(async (name: string, loggedUserId: string) => {
  const user = await prisma?.user.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedUserId),
  });

  return user;
});

export async function generateMetadata({ params }: Props) {
  const { user: loggedUser } = await validateRequest();

  if (!loggedUser) return {};

  const user = await getUser(params.name, loggedUser.id);

  return {
    title: `${user?.displayname}  (@${user?.name})`,
  };
}
const ProfilePage = async ({ params }: Props) => {
  const { user: loggedUser } = await validateRequest();

  if (!loggedUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view page
      </p>
    );
  }

  const user = await getUser(params.name, loggedUser.id);

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view page
      </p>
    );
  }
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0  space-y-5">
        <Profile loggedInUser={loggedUser.id} user={user} />
        <div className="rounded-2xl p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user?.displayname}&apos; Posts
          </h2>
        </div>
        <UserPosts userId={user?.id as string} />
      </div>
      <TrendsSidebar />
    </main>
  );
};

export default ProfilePage;

const Profile = ({ loggedInUser, user }: PageProps) => {
  const FollowerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowingByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUser
    ),
  };

  console.log(user);

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-gray-200 p-5 shadow-sm">
      <UserProfile
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-20  max-h-60 rounded-full"
      />

      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto  space-y-3 ">
          <div>
            <h1 className="text-3xl font-bold ">{user.displayname}</h1>
            <div className="text-muted-foreground">@{user.name}</div>
          </div>
          <div className="">
            Member Since {formatDate(user.createdAt, "MMM d ,yyyy")}
          </div>
          <div className="flex items-center gap-3">
            <span>
              Posts :<span>{formatNumber(user._count.post)}</span>
            </span>
            <FollowerCount initialState={FollowerInfo} userId={user.id} />
          </div>
        </div>
        {user.id === loggedInUser ? (
          <EditProfileButton user={user} />
        ) : (
          <ButtonFollow userId={user.id} initialState={FollowerInfo} />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <div className="overflow-hidden whitespace-pre-line  break-words">
            {user.bio}
          </div>
        </>
      )}
    </div>
  );
};
