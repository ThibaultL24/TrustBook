// src/components/profile/edit-profile-modal.tsx
"use client";

import { useRef, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { demoCoverForAddress } from "@/lib/mock/demo-media";
import {
  buildProfileMediaPatch,
  compressImageForStorage,
  defaultCoverForAddress,
} from "@/lib/profile/profile-media-store";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import { Camera, ImageIcon, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export function EditProfileModal({ profile, onClose }: EditProfileModalProps) {
  const { updateProfileMedia, showActionToast } = useTrustbook();

  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);
  const [coverPreview, setCoverPreview] = useState(
    profile.coverUrl ??
      demoCoverForAddress(profile.address) ??
      defaultCoverForAddress(profile.address),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(
    file: File | undefined,
    target: "avatar" | "cover",
  ) {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await compressImageForStorage(
        file,
        target === "avatar"
          ? { maxWidth: 512, maxHeight: 512, maxBytes: 280_000 }
          : { maxWidth: 1200, maxHeight: 450, maxBytes: 380_000 },
      );
      if (target === "avatar") setAvatarPreview(dataUrl);
      else setCoverPreview(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid image");
    }
  }

  function handleReset() {
    updateProfileMedia(profile.address, {
      avatarUrl: undefined,
      coverUrl: undefined,
    });
    showActionToast("Profile photos reset", "info");
    onClose();
  }

  function handleSave() {
    setSaving(true);
    setError(null);
    const patch = buildProfileMediaPatch(
      profile.address,
      avatarPreview,
      coverPreview,
    );
    const saved = updateProfileMedia(profile.address, patch);
    setSaving(false);
    if (!saved) return;
    showActionToast("Profile updated", "success");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-4 h-32 overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={coverPreview}
            alt="Cover preview"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/70"
          >
            <Camera className="h-3.5 w-3.5" />
            Change cover
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0], "cover")}
          />
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={avatarPreview}
              alt={profile.displayName}
              size="lg"
              className="!h-20 !w-20"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow ring-2 ring-white hover:bg-emerald-700"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0], "avatar")}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Profile photo</p>
            <p className="text-xs text-slate-500">JPG, PNG or WebP · max 2 MB</p>
          </div>
        </div>

        <p className="mb-4 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" />
          Photos are saved on this device for your Trustbook profile. Your
          Circles on-chain avatar is unchanged.
        </p>

        {error && (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold",
              "text-slate-600 ring-1 ring-[var(--border)] hover:bg-slate-50",
            )}
          >
            <RotateCcw className="h-4 w-4" />
            Reset to default
          </button>
        </div>
      </div>
    </div>
  );
}
