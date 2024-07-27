import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { DeleteMessages } from "./useMessages";
import { MessagePage } from "@/app/api/messages/DM/[userId]/types";
import LoadingButton from "@/components/utils/LodingButtons";
import { Trash2 } from "lucide-react";
import { useSession } from "../SessionProvider";

function useMutations() {
  const { toast } = useToast();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: DeleteMessages,
    onSuccess: async (message) => {
      const queryKey: QueryKey = ["messages", user.id, message.receiverId];
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              messages: page.messages.filter((p) => p.id !== message.id),
            })),
          };
        }
      );
      toast({
        description: " Delected Messages",
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

export default function DeleteMessage({ id }: { id: string }) {
  const mutation = useMutations();

  function handleDelete() {
    mutation.mutate(id);
  }

  return (
    <div className="flex items-end w-full justify-end">
      <LoadingButton
        className="flex bg-destructive "
        onClick={handleDelete}
        loading={mutation.isPending}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Deleting..." : <Trash2 />}
      </LoadingButton>
    </div>
  );
}
