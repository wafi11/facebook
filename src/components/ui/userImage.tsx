import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

export default function UserProfile({ avatarUrl, className, size }: Props) {
  return (
    <Image
      src={avatarUrl || "/placeholder.jpg"}
      alt="/"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "aspect-square flex-none h-fit w-full rounded-full  object-cover",
        className
      )}
    />
  );
}
