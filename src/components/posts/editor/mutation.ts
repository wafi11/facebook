import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";
import { PostsPage } from "@/app/api/posts/for-you/types";
import { useSession } from "@/app/(main)/SessionProvider";

export function useSubmitPost() {
  const { toast } = useToast();
  const { user } = useSession();
  const queryclient = useQueryClient();
  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter = {
        queryKey: ["posts-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user?.id))
          );
        },
      } satisfies QueryFilters;
      await queryclient.cancelQueries(queryFilter);

      queryclient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData: any) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }

          return oldData;
        }
      );
      queryclient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });
      toast({
        description: "Post created",
      });
    },

    onError(err) {
      console.log(err);
      toast({
        variant: "destructive",
        description: "Failed To Post ,Please Try again",
      });
    },
  });

  return mutation;
}
