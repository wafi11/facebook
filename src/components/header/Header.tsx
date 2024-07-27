"use client";
import Link from "next/link";
import React from "react";
import UserButton from "../ui/userButton";
import Search from "../ui/Search";
import SearchField from "../ui/SearchComponent";

const Header = () => {
  return (
    <nav className="sticky top-0  z-10 bg-blue-800 shadow-sm">
      <div className="flex mx-auto max-w-7xl items-center justify-between  py-2 px-4">
        <div className="flex flex-auto items-center gap-3">
          <Link
            href={"/"}
            className="text-2xl   leading-none text-white text-primary font-bold"
          >
            .DEVWEB
          </Link>
          <SearchField />
        </div>
        <UserButton className="sm:mx-auto" />
      </div>
    </nav>
  );
};

export default Header;
