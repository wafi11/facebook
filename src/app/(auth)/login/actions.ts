"use server";
import { loginSchema, LoginSchema } from "@/lib/vaidationSchema";
import { isRedirectError } from "next/dist/client/components/redirect";
import { verify } from "@node-rs/argon2";
import db from "@/lib/prisma";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signIn(
  credentials: LoginSchema
): Promise<{ error?: string }> {
  try {
    const { name, password } = loginSchema.parse(credentials);
    const existingUsername = await db.user.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (!existingUsername || !existingUsername.passwordHash) {
      return {
        error: "Incorrect username ",
      };
    }

    const validPW = await verify(existingUsername.passwordHash, password, {
      memoryCost: 19456,
      parallelism: 1,
      timeCost: 2,
      outputLen: 32,
    });

    if (!validPW) {
      return {
        error: "Incorrect username or password",
      };
    }
    const session = await lucia.createSession(existingUsername.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.log(error);
    return {
      error: "Something Went Wrong.Please Try again",
    };
  }
}
