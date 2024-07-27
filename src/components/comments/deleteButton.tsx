"use client";
import { CommentData } from "@/lib/types";
import React, { useState } from "react";
import { useDeleteComments } from "./mutation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import LoadingButton from "../utils/LodingButtons";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal, Trash } from "lucide-react";

interface Props {
  comment: CommentData;
  onClose: () => void;
  open: boolean;
}

export const DeleteComments = ({ comment, onClose, open }: Props) => {
  const mutation = useDeleteComments();

  function handeOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose();
    }
  }
  return (
    <Dialog open={open} onOpenChange={handeOpenChange}>
      <DialogContent>
        <DialogHeader>Delete posts ?</DialogHeader>
        <DialogDescription>
          Are You Sure you want to Delete this post? This Action cannot be
          undone
        </DialogDescription>
        <DialogFooter>
          <LoadingButton
            loading={mutation.isPending}
            variant={"destructive"}
            onClick={() => mutation.mutate(comment.id, { onSuccess: onClose })}
          >
            Delete
          </LoadingButton>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface Propsing {
  comment: CommentData;
  className?: string;
}

export const CommentsMoreButton = ({ comment, className }: Propsing) => {
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
      <DeleteComments
        onClose={() => setShow(false)}
        open={show}
        comment={comment}
      />
    </>
  );
};
