"use client";
import { PostData } from "@/lib/types";
import React from "react";
import { useDeletemutations } from "./mutations";
import { boolean } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import LoadingButton from "../utils/LodingButtons";
import { Button } from "../ui/button";

interface Props {
  post: PostData;
  open: boolean;
  onClose: () => void;
}

export const ButtonDelete = ({ onClose, open, post }: Props) => {
  const mutation = useDeletemutations(post);

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
            onClick={() => mutation.mutate(post.id, { onSuccess: onClose })}
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
