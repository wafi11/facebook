"use client";
import { useQuery } from "@tanstack/react-query";
import React, { PropsWithChildren } from "react";
import kyInstance from "../utils/ky";
import { UserData } from "@/app/api/users/[userId]/followers/types";
import { HTTPError } from "ky";
import Link from "next/link";
import UserToolTip from "./UserToltip";

interface Props extends PropsWithChildren {
  name: string;
}

const UserLinkWithTooltip = ({ name, children }: Props) => {
  // const { data } = useQuery({
  //   queryKey: ["user-data", name],
  //   queryFn: () => kyInstance.get(`/api/users/name/${name}`).json<UserData>(),
  //   retry(failurCount, error) {
  //     if (error instanceof HTTPError && error.response.status === 400) {
  //       return false;
  //     }

  //     return failurCount < 3;
  //   },
  //   staleTime: Infinity,
  // });

  // if (!data) {
  //   return (
  //     <Link href={`/users/${name}`} className="text-blue-800 hover:underline">
  //       {children}
  //     </Link>
  //   );
  // }
  return (
    // <UserToolTip user={data}>
    <Link href={`/users/${name}`} className="text-blue-800 hover:underline">
      {children}
    </Link>
    // </UserToolTip>
  );
};

export default UserLinkWithTooltip;
