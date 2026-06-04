# Fil social Trustbook — portée & Accueil

**Date :** 2026-06-04  
**Statut :** Approuvé (choix utilisateur : portée C, accueil A)

## Objectif

Transformer Trustbook en expérience plus proche d’un réseau social : publications libres sur tout sujet, rubriques utilitaires en raccourcis, et **portée choisie à la publication** (Cercle / Communautés / Découverte) avec la **même logique de cercle de confiance Circles** que le reste du produit.

## Décisions produit

| Sujet | Décision |
|-------|----------|
| Portée | **C** — choix à chaque publication |
| Fil principal | **A** — un fil **Accueil** + carousel rubriques |
| Approche technique | Champ `audience` + `canViewerSeePost()` central |

## Modèle de données

```ts
type PostAudience = "circle" | "communities" | "discovery";
type PostType = "thought" | "recommendation" | "offer" | "need" | "event";
```

- `Post.audience` obligatoire ; défaut **`circle`** pour `type === "thought"`.
- `communityId` obligatoire si `audience === "communities"` ; sinon optionnel avec fallback `open-feed` (communauté générale démo).
- `type === "thought"` : titre optionnel (affichage corps-first), corps min. 10 caractères.

## Règles de visibilité

| `audience` | Visible si |
|------------|------------|
| `circle` | Auteur = viewer, ou `isInTrustCircle(viewer, author, edges)` |
| `communities` | Règle cercle **ou** `viewer.groups.includes(post.communityId)` |
| `discovery` | Tous les viewers (démo mock) |

Appliquer avant ranking dans Accueil, profils, modales focus, et filtrage stories (stories : auteurs cercle + posts dont le viewer peut voir le post source).

## UX fil (`/feed`)

- Remplacer les onglets multiples par un titre/zone **Accueil**.
- Carousel **Rubriques** : `Tout` · `Pensées` · `Besoins` · `Offres` · `Recos` · `Événements` · `Mon cercle`.
- Filtre communauté existant conservé.
- Chip `Mon cercle` = auteurs dans le graphe (complément du filtre portée).

## Composer

- Entrée principale → mode **Pensée** + sélecteur portée (3 options, libellés FR).
- Lien secondaire **Publier une annonce** → flux actuel (type + communauté).
- Stories : proposer seulement si la portée inclut le cercle (`circle` ou `communities` avec membres cercle).

## Ranking

- Inchangé (`rankFeed`, trust, CRC, Intuition).
- `filterByTab` remplacé par `filterByRubric` + `applyAudienceFilter`.

## Hors scope (v1)

- Réactions au-delà tip/boost.
- Persistance on-chain de la portée.
- Fil « Following » séparé algorithmiquement.

## Fichiers impactés

- `src/lib/types/index.ts`
- `src/lib/posts/visibility.ts` (nouveau)
- `src/lib/ranking/feed-ranking.ts` + tests
- `src/providers/trustbook-provider.tsx`
- `src/components/feed/*`, `src/components/posts/*`
- `src/lib/mock/posts.ts`, `src/lib/stories/helpers.ts`
