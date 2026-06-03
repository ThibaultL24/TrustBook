// src/lib/profile/profile-media-store.ts

import type { UserProfile } from "@/lib/types";
import {
  demoAvatarForAddress,
  demoCoverForAddress,
} from "@/lib/mock/demo-media";

export interface ProfileMedia {
  avatarUrl?: string;
  coverUrl?: string;
}

const STORAGE_KEY = "trustbook-profile-media";
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export class ProfileMediaStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileMediaStorageError";
  }
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

function readAll(): Record<string, ProfileMedia> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ProfileMedia>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, ProfileMedia>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    throw new ProfileMediaStorageError(
      "Could not save photos — storage is full. Try a smaller image.",
    );
  }
}

export function loadProfileMedia(address: string): ProfileMedia {
  const all = readAll();
  return all[normalizeAddress(address)] ?? {};
}

export function saveProfileMedia(
  address: string,
  patch: Partial<ProfileMedia>,
): ProfileMedia {
  const key = normalizeAddress(address);
  const all = readAll();
  const current = all[key] ?? {};
  const next: ProfileMedia = { ...current, ...patch };

  if (!next.avatarUrl) delete next.avatarUrl;
  if (!next.coverUrl) delete next.coverUrl;

  if (Object.keys(next).length === 0) {
    delete all[key];
  } else {
    all[key] = next;
  }

  writeAll(all);
  return next;
}

export function clearProfileMedia(address: string): void {
  saveProfileMedia(address, { avatarUrl: undefined, coverUrl: undefined });
}

export function loadAllProfileMedia(): Record<string, ProfileMedia> {
  return readAll();
}

interface CompressOptions {
  maxWidth: number;
  maxHeight: number;
  maxBytes?: number;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    img.src = url;
  });
}

export async function compressImageForStorage(
  file: File,
  { maxWidth, maxHeight, maxBytes = 320_000 }: CompressOptions,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, WebP…).");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be under 2 MB.");
  }

  const img = await loadImageFromFile(file);
  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");

  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.88;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  while (dataUrl.length > maxBytes * 1.37 && quality > 0.45) {
    quality -= 0.06;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrl.length > maxBytes * 1.37) {
    throw new Error("Image is still too large after compression.");
  }

  return dataUrl;
}

/** @deprecated Use compressImageForStorage with size hints. */
export function readImageFileAsDataUrl(
  file: File,
  maxBytes = MAX_UPLOAD_BYTES,
): Promise<string> {
  return compressImageForStorage(file, {
    maxWidth: 512,
    maxHeight: 512,
    maxBytes: Math.min(maxBytes, 320_000),
  });
}

export function buildProfileMediaPatch(
  address: string,
  avatarUrl: string,
  coverUrl: string,
): Partial<ProfileMedia> {
  const defaultAvatar = demoAvatarForAddress(address);
  const defaultCover =
    demoCoverForAddress(address) ?? defaultCoverForAddress(address);

  const patch: Partial<ProfileMedia> = {};

  if (avatarUrl.startsWith("data:")) {
    patch.avatarUrl = avatarUrl;
  } else if (defaultAvatar && avatarUrl !== defaultAvatar) {
    patch.avatarUrl = avatarUrl;
  } else {
    patch.avatarUrl = undefined;
  }

  if (coverUrl.startsWith("data:")) {
    patch.coverUrl = coverUrl;
  } else if (defaultCover && coverUrl !== defaultCover) {
    patch.coverUrl = coverUrl;
  } else {
    patch.coverUrl = undefined;
  }

  return patch;
}

export function applyProfileMediaToUser(
  profile: UserProfile,
  mediaMap: Record<string, ProfileMedia>,
): UserProfile {
  const media = mediaMap[normalizeAddress(profile.address)];
  const demoCover = demoCoverForAddress(profile.address);
  return {
    ...profile,
    avatarUrl:
      media?.avatarUrl ??
      profile.avatarUrl ??
      demoAvatarForAddress(profile.address) ??
      "",
    coverUrl:
      media?.coverUrl ??
      profile.coverUrl ??
      demoCover ??
      defaultCoverForAddress(profile.address),
  };
}

export function defaultCoverForAddress(address: string): string {
  const seed = address.slice(2, 8);
  const n = parseInt(seed, 16) % 400;
  return `https://placekitten.com/800/${300 + (n % 120)}`;
}
