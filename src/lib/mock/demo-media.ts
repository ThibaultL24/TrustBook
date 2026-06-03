// src/lib/mock/demo-media.ts

import { MOCK_ADDRESSES, VIEWER_ADDRESS } from "./addresses";

/** Local portrait assets for demo accounts (bundled in /public/avatars). */
export const DEMO_AVATARS = {
  alice: "/avatars/alice-chen.jpg",
  bob: "/avatars/bob-okonkwo.jpg",
  carla: "/avatars/carla-mendez.jpg",
  diego: "/avatars/diego-ruiz.jpg",
  elena: "/avatars/elena-vasquez.jpg",
  fern: "/avatars/fern-taylor.jpg",
  gina: "/avatars/gina-park.jpg",
  hans: "/avatars/hans-weber.jpg",
  iris: "/avatars/iris-nakamura.jpg",
} as const;

/** Local cover banners for demo profile pages. */
export const DEMO_COVERS = {
  alice: "/covers/alice-chen.jpg",
  bob: "/covers/bob-okonkwo.jpg",
  carla: "/covers/carla-mendez.jpg",
  diego: "/covers/diego-ruiz.jpg",
  elena: "/covers/elena-vasquez.jpg",
  fern: "/covers/fern-taylor.jpg",
  gina: "/covers/gina-park.jpg",
  hans: "/covers/hans-weber.jpg",
  iris: "/covers/iris-nakamura.jpg",
} as const;

const AVATAR_BY_ADDRESS: Record<string, string> = {
  [VIEWER_ADDRESS.toLowerCase()]: DEMO_AVATARS.alice,
  [MOCK_ADDRESSES.bob.toLowerCase()]: DEMO_AVATARS.bob,
  [MOCK_ADDRESSES.carla.toLowerCase()]: DEMO_AVATARS.carla,
  [MOCK_ADDRESSES.diego.toLowerCase()]: DEMO_AVATARS.diego,
  [MOCK_ADDRESSES.elena.toLowerCase()]: DEMO_AVATARS.elena,
  [MOCK_ADDRESSES.fern.toLowerCase()]: DEMO_AVATARS.fern,
  [MOCK_ADDRESSES.gina.toLowerCase()]: DEMO_AVATARS.gina,
  [MOCK_ADDRESSES.hans.toLowerCase()]: DEMO_AVATARS.hans,
  [MOCK_ADDRESSES.iris.toLowerCase()]: DEMO_AVATARS.iris,
};

const COVER_BY_ADDRESS: Record<string, string> = {
  [VIEWER_ADDRESS.toLowerCase()]: DEMO_COVERS.alice,
  [MOCK_ADDRESSES.bob.toLowerCase()]: DEMO_COVERS.bob,
  [MOCK_ADDRESSES.carla.toLowerCase()]: DEMO_COVERS.carla,
  [MOCK_ADDRESSES.diego.toLowerCase()]: DEMO_COVERS.diego,
  [MOCK_ADDRESSES.elena.toLowerCase()]: DEMO_COVERS.elena,
  [MOCK_ADDRESSES.fern.toLowerCase()]: DEMO_COVERS.fern,
  [MOCK_ADDRESSES.gina.toLowerCase()]: DEMO_COVERS.gina,
  [MOCK_ADDRESSES.hans.toLowerCase()]: DEMO_COVERS.hans,
  [MOCK_ADDRESSES.iris.toLowerCase()]: DEMO_COVERS.iris,
};

export function demoAvatarForAddress(address: string): string | undefined {
  return AVATAR_BY_ADDRESS[address.trim().toLowerCase()];
}

export function demoCoverForAddress(address: string): string | undefined {
  return COVER_BY_ADDRESS[address.trim().toLowerCase()];
}

export function isDemoMockAddress(address: string): boolean {
  return address.trim().toLowerCase() in AVATAR_BY_ADDRESS;
}
