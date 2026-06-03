// src/components/ui/avatar.tsx

import { cn } from "@/lib/utils/cn";
import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full ring-2 ring-white shadow-sm",
        sizes[size],
        className,
      )}
    >
      <Image src={src} alt={alt} fill className="object-cover" unoptimized />
    </div>
  );
}
