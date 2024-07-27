"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./input";

export default function SearchField() {
  const router = useRouter();
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} method="GET" action="/search">
      <div className="relative ">
        <Input
          name="q"
          placeholder="Search"
          className="pe-10 py-2 bg-accent focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-3 top-4 size-5 -translate-y-1/2 "
        >
          <SearchIcon className=" transform text-muted-foreground" />
        </button>
      </div>
    </form>
  );
}
