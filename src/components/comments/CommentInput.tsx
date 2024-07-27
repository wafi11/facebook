import { PostData } from "@/lib/types";
import React, { useState } from "react";
import { useSubmitComment } from "./mutation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, SendHorizonal } from "lucide-react";

interface Props {
  post: PostData;
}

export default function CommentInput({ post }: Props) {
  const [input, setInput] = useState("");
  const mutation = useSubmitComment(post.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input) return;

    mutation.mutate(
      {
        content: input,
        post,
      },
      {
        onSuccess: () => setInput(""),
      }
    );
  }
  return (
    <form className="flex w-full items-center gap-3" onSubmit={onSubmit}>
      <Input
        placeholder="Write a Comment...."
        value={input}
        className="py-2"
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <Button
        variant={"destructive"}
        size={"icon"}
        type="submit"
        disabled={!input.trim() || mutation.isPending}
      >
        {!mutation.isPending ? (
          <SendHorizonal />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
