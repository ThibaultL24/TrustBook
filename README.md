# Trustbook

**Trustbook is a Circles-native feed where content discovery is ranked by explicit trust and backed by CRC actions.**

Live demo: _[add Vercel URL after deploy]_

Built for [Circles Garage](https://garage.aboutcircles.com/) — a mobile-first Circles/Gnosis mini-app on Next.js + TypeScript + Tailwind.

## Hackathon submission summary

Trustbook turns the Circles trust graph into a social discovery layer. Users see recommendations, needs, offers, and events ranked through **direct trust, mutual trust, common paths, shared communities, CRC boosts**, and optional **Intuition claims** — every card explains why it appears and leads to a CRC action in one tap.

## Why Circles?

Trustbook depends on Circles because trust is not treated as a cosmetic social follow. In Circles, trust is an economic primitive: it affects whose CRC can be accepted, routed, and made useful across the network. This lets Trustbook rank content through explicit trust relationships, shared communities, common trust paths, and CRC-backed actions instead of opaque engagement metrics.

## Where Intuition fits

[Intuition](https://intuition.systems/) can complement Trustbook as a contextual claims and reputation layer. Circles answers the economic question: “Whose CRC do I accept and through which trust graph can value flow?” Intuition can answer the contextual question: “What claims, attestations, recommendations or reputation signals exist about this person, post, project or community?” In Trustbook, Intuition remains **optional and explanatory** — it enriches ranking and explanations but does not replace Circles trust mechanics.

## Features

- Trust-aware explainable feed + signal breakdown
- Demo tour, pitch page, presenter demo script (`/demo`)
- Integration status dashboard (`/status`)
- Leaderboard (authors, communities, impact posts)
- Trust path visualization (demo-level)
- Mock / miniapp / readonly modes + CirclesAdapter
- Optional Intuition claims layer (mock, capped score weight)
- Judging mode with reset demo + quick nav
- CRC references: `trustbook:tip:{postId}`, `trustbook:boost:{postId}`

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing |
| `/feed` | Trust-aware feed |
| `/pitch` | Judge pitch |
| `/leaderboard` | Rankings |
| `/demo` | Presenter checklist |
| `/status` | Integration TODO dashboard |
| `/profile/[address]` | Profile |
| `/community/[id]` | Community |

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Judging mode

```bash
NEXT_PUBLIC_TRUSTBOOK_JUDGING_MODE=true npm run dev
```

Shows hackathon banner, quick links (Pitch, Feed, Leaderboard, Demo, Status, Tour), and **Reset demo** to replay the scenario.

## Integration modes

| Mode | Env | Purpose |
|------|-----|---------|
| `mock` | `NEXT_PUBLIC_TRUSTBOOK_MODE=mock` | Default — full local demo |
| `miniapp` | `=miniapp` | Circles iframe + host bridge |
| `readonly` | `=readonly` | Public reads, no signing |
| `wallet` | `=wallet` | MetaMask (or injected) on **Gnosis** + `@aboutcircles/sdk` |

Patterns ported from [OpenCircles](/root/OpenCircles) (History Guessr): `@aboutcircles/miniapp-sdk` wallet subscription, `getProfileView` reads, session sign-in, and `npm run test:circles`.

### Wallet mode (real Circles)

1. Copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_TRUSTBOOK_MODE=wallet`
2. Optional: `NEXT_PUBLIC_CIRCLES_RPC_URL` (defaults to Gnosis public RPC)
3. `npm run dev` → connect wallet on the landing page (must be on Gnosis Chain, id `100`)
4. Your Circles **Safe avatar** is derived from your EOA; you must already be registered on Circles
5. Tips/boosts use `transfer.advanced` with annotated `txData` (`trustbook:tip:{postId}` / `trustbook:boost:{postId}`)
6. Trust uses `avatar.trust.add` on-chain

Live demo posts use **History Guessr** Circles addresses (same as OpenCircles):

| Rôle | Adresse |
|------|---------|
| Safe Lenormand (CRC, tips live) | `0xD55a912aF5639a6769AE5c1894C0c7BFB5Bf539E` |
| Groupe HIST | `0x5AC1C8b6c9BCB8D1a8Ef4fa5484738877EfA763E` |
| Gnosis Group | `0xc19bc204eb1c1d5b3fe500e5e5dfabab625f286c` |

Profile: `/profile/0xD55a912aF5639a6769AE5c1894C0c7BFB5Bf539E` — tip the post **« Tip live — Safe Lenormand »** on `/feed` after connecting the same wallet on Gnosis. Mock-only authors still show a clear error if you tip fictional addresses.

## Hackathon demo script

1. Open `/pitch`
2. Click **Open app** → `/feed`
3. Demo tour (auto or header button)
4. Expand **Why am I seeing this?** + breakdown
5. Tip or boost → header stats update
6. Trust author (read warning)
7. `/leaderboard` → show CRC impact
8. `/status` → production transparency

## Deployment checklist

1. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
2. Optional: `NEXT_PUBLIC_TRUSTBOOK_JUDGING_MODE=true` for live demo
3. `npm run build` && deploy to Vercel
4. Submit to [Circles Garage](https://garage.aboutcircles.com/) with pitch + live link
5. For store listing: align `public/trustbook-miniapp.config.json` with [mini-app docs](https://miniapps.aboutcircles.com/developers)

## Security notes

- No private keys in frontend or env
- Signing via Circles/Gnosis host SDK only
- Trust requires explicit confirmation
- Mock mode is not production data

## Known limitations

- Trust paths are demo BFS, not Circles routing
- Circles/Intuition APIs use placeholders until official endpoints wired
- Post/trust data is local mock state (reset via judging mode)

## Production roadmap

See `/status` in-app or `src/lib/status/integration-status.ts`

## Documentation links

**Circles / Gnosis**

- [Circles Garage](https://garage.aboutcircles.com/)
- [Mini Apps developers](https://miniapps.aboutcircles.com/developers)
- [CirclesMiniapps repo](https://github.com/aboutcircles/CirclesMiniapps)
- [@aboutcircles/sdk](https://www.npmjs.com/package/@aboutcircles/sdk)
- [circles_searchProfiles RPC](https://aboutcircles.github.io/CirclesTools/rpcQueryView.html?method=circles_searchProfiles)

**Intuition**

- [Docs](https://docs.intuition.systems/)
- [App](https://app.intuition.systems/)
- [GitHub](https://github.com/0xIntuition)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |
# TrustBook
