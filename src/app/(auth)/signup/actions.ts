"use server";
import { getUserByEmail, getUserByUsername } from "@/app/data/user";
import { lucia } from "@/lib/auth";
import db from "@/lib/prisma";
import { register, RegisterSchema } from "@/lib/vaidationSchema";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(
  credentials: RegisterSchema
): Promise<{ error?: string }> {
  try {
    const { email, name, password } = register.parse(credentials);
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    const userId = generateIdFromEntropySize(10);
    const existingUsername = await getUserByUsername(name);
    const existingemail = await getUserByEmail(name);

    if (existingUsername || existingemail) {
      return {
        error: "Invalid Data",
      };
    }

    await db.user.create({
      data: {
        id: userId,
        name,
        displayname: name,
        email,
        passwordHash,
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return redirect("/login");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.log(error);
    return {
      error: "Something Went Wrong.Please Try again",
    };
  }
}
