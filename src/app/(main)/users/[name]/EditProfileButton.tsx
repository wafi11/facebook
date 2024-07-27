"use client";

import { UserData } from "@/app/api/users/[userId]/followers/types";
import { Button } from "@/components/ui/button";
import Cropper, { ReactCropperElement } from "react-cropper";
import Resizer from "react-image-file-resizer";
import "cropperjs/dist/cropper.css";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  UpdateUserProfile,
  UpdateUserProfileValues,
} from "@/lib/vaidationSchema";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Image, { StaticImageData } from "next/image";
import { Camera, FileInput } from "lucide-react"; // Pastikan Anda menginstal lucide-react
import useProfilePage from "./updateProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@/components/utils/LodingButtons";
import { Label } from "@/components/ui/label";

interface Props {
  user: UserData;
}

export default function EditProfileButton({ user }: Props) {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button variant={"outline"} onClick={() => setShow(true)}>
        Edit Profile
      </Button>
      <EditProfile open={show} setOpenChange={setShow} user={user} />
    </>
  );
}

interface EditProps {
  open: boolean;
  user: UserData;
  setOpenChange: (open: boolean) => void;
}

function EditProfile({ open, setOpenChange, user }: EditProps) {
  const mutation = useProfilePage();

  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(UpdateUserProfile),
    defaultValues: {
      bio: user.bio || "",
      displayname: user.displayname as string,
    },
  });

  const [cropedAvatar, setCropedAvatar] = useState<Blob | null>(null);

  const onSubmit = async (values: UpdateUserProfileValues) => {
    const newAvatarUrl = cropedAvatar
      ? new File([cropedAvatar], `avatar_${user.id}.webp`)
      : undefined;
    mutation.mutate(
      {
        values,
        avatar: newAvatarUrl,
      },
      {
        onSuccess: () => {
          setCropedAvatar(null);
          setOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Avatar</Label>
          <AvatarInput
            onImageCropped={setCropedAvatar}
            src={
              cropedAvatar
                ? URL.createObjectURL(cropedAvatar)
                : user.avatarUrl || "/placeholder.jpg"
            }
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="displayname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <Input placeholder="Your display name" {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <Input placeholder="Your bio" {...field} />
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton loading={mutation.isPending} type="submit">
                Submit
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface AvatarInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}

function AvatarInput({ onImageCropped, src }: AvatarInputProps) {
  const [imageCrop, setImageCrop] = useState<File>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) {
      return;
    }

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "WEBP",
      100,
      0,
      (uri) => {
        setImageCrop(uri as File);
      },
      "file"
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="hidden sr-only"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <Image
          src={src}
          alt="/"
          width={200}
          height={200}
          className="size-32  flex-none rounded-full object-cover"
        />
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center  bg-black bg-opacity-30 text-white transition-colors duration-200  group-hover:bg-opacity-25 rounded-full">
          <Camera size={24} />
        </span>
      </button>
      {imageCrop && (
        <CroppedImage
          croppedAspectRatio={1}
          src={URL.createObjectURL(imageCrop)}
          onCropped={onImageCropped}
          onClose={() => {
            setImageCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </>
  );
}

interface CropsImage {
  src: string;
  croppedAspectRatio: number;
  onCropped: (blob: Blob | null) => void;
  onClose: () => void;
}

function CroppedImage({
  croppedAspectRatio,
  onClose,
  onCropped,
  src,
}: CropsImage) {
  const croppedRef = useRef<ReactCropperElement>(null);

  function Crop() {
    const cropper = croppedRef.current?.cropper;
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob((blob) => onCropped(blob), "image/webp");
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cropped Image</DialogTitle>
        </DialogHeader>
        <Cropper
          src={src}
          aspectRatio={croppedAspectRatio}
          guides={false}
          zoomable={false}
          ref={croppedRef}
          className="mx-auto size-fit"
        />
        <DialogFooter>
          <Button onClick={onClose} variant={"secondary"}>
            Cancel
          </Button>
          <Button onClick={Crop}>Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
