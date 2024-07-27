"use client";
import { PostData } from "@/lib/types";
import Link from "next/link";
import UserProfile from "../ui/userImage";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostMoreButton from "./PostMoreButton";
import Linkfy from "../ui/LinkItUrl";
import UserToolTip from "../ui/UserToltip";
import { Media } from "@prisma/client";
import Image from "next/image";
import LikeButton from "./mutationLikeButton";
import ButtonBookmarks from "./ButtonBookmarks";
import { useState } from "react";
import CommentButton, { Comments } from "../comments/CommentsButton";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();

  const [showComment, setShowComment] = useState<boolean>(false);
  return (
    <article
      className="group/post space-y-3 p-3 border-b-2 bg-card rounded-md shadow-lg"
      key={post.id}
    >
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserToolTip user={post.user}>
            <Link href={`/users/${post.user?.name}`}>
              <UserProfile avatarUrl={post.user?.avatarUrl} />
            </Link>
          </UserToolTip>
          <div className="">
            <UserToolTip user={post.user}>
              <Link
                href={`/users/${post.user?.name}`}
                className="block font-medium hover:underline"
              >
                {post.user?.name}
              </Link>
            </UserToolTip>
            <Link
              href={`/post/${post.id}`}
              className="text-sm text-gray-600 hover:underline"
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user?.id === user?.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity  group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkfy>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkfy>
      {!!post.media.length && <Mediapreviews Media={post.media} />}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              like: post._count.like,
              isLikedByUser: post.like.some((like) => like.userId === user?.id),
            }}
          />
          <CommentButton
            onClick={() => setShowComment(!showComment)}
            post={post}
          />
        </div>
        <ButtonBookmarks
          postId={post.id}
          initialState={{
            isBookamarksByUser: post.Bookmarks.some(
              (book) => book.userId === user?.id
            ),
          }}
        />
      </div>
      {showComment && <Comments post={post} />}
    </article>
  );
}

interface MediaProps {
  Media: Media[];
}

function Mediapreviews({ Media }: MediaProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        Media.length > 1 && "grid-grid-cols-2 "
      )}
    >
      {Media.map((item) => (
        <MediaPreview key={item.id} media={item} />
      ))}
    </div>
  );
}

function MediaPreview({ media }: { media: Media }) {
  if (media.type === "IMAGE") {
    return (
      <Image
        alt="/"
        src={media.url}
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem]  rounded-2xl"
      />
    );
  }
  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          controls
          src={media.url}
          className="mx-auto size-fit max-h-[30rem]  rounded-2xl"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported Media Type</p>;
}
