import React from "react";
import Bookmarks from "./Bookmarked";
import TrendsSidebar from "@/components/sidebar/TrendsSIdebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
};

const Page = () => {
  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Bookmarks</h1>
        </div>
        <Bookmarks />
      </div>
      <TrendsSidebar />
    </main>
  );
};

export default Page;
