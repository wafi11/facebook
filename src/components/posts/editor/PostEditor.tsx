"use client";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { submitPost } from "./actions";
import { useSession } from "@/app/(main)/SessionProvider";
import UserProfile from "@/components/ui/userImage";
import { Button } from "@/components/ui/button";
import { useSubmitPost } from "./mutation";
import LoadingButton from "@/components/utils/LodingButtons";
import UseMediaUpload, { Media } from "./useMediaUpload";
import { ClipboardEvent, useRef } from "react";
import { Files, ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";

export default function PostEditor() {
  const { user } = useSession();

  const mutation = useSubmitPost();
  const {
    isUploading,
    medias,
    reset,
    startUpload,
    uploadProgress,
    RemoveMedias,
  } = UseMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { onClick, ...rootProps } = getRootProps();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Write Something",
      }),
    ],
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  async function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mediaIds: medias.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          reset();
        },
      }
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserProfile
          avatarUrl={user.avatarUrl}
          className="hidden sm:inline size-10"
        />
        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3",
              isDragActive && "outline-dashed"
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      {!!medias.length && <MediasButton media={medias} remove={RemoveMedias} />}
      <div className="flex items-center justify-end gap-3">
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-5 animate-spin text-primary" />
          </>
        )}
        <HandleImageUploads
          onChange={startUpload}
          disabled={isUploading || medias.length >= 5}
        />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

interface MediaProps {
  media: Media[];
  remove: (filname: string) => void;
}

function MediasButton({ media, remove }: MediaProps) {
  return (
    <div
      className={cn(
        "flex gap-5  flex-col",
        media.length > 1 && "sm-grid sm-grid-cols-2"
      )}
    >
      {media.map((item, idx) => (
        <Removeses
          key={idx}
          medias={item}
          onRemove={() => remove(item.file.name)}
        />
      ))}
    </div>
  );
}

interface ImageUploads {
  onChange: (file: File[]) => void;
  disabled: boolean;
}

function HandleImageUploads({ disabled, onChange }: ImageUploads) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        variant={"ghost"}
        size={"icon"}
        className="hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only hidden"
        ref={fileInputRef}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onChange(files);
            e.target.value || "";
          }
        }}
      />
    </>
  );
}

interface Removes {
  medias: Media;
  onRemove: () => void;
}

function Removeses({ medias: { file, isUploading, mediaId } }: Removes) {
  const src = URL.createObjectURL(file);
  return (
    <div
      className={cn("relative  mx-auto w-fit ", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="/"
          width={500}
          height={500}
          className="size-fit max-h-[30rem]  rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem]  rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button className="absolute right-3 top-3 rounded-full bg-gray-200 p-1.5 text-foreground transition-colors hover:bg-foreground/20">
          <X size={20} />
        </button>
      )}
    </div>
  );
}
