"use client";

import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

export interface Media {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function UseMediaUpload() {
  const { toast } = useToast();

  const [medias, setMedias] = useState<Media[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();

  const { startUpload, isUploading } = useUploadThing("media", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File([file], `media_${crypto.randomUUID()}.${extension}`, {
          type: file.type,
        });
      });
      setMedias((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);
      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      setMedias((prev) =>
        prev.map((a) => {
          const upload = res.find((r) => r.name === a.file.name);
          if (!upload) return a;
          return {
            ...a,
            mediaId: upload.serverData.mediaId,
            isUploading: false,
          };
        })
      );
      toast({
        title: "Upload Complete",
        description: "Your media has been successfully uploaded.",
      });
    },
    onUploadError: (error) => {
      setMedias((prev) => prev.filter((a) => !a.isUploading));
      toast({
        title: "Upload Error",
        description: error.message || "An error occurred during upload.",
        variant: "destructive",
      });
    },
  });

  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait for the current uploads finish.",
      });
      return;
    }

    if (medias.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "Please wait for the current uploads finish.",
      });
      return;
    }
    startUpload(files);
  }

  function RemoveMedias(fileName: string) {
    setMedias((prev) => prev.filter((a) => a.file.name !== fileName));
  }

  function reset() {
    setMedias([]);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    medias,
    isUploading,
    uploadProgress,
    RemoveMedias,
    reset,
  };
}
