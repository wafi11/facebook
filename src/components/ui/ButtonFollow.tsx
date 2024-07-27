"use client";
import { FollowerInfo } from "@/app/api/posts/for-you/types";
import React from "react";
import { useToast } from "./use-toast";
import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import UserFollowerInfo from "@/hooks/userFollowerInfo";
import kyInstance from "../utils/ky";
import { Button } from "./button";

interface Props {
  userId: string;
  initialState: FollowerInfo;
}

const ButtonFollow = ({ initialState, userId }: Props) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["follower-info", userId];

  const { data } = UserFollowerInfo(userId, initialState);
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowingByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowingByUser ? -1 : 1),
        isFollowingByUser: !previousState?.isFollowingByUser,
      }));

      return { previousState };
    },

    onError(err, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(err);
      toast({
        variant: "destructive",
        description: "Something Went Wrong ,Please Try Again",
      });
    },
  });

  return (
    <Button
      variant={data.isFollowingByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowingByUser ? "Unfollow" : "follow"}
    </Button>
  );
};

export default ButtonFollow;
