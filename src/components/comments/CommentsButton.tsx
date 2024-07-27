import { CommentData, CommentPage, PostData } from "@/lib/types";
import { Loader2, MessageSquare } from "lucide-react";
import CommentInput from "./CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "../utils/ky";
import UserToolTip from "../ui/UserToltip";
import Link from "next/link";
import UserProfile from "../ui/userImage";
import { formatRelativeDate } from "@/lib/utils";
import { Button } from "../ui/button";
import { useSession } from "@/app/(main)/SessionProvider";
import { CommentsMoreButton } from "./deleteButton";
import { useState } from "react";

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

interface Props {
  post: PostData;
}

export default function CommentButton({ onClick, post }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums ">
        {post._count.comments}
        <span className="hidden sm:inline px-2">Comments</span>
      </span>
    </button>
  );
}

export function Comments({ post }: Props) {
  const { data, hasNextPage, fetchNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", post.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {}
          )
          .json<CommentPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (fristPage) => fristPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  const comments = data?.pages.flatMap((page) => page.comments) || [];
  return (
    <div>
      <CommentInput post={post} />
      {hasNextPage && (
        <Button
          className="mx-auto"
          variant={"link"}
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load Preveeious
        </Button>
      )}
      {status === "pending" && <Loader2 className="animate-spin  mx-auto" />}
      {status === "success" && !comments.length && (
        <p className="text-center">No Comments Yet</p>
      )}
      {status === "error" && (
        <p className="text-destructive text-center">
          An Error while loading components
        </p>
      )}
      {comments.map((comm, idx) => (
        <Comment key={idx} comment={comm} />
      ))}
    </div>
  );
}

interface commProps {
  comment: CommentData;
}

function Comment({ comment }: commProps) {
  const { user } = useSession();
  const [show, setShow] = useState(false);
  return (
    <div className="group/comment flex gap-3 py-3">
      <span className="hidden sm:inline">
        <UserToolTip user={comment.user}>
          <Link href={`/users/${comment.user.id}`}>
            <UserProfile avatarUrl={comment.user.avatarUrl} size={40} />
          </Link>
        </UserToolTip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserToolTip user={comment.user}>
            <Link href={`/users/${comment.user.id}`}>
              {comment.user.displayname}
            </Link>
          </UserToolTip>
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.user.createdAt)}
          </span>
        </div>
        <div>{comment.comment}</div>
      </div>
      {comment.user.id === user?.id && (
        <CommentsMoreButton
          comment={comment}
          className="ms-auto opacity-0 transititon-opacity group-hover/comment:opacity-100"
        />
      )}
    </div>
  );
}
