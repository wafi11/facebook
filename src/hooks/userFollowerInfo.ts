"use client";
import { FollowerInfo } from "@/app/api/posts/for-you/types";
import kyInstance from "@/components/utils/ky";
import { useQuery } from "@tanstack/react-query";

const UserFollowerInfo = (userId: string, initialState: FollowerInfo) => {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  return query;
};

export default UserFollowerInfo;
