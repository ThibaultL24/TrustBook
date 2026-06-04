# Fil social & portée — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publications libres (`thought`) avec portée Cercle/Communautés/Découverte, fil Accueil unique et rubriques en chips, visibilité alignée sur le graphe Circles.

**Architecture:** `Post.audience` + `canViewerSeePost()` appliqué avant `rankFeed` ; remplacement `FeedTab` par `FeedRubric` ; UI chips + composer pensée avec sélecteur de portée.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Tailwind, TrustbookProvider mock state.

---

### Task 1: Types & visibilité

**Files:**
- Modify: `src/lib/types/index.ts`
- Create: `src/lib/posts/visibility.ts`
- Create: `src/lib/posts/visibility.test.ts`
- Modify: `src/lib/mock/communities.ts` (ajout `open-feed` si absent)

- [ ] **Step 1: Étendre types**

Ajouter `PostAudience`, `FeedRubric`, type `thought`, champ `audience` sur `Post`, remplacer `FeedTab`.

- [ ] **Step 2: Tests visibilité**

```ts
// visibility.test.ts — cas circle / communities / discovery + auteur
```

- [ ] **Step 3: Implémenter `canViewerSeePost`**

```ts
export function canViewerSeePost(
  viewerAddress: string,
  post: Post,
  viewerGroups: string[],
  edges?: TrustEdge[],
): boolean
```

- [ ] **Step 4:** `npm test -- src/lib/posts/visibility.test.ts`

---

### Task 2: Ranking & provider

**Files:**
- Modify: `src/lib/ranking/feed-ranking.ts`
- Modify: `src/lib/ranking/feed-ranking.test.ts`
- Modify: `src/providers/trustbook-provider.tsx`

- [ ] Remplacer `filterByTab` par `filterByRubric(ranked, rubric, viewer, edges)`.
- [ ] `getRankedFeed(rubric, communityId?)` : `rankFeed` → `filter` audience → rubric → community.
- [ ] `createPost` accepte `audience`, défauts, toast selon portée.
- [ ] Migrer seeds : `audience` sur tous les posts existants.

---

### Task 3: UI fil

**Files:**
- Create: `src/components/feed/feed-rubric-chips.tsx`
- Delete or repurpose: `src/components/feed/feed-tabs.tsx`
- Modify: `src/components/feed/feed-view.tsx`

- [ ] Chips horizontaux FR, état `FeedRubric`.
- [ ] En-tête « Accueil », retirer bannière onglet Circle seule.
- [ ] Brancher `getRankedFeed`.

---

### Task 4: Composer & cartes

**Files:**
- Modify: `src/components/posts/create-post-modal.tsx`
- Modify: `src/components/feed/post-composer.tsx`
- Modify: `src/components/posts/post-card.tsx`
- Modify: `src/components/posts/post-type-badge.tsx`
- Create: `src/components/posts/post-audience-badge.tsx`

- [ ] `PostComposer` : pensée par défaut ; lien annonce utilitaire.
- [ ] Modal pensée : portée 3 options, communauté conditionnelle, titre optionnel pour `thought`.
- [ ] Badges audience + thought sur carte.

---

### Task 5: Stories, profil, mock

**Files:**
- Modify: `src/lib/stories/helpers.ts`
- Modify: `src/lib/mock/posts.ts`
- Modify: `src/components/profile/profile-view.tsx` (si fil posts auteur)

- [ ] Stories : filtrer posts non visibles.
- [ ] 6+ posts `thought` démo (2 par portée).
- [ ] Profil : masquer posts non visibles au viewer.

---

### Task 6: Vérification

- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`

---

## Spec coverage

| Exigence spec | Task |
|---------------|------|
| `PostAudience` + `thought` | 1 |
| `canViewerSeePost` | 1–2 |
| Accueil + chips rubriques | 3 |
| Composer portée C | 4 |
| Stories / profil | 5 |
