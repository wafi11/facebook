import { BookmarksInfo } from "@/app/api/posts/[postId]/bookmarks/types";
import { useToast } from "../ui/use-toast";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import kyInstance from "../utils/ky";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarksProps {
  postId: string;
  initialState: BookmarksInfo;
}

export default function ButtonBookmarks({
  initialState,
  postId,
}: BookmarksProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookmarks-info", postId];
  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/bookmarks`).json<BookmarksInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookamarksByUser
        ? kyInstance.delete(`/api/posts/${postId}/bookmarks`)
        : kyInstance.post(`/api/posts/${postId}/bookmarks`),
    onMutate: async () => {
      toast({
        description: `Post ${data.isBookamarksByUser ? "un" : ""}Bookmarked`,
      });

      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<BookmarksInfo>(queryKey);

      queryClient.setQueryData<BookmarksInfo>(queryKey, () => ({
        isBookamarksByUser: !previousState?.isBookamarksByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.log(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });
  return (
    <button className="flex items-center gap-3" onClick={() => mutate()}>
      <Bookmark
        className={cn(
          "size-5",
          data.isBookamarksByUser && "fill-primary text-primary"
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.isBookamarksByUser}
      </span>
    </button>
  );
}
