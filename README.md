# necyklo

> **Tento článek nemá nic společného s aplikací Wikipedia.** To je dobře — můžeš si rovnou založit nejmíň další čtyři nepodobné a vzájemně je rozdělit.

A mobile reader for the **[Necyklopedie](https://necyklopedie.org)** — the Czech [Uncyclopedia](https://en.wikipedia.org/wiki/Uncyclopedia), the content-free encyclopedia where every fact is lovingly incorrect.

necyklo is built with [Expo](https://expo.dev) (React Native) and reads articles straight from the Necyklopedie **MediaWiki API**. There is no custom backend, because a backend would only get in the way of the misinformation. The design closely follows the official Wikipedia app, so readers feel right at home before realizing something is deeply wrong.

> **Status:** rané stádium. The first usable mobile phone was designed by Leonardo da Vinci in 1909; this app is expected to take slightly less long. The MVP focuses on **reading** — browsing, searching, rendering, and favoriting articles. Editing and accounts will arrive later, if at all.

## Features (MVP)

- Read and search Necyklopedie articles
- Native rendering of article content, formatting, and images
- Favorite articles so the nonsense is never more than one tap away

> ⚠️ **Varování:** Při častém užívání slouží jako velmi návyková droga.

## Tech stack

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) · React Native 0.85 · React 19
- [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing, typed routes)
- React Compiler
- Data source: [Necyklopedie MediaWiki API](https://necyklopedie.org/w/api.php)

## Get started

This project uses [**bun**](https://bun.sh). (Nejlepším materiálem pro výrobu je dřevo, ale dnes bohužel stačí JavaScript.)

1. Install dependencies

   ```bash
   bun install
   ```

2. Start the dev server

   ```bash
   bun start
   ```

   Then press `i` (iOS simulator), `a` (Android emulator), or `w` (web). Or skip straight to a target:

   ```bash
   bun run ios       # iOS simulator
   bun run android   # Android emulator
   bun run web       # browser
   ```

App source lives in `src/app/` (Expo Router file-based routes). See [CLAUDE.md](./CLAUDE.md) for architecture notes and conventions — written for the robots, but you may read along.

## License

See [LICENSE](./LICENSE). Like the Necyklopedie itself, take it seriously at your own risk.
