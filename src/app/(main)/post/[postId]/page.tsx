import {
  getPostDataInclude,
  UserData,
} from "@/app/api/users/[userId]/followers/types";
import Post from "@/components/posts/Post";
import ButtonFollow from "@/components/ui/ButtonFollow";
import Linkfy from "@/components/ui/LinkItUrl";
import UserProfile from "@/components/ui/userImage";
import UserToolTip from "@/components/ui/UserToltip";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

interface Iparams {
  params: {
    postId: string;
  };
}

const getData = cache(async (postId: string, userId: string) => {
  const data = await db.post.findUnique({
    where: { id: postId },
    include: getPostDataInclude(userId),
  });
  if (!data) notFound();

  return data;
});

export async function generateMetadata({
  params: { postId },
}: Iparams): Promise<Metadata> {
  const { user } = await validateRequest();

  if (!user) return {};
  const post = await getData(postId, user.id);

  return {
    title: `${post?.user?.displayname}: ${post.content.slice(0, 50)}...`,
  };
}

export default async function Page({ params }: Iparams) {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not Authorized to views this page
      </p>
    );
  }

  const post = await getData(params.postId, user.id);
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Post post={post} />
      </div>
      <div className="sticky top-[5.25rem]  hidden h-fit w-80 flex-none lg:block">
        <Suspense
          fallback={<Loader2 className="size-4 mx-auto animate-spin" />}
        >
          <Sidebar user={post.user} />
        </Suspense>
      </div>
    </main>
  );
}

interface UserInfoSidebar {
  user: UserData | any;
}

async function Sidebar({ user }: UserInfoSidebar) {
  const { user: loggedInUser } = await validateRequest();
  await new Promise((r) => setTimeout(r, 5000));
  if (!loggedInUser) {
    return null;
  }
  return (
    <div className="space-y-5 rounded-2xl bg-card  p-5 shadow-sm">
      <div className="text-xl font-bold">About This User</div>
      <UserToolTip user={user}>
        <Link href={`/user/${user.id}`} className="flex items-center gap-3">
          <UserProfile
            avatarUrl={user.avatarUrl}
            className="flex-none w-20 h-20"
            size={200}
          />
          <div className="">
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {user.displayname}
            </p>
            <p className="line-clamp-1 break-all text-muted-foreground">
              @{user.name}
            </p>
          </div>
        </Link>
      </UserToolTip>
      <Linkfy>
        <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
          {user.bio}
        </div>
      </Linkfy>
      {user.id !== loggedInUser.id && (
        <ButtonFollow
          userId={user.id}
          initialState={{
            followers: user._count.followers,
            isFollowingByUser: user.followers.some(
              ({ followerId }: any) => followerId === loggedInUser.id
            ),
          }}
        />
      )}
    </div>
  );
}
