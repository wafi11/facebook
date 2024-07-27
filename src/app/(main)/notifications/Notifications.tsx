"use client";
import kyInstance from "@/components/utils/ky";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Infintinscroll from "@/components/ui/infiniteScroll";
import SkeletonPage from "@/components/posts/SkeletonPage";
import Notification from "./Notification";

const Notifications = () => {
  const {
    data,
    isFetching,
    status,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = null }) =>
      kyInstance
        .get(
          "/api/notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<any>(),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () => kyInstance.patch("/api/notifications/mark-as-unread"),
    onSuccess: () => {
      queryClient.setQueryData(["unread-notifications-count"], {
        unreadCount: 0,
      });
    },
    onError(error) {
      console.log("failed to mark notifications");
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const Notifications = data?.pages.flatMap((page) => page.notification) || [];

  if (status === "pending") {
    return <SkeletonPage />;
  }

  if (status === "success" && !Notifications.length && !hasNextPage) {
    return (
      <p>No Notifications found.Start Following people to see their post</p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An Error Can't Get Notifications
      </p>
    );
  }
  return (
    <Infintinscroll
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      className="space-y-5"
    >
      {Notifications.map((post) => {
        return <Notification key={post.id} notification={post} />;
      })}
      {isFetchingNextPage && <Loader2 className="animate-spin mx-auto" />}
    </Infintinscroll>
  );
};

export default Notifications;
