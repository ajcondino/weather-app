# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Expo version note

This project runs Expo SDK 54, which is newer than your training data. Before writing any Expo-related code, consult https://docs.expo.dev/versions/v54.0.0/ rather than relying on prior knowledge — APIs may have changed.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`, `.npmrc`). Don't use npm/yarn.

- `pnpm start` — start the Expo dev server
- `pnpm ios` / `pnpm android` — run native dev builds (this project uses `expo-dev-client`, not Expo Go)
- `pnpm web` — run in browser
- `pnpm lint` — `expo lint` (flat ESLint config)
- `pnpm format` — Prettier write
- `pnpm test` — Jest in watch mode
- `pnpm test:ci` — Jest single run, non-watch (what CI uses)
- `pnpm tsc --noEmit` — typecheck (CI runs this separately from lint)

Run a single test file: `pnpm jest src/utils/__tests__/temperature.test.ts`. Test files live in `__tests__` directories next to the code they cover.

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test:ci, in that order, on push/PR to `main`. Husky + lint-staged run ESLint/Prettier on staged files at commit time.

## Architecture

### Routing & auth gating

File-based routing via `expo-router`, entry point `expo-router/entry`, app code rooted at `src/app`. Route groups encode the auth boundary:

- `src/app/_layout.tsx` — root: wraps everything in `ClerkProvider` (auth) and `SafeAreaProvider`. No routing logic here.
- `src/app/(auth)/_layout.tsx` — sign-in/sign-up stack. Redirects to `/` if already signed in.
- `src/app/(private)/_layout.tsx` — the entire authenticated app. Redirects to `/(auth)/sign-in` if not signed in. This is also where `QueryClientProvider` is mounted and where the three persisted Zustand stores (`savedLocationsStore`, `unitsStore`, `notificationsStore`) get their `load()` kicked off on mount.

Screens under `(private)`: `index` (home pager), `location` (search/add locations), `weather-preview` (modal), `settings` (modal).

### Data flow: weather

- `src/api/http.ts` — thin fetch wrapper (`request<T>`) targeting Open-Meteo. No auth/interceptors; just query param serialization and non-2xx → throw.
- `src/api/weather.ts` — calls Open-Meteo `/forecast`, maps WMO weather codes to the app's own `WeatherCondition` union, and reshapes the response into `CurrentWeather`/`HourlyForecast`/`DailyForecast` (see `src/api/types.ts`). This mapping is the single place that knows about Open-Meteo's response shape — UI code never sees raw API fields.
- `src/api/geocoding.ts` — separate Open-Meteo geocoding host, free-text → `Location[]`.
- `src/hooks/useWeather.ts` — wraps `getCurrentWeather` in a `useQuery` (10 min staleTime). Query keys are exported as `weatherKeys` and reused elsewhere (e.g. `index.tsx` reads cached data via `queryClient.getQueryData(weatherKeys.current(...))` to schedule notifications without re-fetching).
- `src/lib/queryClient.ts` — single app-wide `QueryClient`; per-query overrides live in the hooks, not here.
- `src/hooks/useLocation.ts` — device GPS location via `expo-location`, independent of the saved-locations store (used for "current location" detection, not persistence).

### State: Zustand stores (`src/store/`)

Each store follows the same pattern: in-memory Zustand state + an explicit `load()` that hydrates from `AsyncStorage` (via `src/utils/storage.ts`'s `getItem`/`setItem`), called once from `(private)/_layout.tsx`. Mutations write through to storage synchronously after `set()`. Nothing auto-persists — if you add a new persisted store, wire its `load()` into the private layout's mount effect.

- `savedLocationsStore` — the user's saved location list (max 10), drives the home screen pager.
- `unitsStore` — C/F preference.
- `notificationsStore` — weather-alert subscriptions (max 2 locations), owns the `expo-notifications` handler setup.
- `pagerStore` — ephemeral, not persisted; used to imperatively jump the home `PagerView` to a page (e.g. after adding a location) without prop-drilling a ref.
- `searchStore` — location search UI state.

Locations are keyed by `lat,lon` as **strings** (not numeric comparison) throughout the saved-locations and notifications stores — see the comment in `savedLocationsStore.ts` for why (route params arrive as strings; avoids float precision mismatches).

### Theming (`src/themes/`)

Sky backgrounds are generated, not asset-based: `skyGradient.ts` defines a hand-picked clear-sky gradient for day/night and blends it toward a gray target based on each condition's `overcastAmount` (from `weatherVisuals.ts`). Adding a new `WeatherCondition` means updating `weatherVisuals.ts`/`weatherIcons.ts`/`weatherDescriptions.ts` together — they're keyed by the same union type from `src/api/types.ts`.

### Path alias

`#/*` maps to `src/*` (see `tsconfig.json`). Use it instead of relative `../../` imports.

### Auth

Clerk (`@clerk/expo`) handles auth end-to-end; token cache is `expo-secure-store`-backed via `@clerk/expo/token-cache`. Requires `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in the environment (`.env.development.local` locally) — the root layout throws immediately if it's missing.

## IMPORTANT

- **YOU MUST run `npm test` before reporting any task complete. No exceptions.**
- **When adding an Expo/native module, YOU MUST use `pnpm expo install <package>` (not `pnpm add`). It resolves the version aligned with the installed Expo SDK. Run `npx expo install --check` any time you suspect a version drift.**
