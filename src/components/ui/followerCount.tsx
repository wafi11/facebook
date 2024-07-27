"use client";
import { FollowerInfo } from "@/app/api/posts/for-you/types";
import userFollowerInfo from "@/hooks/userFollowerInfo";
import { formatNumber } from "@/lib/utils";

interface Props {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowerCount({ initialState, userId }: Props) {
  const { data } = userFollowerInfo(userId, initialState);

  return (
    <span>
      Followers :
      <span className="font-semibold">{formatNumber(data.followers)}</span>
    </span>
  );
}
