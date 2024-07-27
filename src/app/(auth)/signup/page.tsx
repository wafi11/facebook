import { Metadata } from "next";
import React from "react";
import Form from "./Form";
import Link from "next/link";
import Image from "next/image";
import Forms from "./Form";
export const metadata: Metadata = {
  title: "Sign Up",
};
const RegisterPage = () => {
  return (
    <main className="flex h-screen justify-center p-5 items-center ">
      <div className="flex h-full max-h-[40rem] max-w-[64rem]  w-full rounded-2xl overflow-hidden shadow-xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <div className="space-y-1 text-center">
            <h1>Sign Up To .devweb</h1>
          </div>
          <div className="space-y-5">
            <Forms />
            <Link
              href={"/login"}
              className="block items-center hover:underline"
            >
              Already have an Account?
            </Link>
          </div>
        </div>
        <Image
          src={"/signup-image.jpg"}
          width={800}
          height={800}
          alt="/"
          className="hidden md:w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
};

export default RegisterPage;
