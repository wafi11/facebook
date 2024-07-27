import { validateRequest } from "@/lib/auth";
import { UserDataSelect } from "@/lib/types";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import UserProfile from "../ui/userImage";
import { Button } from "../ui/button";
import { unstable_cache } from "next/cache";
import db from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import ButtonFollow from "../ui/ButtonFollow";
import { getUserDataSelect } from "@/app/api/users/[userId]/followers/types";
// sticky top-[5.25rem] bg-gray-200 dark:bg-neutral-900 h-fit hidden space-y-3 rounded-2xl flex-none  px-3  py-4 shadow-sm xl:w-80 sm:block
const TrendsSidebar = () => {
  return (
    <div className="sticky top-[5.25rem] h-fit hidden space-y-3 flex-none  px-3 lg:px-5   xl:w-80 sm:block ">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin " />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
};

export default TrendsSidebar;

async function WhoToFollow() {
  const { user } = await validateRequest();

  if (!user) return null;
  const userToFollow = await prisma?.user.findMany({
    where: {
      NOT: {
        id: user?.id,
      },
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 5,
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-black dark:text-white items-center">
        Get Freinds.
      </h1>
      {userToFollow?.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <Link
            href={`/users/${user.name}`}
            className="flex items-center gap-3"
          >
            <UserProfile
              avatarUrl={user.avatarUrl}
              className="flex-none w-10 h-10"
            />
            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline text-sm">
                {user.displayname}
              </p>
              <p className="line-clamp-1 break-all font-semibold hover:underline text-sm">
                @{user.name}
              </p>
            </div>
          </Link>
          <ButtonFollow
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowingByUser: user.followers.some(
                ({ followerId }) => followerId === user.id
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await db.$queryRaw<{ hashtag: string; count: bigint }[]>`
      SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
      FROM posts
      GROUP BY hashtag
      ORDER BY count DESC
      LIMIT 10
    `;

    return result.map((row) => ({
      hastag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60,
  }
);

async function TrendingTopics() {
  const trending = await getTrendingTopics();

  return (
    <div className="space-y-5  ">
      <div className="text-xl font-semibold"> Trending topics</div>
      {trending.map(({ hastag, count }) => {
        const title = hastag.split("#")[1];
        return (
          <Link
            key={`${hastag}_${count}`}
            href={`/hastag/${title}`}
            className="block"
          >
            <p
              className="line-clamp-1 break-all font-semibold hover:underline text-sm text-blue-500"
              title={hastag}
            >
              {hastag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
