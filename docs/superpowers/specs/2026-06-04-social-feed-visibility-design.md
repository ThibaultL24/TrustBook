# Trustbook social feed — audience & Home

**Date:** 2026-06-04  
**Status:** Approved (user choices: audience C, home A)

## Goal

Move Trustbook closer to a social network: free-form posts on any topic, utility rubrics as shortcuts, and **audience chosen at publish time** (Circle / Communities / Discovery) with the **same Circles trust-circle logic** as the rest of the product.

## Product decisions

| Topic | Decision |
|-------|----------|
| Audience | **C** — choose on each post |
| Main feed | **A** — single **Home** feed + rubric carousel |
| Technical approach | `audience` field + central `canViewerSeePost()` |

## Data model

```ts
type PostAudience = "circle" | "communities" | "discovery";
type PostType = "thought" | "recommendation" | "offer" | "need" | "event";
```

- `Post.audience` required; default **`circle`** for `type === "thought"`.
- `communityId` required if `audience === "communities"`; otherwise optional with `open-feed` fallback.
- `type === "thought"`: optional title (body-first), body min. 10 characters.

## Visibility rules

| `audience` | Visible if |
|------------|------------|
| `circle` | Viewer is author, or `isInTrustCircle(viewer, author, edges)` |
| `communities` | Circle rule **or** `viewer.groups.includes(post.communityId)` |
| `discovery` | All viewers (mock demo) |

Apply before ranking in Home, profiles, focus modals, and story filtering.

## Feed UX (`/feed`)

- Replace multiple tabs with a **Home** header.
- **Rubric** carousel: `All` · `Thoughts` · `Needs` · `Offers` · `Recos` · `Events` · `My circle`.
- Keep existing community filter.
- `My circle` chip = authors in the trust graph (complements audience filter).

## Composer

- Main entry → **Thought** mode + audience selector (3 options, English labels).
- Secondary **Post a listing** link → utility flow (type + community).
- Stories: only when audience includes the circle.

## Ranking

- Unchanged (`rankFeed`, trust, CRC, Intuition).
- `filterByTab` replaced by `filterByRubric` + audience filter.

## Out of scope (v1)

- Reactions beyond tip/boost.
- On-chain audience persistence.
- Separate algorithmic “Following” feed.

## Files impacted

- `src/lib/types/index.ts`
- `src/lib/posts/visibility.ts`
- `src/lib/ranking/feed-ranking.ts` + tests
- `src/providers/trustbook-provider.tsx`
- `src/components/feed/*`, `src/components/posts/*`
- `src/lib/mock/posts.ts`, `src/lib/stories/helpers.ts`
