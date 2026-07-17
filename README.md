# Weather App

A React Native weather app built with Expo. Search for locations, save up to 10 of them, swipe between their current conditions, hourly/daily forecasts, and subscribe to weather alerts for up to 2 saved locations.

## Screenshots

<!-- Add screenshots here, e.g.: -->
<!-- <p align="center">
  <img src=".github/screenshots/home.png" width="250" />
  <img src=".github/screenshots/search.png" width="250" />
  <img src=".github/screenshots/settings.png" width="250" />
</p> -->

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/installation) — this repo uses pnpm exclusively (see `pnpm-workspace.yaml`/`.npmrc`); don't use npm or yarn
- A Clerk account with a publishable key ([dashboard](https://dashboard.clerk.com/))
<!-- - **Note:** this project uses [`expo-dev-client`](https://docs.expo.dev/versions/v54.0.0/sdk/dev-client/), not Expo Go — Expo Go can't load it because of the native Clerk/notifications/Sentry modules. Instead, either:
  - build a [development build](https://docs.expo.dev/versions/v54.0.0/develop/development-builds/introduction/) locally with `pnpm ios` / `pnpm android` (requires Xcode / Android Studio), or
  - install a dev build via [EAS Build](https://docs.expo.dev/versions/v54.0.0/develop/development-builds/create-a-build/) if you don't have native tooling set up -->

## Environment variables

Copy `.env.example` to `.env.development.local` and fill in the values:

```bash
cp .env.example .env.development.local
```

| Variable                            | Required | Description                                                               |
| ----------------------------------- | -------- | ------------------------------------------------------------------------- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk publishable key. The app throws on startup if this is missing.      |
| `EXPO_PUBLIC_SENTRY_DSN`            | No       | Sentry DSN for error reporting. Safe to leave blank in local development. |

## Setup

```bash
# 1. Clone
git clone git@github.com:ajcondino/weather-app.git
cd weather-app

# 2. Install dependencies
pnpm install

# 3. Set up environment variables (see above)
cp .env.example .env.development.local

# 4. Run
pnpm ios       # or: pnpm android
pnpm start     # start the Expo dev server for an existing dev build
pnpm web       # run in the browser
```

Other useful commands:

- `pnpm lint` — ESLint (flat config via `expo lint`)
- `pnpm format` — Prettier write
- `pnpm test` — Jest in watch mode
- `pnpm test:ci` — Jest single run (what CI uses)
- `pnpm tsc --noEmit` — typecheck

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test:ci on push/PR to `main`. Husky + lint-staged run ESLint/Prettier on staged files at commit time.

## Tech stack

- **[Expo](https://docs.expo.dev/versions/v54.0.0/) (SDK 54) + [Expo Router](https://docs.expo.dev/versions/v54.0.0/router/introduction/)** — file-based routing, native builds via `expo-dev-client`
- **[TanStack React Query](https://tanstack.com/query/latest)** — data fetching/caching for weather requests
- **[Zustand](https://zustand.docs.pmnd.rs/)** — persisted app state (saved locations, units, notification subscriptions) backed by `AsyncStorage`
- **[Clerk](https://clerk.com/docs)** (`@clerk/expo`) — authentication, token cache backed by `expo-secure-store`
- **[Open-Meteo](https://open-meteo.com/)** — weather forecast and geocoding APIs (no API key required)
- **[Sentry](https://docs.sentry.io/platforms/react-native/)** — error monitoring
- **TypeScript, ESLint, Prettier, Jest** — tooling

## Folder structure

```
src/
  api/          Open-Meteo fetch wrapper, weather/geocoding calls, response-shape mapping
  app/          expo-router screens (route groups: (auth), (private))
  components/   Shared UI components
  hooks/        useWeather (React Query), useLocation (device GPS), etc.
  lib/          App-wide singletons (QueryClient)
  store/        Zustand stores: savedLocationsStore, unitsStore, notificationsStore, pagerStore, searchStore
  styles/       Shared style definitions
  themes/       Weather-condition-driven visuals: sky gradients, icons, descriptions
  utils/        Shared helpers (AsyncStorage wrapper, temperature conversion, etc.)
```

Routing structure:

- `src/app/_layout.tsx` — root: `ClerkProvider` + `SafeAreaProvider`, no routing logic
- `src/app/(auth)/` — sign-in/sign-up stack, redirects to `/` if already signed in
- `src/app/(private)/` — the authenticated app; redirects to sign-in if signed out. Mounts `QueryClientProvider` and kicks off `load()` for the three persisted Zustand stores.

See `CLAUDE.md` for a deeper architecture writeup (data flow, state, theming, path aliases).

## Contributing

1. Create a branch off `main` for your change.
2. Use `#/*` path aliases instead of relative `../../` imports (see `tsconfig.json`).
3. Run `pnpm lint`, `pnpm tsc --noEmit`, and `pnpm test:ci` before opening a PR — CI runs the same three checks in that order.
4. Husky + lint-staged auto-fix staged files on commit; don't bypass hooks with `--no-verify`.
5. Keep PRs focused — open a PR against `main` and describe what changed and why.
