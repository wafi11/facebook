"use client";
import React from "react";
import { useToast } from "../ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { deletePost } from "./actions";
import { PostData } from "@/lib/types";
import { PostsPage } from "@/app/api/posts/for-you/types";

export const useDeletemutations = (post: PostData) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const Router = useRouter();
  const pathname = usePathname();

  const mutations = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilters: QueryFilters = {
        queryKey: ["posts-feed", "for-you"],
      };
      await queryClient.cancelQueries(queryFilters);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilters,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((post) => ({
              nextCursor: post.nextCursor,
              posts: post.posts.filter((p) => p.id !== deletedPost.id),
            })),
          };
        }
      );

      toast({
        description: "Post deleted",
      });

      if (pathname === `/posts/${post.id}`) {
        Router.push(`/users/${post.user?.name}`);
      }
    },
    onError(err) {
      console.log(err),
        toast({
          variant: "destructive",
          description: "Failed to Delete posts. Please Try again",
        });
    },
  });

  return mutations;
};
