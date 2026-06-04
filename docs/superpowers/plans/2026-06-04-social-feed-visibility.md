# Social feed & audience — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Free-form posts (`thought`) with Circle/Communities/Discovery audience, single Home feed and rubric chips, visibility aligned with the Circles graph.

**Architecture:** `Post.audience` + `canViewerSeePost()` before `rankFeed`; replace `FeedTab` with `FeedRubric`; thought composer with audience selector.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Tailwind, TrustbookProvider mock state.

---

### Task 1: Types & visibility

**Files:**
- Modify: `src/lib/types/index.ts`
- Create: `src/lib/posts/visibility.ts`
- Create: `src/lib/posts/visibility.test.ts`
- Modify: `src/lib/mock/communities.ts` (add `open-feed` if missing)

- [ ] Extend types: `PostAudience`, `FeedRubric`, `thought`, `audience` on `Post`.
- [ ] Visibility tests.
- [ ] Implement `canViewerSeePost`.
- [ ] Run `npm test -- src/lib/posts/visibility.test.ts`

---

### Task 2: Ranking & provider

**Files:**
- Modify: `src/lib/ranking/feed-ranking.ts`, tests, `src/providers/trustbook-provider.tsx`

- [ ] Replace `filterByTab` with `filterByRubric`.
- [ ] `getRankedFeed(rubric, communityId?)`.
- [ ] `createPost` accepts `audience`, toasts by audience.
- [ ] Migrate seeds with `audience`.

---

### Task 3: Feed UI

**Files:**
- Create: `src/components/feed/feed-rubric-chips.tsx`
- Modify: `src/components/feed/feed-view.tsx`

- [ ] English rubric chips, `FeedRubric` state.
- [ ] **Home** header.
- [ ] Wire `getRankedFeed`.

---

### Task 4: Composer & cards

**Files:**
- Modify: `create-post-modal.tsx`, `post-composer.tsx`, `post-card.tsx`, badges

- [ ] Thought by default; utility listing link.
- [ ] Audience selector; conditional community; optional title for `thought`.

---

### Task 5: Stories, profile, mock

- [ ] Story visibility filter.
- [ ] Demo `thought` posts (3 audiences).
- [ ] Profile hides non-visible posts.

---

### Task 6: Verification

- [ ] `npm test`, `npm run lint`, `npm run build`
