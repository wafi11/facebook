"use client";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/lib/config";
import {
  UpdateUserProfile,
  UpdateUserProfileValues,
} from "@/lib/vaidationSchema";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import UpdateUser from "./action";
import { PostsPage } from "@/app/api/posts/for-you/types";
import { useUploadThing } from "@/lib/uploadthing";

export default function useProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { startUpload: startAvatarUpload } = useUploadThing("avatar");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      return Promise.all([
        await UpdateUser(values),
        avatar && startAvatarUpload([avatar]),
      ]);
    },
    onSuccess: async ([UpdateUser, uploadResult]) => {
      const newAvatarUrl = uploadResult?.[0].serverData.avatarUrl;
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user?.id === UpdateUser.id) {
                  return {
                    ...post,
                    user: {
                      ...UpdateUser,
                      avatarUrl: newAvatarUrl || UpdateUser.avatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        }
      );
      router.refresh();
      toast({
        variant: "destructive",
        description: "Profile Updated",
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile",
      });
      console.error("Profile update error:", error);
    },
  });

  return mutation;
}
