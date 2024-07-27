"use server";
import { getUserDataSelect } from "@/app/api/users/[userId]/followers/types";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/prisma";
import {
  UpdateUserProfile,
  UpdateUserProfileValues,
} from "@/lib/vaidationSchema";

export default async function UpdateUser(values: UpdateUserProfileValues) {
  const validataionSchema = UpdateUserProfile.parse(values);

  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const updateUsers = await db.$transaction(async (tx) => {
    const UpdateUsers = await tx.user.update({
      where: { id: user.id },
      data: validataionSchema,
      select: getUserDataSelect(user.id),
    });

    return UpdateUsers;
  });

  return updateUsers;
}
