"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Input } from "./input";

interface FormData {
  q: string;
}

const Search = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const { push } = useRouter();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const q = data.q.trim();
    if (!q) return;
    console.log(q);
    push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative">
        <Input
          type="text"
          {...register("q")}
          placeholder="Search..."
          className="pe-10 h-9 text-black border-gray-200 focus:border-gray-2 focus:outline-none bg-gray-200"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
        >
          <SearchIcon />
        </button>
      </div>
    </form>
  );
};

export default Search;
