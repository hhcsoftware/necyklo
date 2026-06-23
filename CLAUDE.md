# CLAUDE.md

This file provides guidance to Claude Code or similar coding agents when working with code in this repository.

@AGENTS.md

## Project

**necyklo** is an Expo (iOS/Android) reader app for the [Necyklopedie](https://necyklopedie.org) — the Czech Uncyclopedia, a MediaWiki-powered satirical wiki. It consumes the site's existing **MediaWiki API**; there is no custom backend.

The app intentionally **mimics the official Wikipedia mobile app's design language and UX patterns** (article layout, search, reading experience, navigation) so it feels familiar. When in doubt about a UI/UX decision, match what the Wikipedia app does.

**MVP scope: reading only** — fetching/rendering articles, formatting, images, search, and favoriting. Editing, auth, and contributions are explicitly out of scope for now; don't build toward them yet.

## Commands

Package manager is **bun** (`bun.lock`). Use `bun`, not npm/yarn.

```bash
bun install            # install deps
bun start              # Expo dev server (Metro) — press i / a / w to open a target
bun run ios            # open iOS simulator
bun run android        # open Android emulator
bun run web            # run in browser
bun run lint           # expo lint (ESLint); first run scaffolds the ESLint config
```

There is **no test runner configured yet**. If you add tests, wire up the script and document how to run a single test here.

## Architecture

- **Expo SDK 56** (`react-native` 0.85, React 19.2). Before writing any native/Expo code, read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ — APIs differ from older SDKs (see AGENTS.md).
- **expo-router** with file-based routing. Routes live in **`src/app/`** (note the `src/` prefix — not a top-level `app/`). `src/app/_layout.tsx` is the root layout; add screens as files/folders under `src/app/`.
- **Typed routes** are enabled (`experiments.typedRoutes`), so route strings are type-checked — keep `Href` usage type-safe.
- **React Compiler** is enabled (`experiments.reactCompiler`). Don't hand-add `useMemo`/`useCallback` for micro-optimizations the compiler already handles; write idiomatic components.
- **Path aliases** (`tsconfig.json`): `@/*` → `src/*`, `@/assets/*` → `assets/*`. Import via `@/...` rather than long relative paths.
- TypeScript is **strict**. `scheme` for deep links is `necyklo`.

## MediaWiki API integration

- **Base endpoint:** `https://necyklopedie.org/w/api.php` — use the **apex host** (`necyklopedie.org`). The `www.` host **301-redirects**; some HTTP clients drop the query string or fail across the redirect, so always hit the apex directly.
- Backend is **MediaWiki 1.39** (Czech, `format=json`). Standard actions apply: `action=parse` for rendered article HTML/sections, `action=query` with `list=search` / `prop=extracts|pageimages|info` for search, summaries, and thumbnails. Prefer `formatversion=2` and request only the props you render.
- Article HTML comes back as a MediaWiki HTML blob; rendering it natively (rewriting internal `/wiki/...` links to in-app navigation, resolving images, stripping edit affordances) is the core technical problem of the reader.
- Human-readable article URLs are `https://necyklopedie.org/wiki/<Title>`. Article **images are hosted on `images.uncyclomedia.co`** (a different origin than the API).
- Send a descriptive `User-Agent` / `Api-User-Agent` header (MediaWiki etiquette) on every request.

When adding API code, keep the client layer (endpoints, query building, response types) separate from UI components.
