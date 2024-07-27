import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { DeleteComments, SubmitComment } from "./actions";
import { CommentPage } from "@/lib/types";

export function useSubmitComment(postId: string) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: SubmitComment,
    onSuccess: async (comment) => {
      const queryKey: QueryKey = ["comments", postId];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentPage, string | null>>(
        queryKey,
        (oldData) => {
          const fristPage = oldData?.pages[0];

          if (fristPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  previousCursor: fristPage.previousCursor,
                  comments: [...fristPage.comments, comment],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        }
      );

      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });

      toast({
        description: "Comment Created",
      });
    },
    onError(err) {
      console.log(err),
        toast({
          title: "Create Comemnt Failed",
          description: "Cannot post comment",
        });
    },
  });

  return mutation;
}

export function useDeleteComments() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: DeleteComments,
    onSuccess: async (comment) => {
      const queryKey: QueryKey = ["comments", comment.postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              previousCursor: page.previousCursor,
              comments: page.comments.filter((p) => p.id !== comment.id),
            })),
          };
        }
      );
      toast({
        description: "Comments Delected",
      });
    },
    onError(err) {
      console.log(err),
        toast({
          title: "Create Comemnt Failed",
          description: "Cannot post comment",
        });
    },
  });

  return mutation;
}
