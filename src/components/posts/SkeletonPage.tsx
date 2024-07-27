import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function SkeletonPage() {
  return (
    <div className="space-y-5">
      <SkeletonAnimation />
      <SkeletonAnimation />
      <SkeletonAnimation />
    </div>
  );
}

const SkeletonAnimation = () => {
  return (
    <div className="animate-pulse w-full space-y-3 p-5 border-b-2 ">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="size-13 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
      <Skeleton className="h-14 rounded" />
    </div>
  );
};
