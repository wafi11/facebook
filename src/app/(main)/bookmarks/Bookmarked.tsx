"use client";
import Post from "@/components/posts/Post";
import kyInstance from "@/components/utils/ky";
import { PostData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Infintinscroll from "@/components/ui/infiniteScroll";
import SkeletonPage from "@/components/posts/SkeletonPage";
const Bookmarks = () => {
  const {
    data,
    isFetching,
    status,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts-feed", "bookmarked"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/bookmarked",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<any>(),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <SkeletonPage />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return <p>No posts found.Start Following people to see their post</p>;
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">An Error Can't Get posts</p>
    );
  }
  return (
    <Infintinscroll
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      className="space-y-5"
    >
      {posts.map((post) => (
        <Post post={post} key={post.id} />
      ))}
      {isFetchingNextPage && <Loader2 className="animate-spin mx-auto" />}\{" "}
    </Infintinscroll>
  );
};

export default Bookmarks;
