"use client";
import { PostData } from "@/lib/types";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Trash } from "lucide-react";
import { ButtonDelete } from "./buttonDelete";

interface Props {
  post: PostData;
  className?: string;
}

const PostMoreButton = ({ post, className }: Props) => {
  const [show, setShow] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"icon"} variant={"ghost"} className={className}>
            <MoreHorizontal className="size-5  text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShow(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ButtonDelete onClose={() => setShow(false)} open={show} post={post} />
    </>
  );
};

export default PostMoreButton;
