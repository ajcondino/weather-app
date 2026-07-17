# Feature: i18n Infrastructure (i18next + expo-localization)

## Intent

The app has a working i18next + react-i18next + expo-localization setup: every user-facing string renders through a translation function backed by an `en` locale resource file, the device's language is detected automatically at startup, and adding a second language later means dropping in one new JSON file rather than touching component code.

## Context

- **Problem statement:** Every user-facing string in the app is an English string literal embedded directly in JSX, `Alert.alert()` calls, and data maps. No localization library (`i18next`, `react-intl`, `expo-localization`) is installed or configured (verified: no matches for these packages in `package.json` or `pnpm-lock.yaml`).
- **Current code:** String literals are scattered across:
  - Auth screens: `src/app/(auth)/sign-in.tsx`, `src/app/(auth)/sign-up.tsx` (titles, labels, placeholders, button text, `Alert.alert` messages).
  - `src/app/(private)/settings.tsx` (section titles, row labels, footers, empty-state text, unit names).
  - `src/app/(private)/location.tsx` (search bar placeholder, "Learn more..." paragraph).
  - `src/app/(private)/weather-preview.tsx` (Cancel/Add buttons).
  - `src/components/NetworkIndicator.tsx`, `src/components/ErrorFallback.tsx` (status/error text).
  - `src/components/HourlyForecastCard.tsx`, `src/components/DailyForecastCard.tsx` (card titles passed to `CardHeader`).
  - `src/themes/weatherDescriptions.ts` — `WEATHER_DESCRIPTIONS: Record<WeatherCondition, string>`, a static English-only map consumed by `src/components/WeatherHeader.tsx` and `src/components/SavedLocationCard.tsx`.
  - `src/utils/notifications.ts` — notification `title`/`body` built with template literals (`scheduleWeatherAlerts`, `getAlertBody`), scheduled outside any component tree.
  - `src/store/notificationsStore.ts` — `Alert.alert()` copy in `subscribeLocation`, also outside the component tree.
- **User impact:** No visible behavior change for current (English) users. This is foundational plumbing: it makes every subsequent string change go through a translation key instead of a literal, and lets a future PR add a second locale by adding one resource file.
- **Dependencies:**
  - New packages: `i18next`, `react-i18next`, `expo-localization`.
  - `expo-localization` is a config-plugin-free native module already compatible with Expo SDK 54; no `app.json` plugin entry is required for locale _detection_ (see Constraints for what `app.json` localization fields do and don't cover).
  - No existing i18n-adjacent code to migrate from; this is a greenfield setup within the app.

## Data Model

- **Translation resource shape** — a single default namespace (`translation`) per locale, nested by feature area, e.g.:

  ```json
  {
    "auth": {
      "signIn": {
        "title": "Howdy!",
        "subtitle": "Sign in to your account",
        "emailLabel": "Email",
        "...": "..."
      },
      "signUp": { "...": "..." }
    },
    "settings": { "...": "..." },
    "location": { "...": "..." },
    "weatherPreview": { "cancel": "Cancel", "add": "Add" },
    "network": { "offline": "No Internet Connection" },
    "errors": { "genericTitle": "Something went wrong", "tryAgain": "Try again" },
    "weather": {
      "conditions": {
        "clear": "Clear",
        "partly_cloudy": "Partly Cloudy",
        "overcast": "Cloudy",
        "fog": "Foggy",
        "drizzle": "Drizzle",
        "rain": "Rain",
        "snow": "Snow",
        "thunderstorm": "Thunderstorms"
      },
      "hourlyForecastTitle": "Hourly Forecast",
      "dailyForecastTitle": "{{count}}-Day Forecast"
    },
    "notifications": {
      "alertTitle": "Weather Alert for {{location}}",
      "precipitationChance": "{{percent}}% chance of precipitation",
      "precipitationAmount": "{{amount}}mm expected",
      "checkForecast": "Check the forecast for details",
      "subscriptionLimitTitle": "Subscription limit reached",
      "subscriptionLimitBody": "You can only subscribe to {{max}} locations for weather alerts. Unsubscribe on to add another."
    }
  }
  ```

  One JSON module per locale under `src/i18n/resources/<locale>/translation.json`; `en` is the only locale shipped in this change. The `weather.conditions` keys are the exact `WeatherCondition` union members from `src/api/types.ts`, so the map stays structurally tied to that type (see Interfaces section).

- **TypeScript augmentation:** `src/i18n/types.ts` augments `i18next`'s `CustomTypeOptions` with the shape of `en/translation.json` as the `resources` type, so `t('weather.conditions.clear')`-style keys are typed and typo'd keys fail `tsc`.
- No persistence or database changes. No new Zustand store — detected/selected language is not currently exposed as user-configurable state (see Constraints); it is read once from `expo-localization` at i18n init time.

## Interfaces / API

- **`src/i18n/index.ts`** (default export: initialized `i18next` instance)
  - `detectDeviceLanguage(): string` — reads `Localization.getLocales()` (from `expo-localization`), takes `[0]?.languageCode`, returns it if it is a key of the configured `resources` object, otherwise returns `'en'`.
  - Calls `i18next.use(initReactI18next).init({ resources, lng: detectDeviceLanguage(), fallbackLng: 'en', interpolation: { escapeValue: false }, compatibilityJSON: 'v4' })` synchronously at import time (no async namespace loading — resources are bundled JSON, not fetched).
  - Exported as the default export so both `useTranslation()` (inside components) and direct `i18n.t(key, options)` calls (outside components, e.g. `src/utils/notifications.ts`) work off the same singleton.
- **`src/i18n/types.ts`** — `declare module 'i18next' { interface CustomTypeOptions { defaultNS: 'translation'; resources: { translation: typeof en } } }`, importing the `en` JSON as a type-only value.
- **`src/themes/weatherDescriptions.ts`** — the `WEATHER_DESCRIPTIONS` record is deleted entirely; both consumers (`WeatherHeader.tsx`, `SavedLocationCard.tsx`) call `t(`weather.conditions.${weather.condition}`)` directly, since the JSON keys already match `WeatherCondition` values and no extra indirection is needed. `weatherVisuals.ts`/`weatherIcons.ts` are untouched — they carry no display strings today (icon components and gradient math only).
- **`src/utils/notifications.ts`** — `getAlertBody` and `scheduleWeatherAlerts` import the `i18n` singleton from `src/i18n` and call `i18n.t('notifications.xxx', { location: ..., percent: ..., amount: ..., max: ... })` instead of building template literals. Function signatures are unchanged.
- **`src/store/notificationsStore.ts`** — the `Alert.alert(...)` call in `subscribeLocation` imports `i18n` from `src/i18n` and calls `i18n.t('notifications.subscriptionLimitTitle')` / `i18n.t('notifications.subscriptionLimitBody', { max: MAX_SUBSCRIPTIONS })`.
- **Screen/component changes** — every file listed in Context calls `const { t } = useTranslation()` and replaces literal JSX text, `placeholder`, and `Alert.alert` arguments with `t('namespace.key')` / `t('namespace.key', { interpolationVar })`. No prop signatures change (e.g. `CardHeader`'s `title: string` prop is unchanged — callers now pass a translated string into it).
- **Error behavior:** i18next's default behavior for a missing key (returns the key itself) and missing locale (`fallbackLng: 'en'`) is kept as-is — no custom missing-key handler is added in this change.

## Files Created

| File                                     | Purpose                                                                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/i18n/index.ts`                      | i18next + react-i18next init, `expo-localization` device-locale detection, exports the singleton `i18n` instance used both via `useTranslation()` and direct `i18n.t()` calls outside components. |
| `src/i18n/resources/en/translation.json` | Base (and only, for this change) locale resource file — the single source of truth for all English UI strings.                                                                                    |
| `src/i18n/types.ts`                      | `i18next` `CustomTypeOptions` module augmentation so `t()` calls are key-checked against `en/translation.json` at compile time.                                                                   |
| `src/i18n/__tests__/index.test.ts`       | Verifies i18next initializes with the `en` resources, resolves a known key, and falls back to `en` for an unsupported/undetected device locale.                                                   |

## Files Modified

| File                                    | Change                                                                                                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                          | Add `i18next`, `react-i18next`, `expo-localization` to `dependencies`.                                                                                                                                    |
| `src/app/_layout.tsx`                   | Add a top-level `import '#/i18n'` (side-effecting init) so the i18next singleton is configured before any screen renders.                                                                                 |
| `src/app/(auth)/sign-in.tsx`            | Replace literal titles/labels/placeholders/button text/`Alert.alert` copy with `t(...)` calls via `useTranslation()`.                                                                                     |
| `src/app/(auth)/sign-up.tsx`            | Same as above, including the two-step (email/code) flow's strings.                                                                                                                                        |
| `src/app/(private)/settings.tsx`        | Replace section titles, row labels, footers, empty-state text, "Celsius"/"Fahrenheit" unit names, and the "Sign out" button with `t(...)` calls.                                                          |
| `src/app/(private)/location.tsx`        | Replace the search-bar `placeholder` and the "Learn more..." paragraph with `t(...)`.                                                                                                                     |
| `src/app/(private)/weather-preview.tsx` | Replace "Cancel"/"Add" button text with `t(...)`.                                                                                                                                                         |
| `src/components/NetworkIndicator.tsx`   | Replace both "No Internet Connection" strings with `t(...)`.                                                                                                                                              |
| `src/components/ErrorFallback.tsx`      | Replace "Something went wrong"/"Try again" with `t(...)`.                                                                                                                                                 |
| `src/components/HourlyForecastCard.tsx` | Replace the literal `"Hourly Forecast"` passed to `CardHeader` with `t('weather.hourlyForecastTitle')`.                                                                                                   |
| `src/components/DailyForecastCard.tsx`  | Replace the template-literal `` `${days.length}-Day Forecast` `` with `t('weather.dailyForecastTitle', { count: days.length })`.                                                                          |
| `src/components/WeatherHeader.tsx`      | Replace `WEATHER_DESCRIPTIONS[weather.condition]` lookup with `t(`weather.conditions.${weather.condition}`)`.                                                                                             |
| `src/components/SavedLocationCard.tsx`  | Same replacement as `WeatherHeader.tsx` for its `WEATHER_DESCRIPTIONS[weather.condition]` lookup.                                                                                                         |
| `src/themes/weatherDescriptions.ts`     | Delete the file — both consumers are migrated to call `t()` directly and no other module imports `WEATHER_DESCRIPTIONS` (confirmed via repo-wide grep; re-confirm during implementation before deleting). |
| `src/utils/notifications.ts`            | Replace template-literal `title`/`body` construction with `i18n.t(...)` calls (direct singleton import, not `useTranslation`, since this runs outside the component tree).                                |
| `src/store/notificationsStore.ts`       | Replace the `Alert.alert('Subscription limit reached', ...)` literals with `i18n.t(...)` calls.                                                                                                           |

## Implementation Steps

1. Add `i18next`, `react-i18next`, `expo-localization` via `pnpm add` (respect the workspace's pinned-version conventions already visible in `package.json`, i.e. use whatever `pnpm add` resolves against the existing Expo SDK 54 dependency set — do not hand-pick versions from memory).
2. Author `src/i18n/resources/en/translation.json` with the full key set enumerated in Data Model, sourced from the literal strings inventoried in Context (copy the exact current English copy — this change must not alter visible text, only its source).
3. Write `src/i18n/index.ts`: `detectDeviceLanguage()` using `expo-localization`'s `getLocales()`, then `i18next.use(initReactI18next).init(...)` as described in Interfaces.
4. Write `src/i18n/types.ts` module augmentation.
5. Add the `import '#/i18n'` side effect to `src/app/_layout.tsx`, placed before the `ClerkProvider`/`SafeAreaProvider` tree so translations are ready before the first screen mounts.
6. Migrate `src/themes/weatherDescriptions.ts`'s two consumers (`WeatherHeader.tsx`, `SavedLocationCard.tsx`) to call `t()` directly; delete the file once both are migrated (re-grep the repo immediately before deleting to catch any consumer added since this spec was written).
7. Migrate the two non-component call sites first, since they establish the "use the singleton directly" pattern the rest of the migration follows: `src/utils/notifications.ts`, then `src/store/notificationsStore.ts`.
8. Migrate component/screen files one at a time, in this order (auth first, since it's the smallest/most isolated surface, then the rest): `sign-in.tsx` → `sign-up.tsx` → `NetworkIndicator.tsx` → `ErrorFallback.tsx` → `HourlyForecastCard.tsx` / `DailyForecastCard.tsx` → `weather-preview.tsx` → `location.tsx` → `settings.tsx`.
9. For each migrated file, update or add a matching test under its `__tests__` directory only where tests already exist (`src/components/__tests__/WeatherCard.test.tsx` mocks `HourlyForecastCard`/`DailyForecastCard` with literal "Hourly"/"Daily" text — confirm this mock is unaffected since it doesn't render the real components) — do not introduce new test files for screens that have no existing test coverage; that is out of scope for this change.
10. Add `src/i18n/__tests__/index.test.ts` covering: (a) `t('weatherPreview.cancel')` resolves to `"Cancel"` when initialized with a supported locale, (b) `detectDeviceLanguage()` returns `'en'` when `expo-localization`'s `getLocales()` is mocked to return an unsupported/unrecognized language code.
11. Run the full verification suite (Acceptance Criteria commands) and manually smoke-check `pnpm ios` or `pnpm android` to confirm all migrated screens render identical English text to before the change.

## Style & Conventions

- Use the `#/*` path alias (`tsconfig.json`) for all new intra-`src` imports, e.g. `#/i18n`, matching every existing cross-module import in the repo.
- Follow the repo's existing pattern of co-located `__tests__` directories (`src/i18n/__tests__/index.test.ts`), not a top-level `__tests__` tree.
- No comments explaining _what_ the code does, per repo-wide convention; a short comment is fine only where the "why" is non-obvious (e.g. why `notifications.ts` uses `i18n.t()` directly instead of `useTranslation()`).
- Keep `resources` bundled as static JSON imports (no dynamic/async namespace loading, no remote translation fetching) — this matches the proposed fix's "start with `en.json` as the base locale" framing and keeps the setup as simple as the current low-priority scope warrants.
- Don't introduce a namespace-per-feature i18next config (multiple `ns` entries) — a single `translation` namespace with nested keys is sufficient for the current string count and matches "smallest coherent design" guidance; revisit only if key count or team size grows enough to need per-feature ownership.

## Acceptance Criteria

- [ ] `i18next`, `react-i18next`, `expo-localization` appear in `package.json` `dependencies` and are installed via `pnpm install`.
- [ ] No component, hook, store, or util file under `src/` contains a hardcoded user-facing English string literal that was identified in Context — verified by re-running the inventory greps (`grep -rn "placeholder=\"" src`, the JSX-text regex sweep, `grep -rn "Alert.alert" src`) and confirming zero remaining literal matches outside `src/i18n/resources/en/translation.json` and test files.
- [ ] Device language detection works: `detectDeviceLanguage()` returns `'en'` for any device locale not present in `resources`, and returns the matching key when the device locale is a supported one (currently only `en` is supported, so this reduces to "always returns `'en'` today" — the test still asserts the fallback branch explicitly so it's exercised once a second locale is added).
- [ ] `t()` calls are type-checked against `en/translation.json` via the `CustomTypeOptions` augmentation — introducing a typo'd key in a throwaway edit during review causes `pnpm tsc --noEmit` to fail (verify once, then revert the typo).
- [ ] `pnpm lint` passes.
- [ ] `pnpm tsc --noEmit` passes.
- [ ] `pnpm test:ci` passes, including the new `src/i18n/__tests__/index.test.ts` and the unmodified `src/components/__tests__/WeatherCard.test.tsx`.
- [ ] Manual smoke check: app launches (`pnpm ios`/`pnpm android`/`pnpm web`) and every migrated screen (sign-in, sign-up, home/weather header, hourly/daily cards, location search, weather-preview modal, settings, network-offline banner, error fallback) renders the exact same English text as before this change.

## Constraints

- **Non-goal: in-app language switching UI.** This change only auto-detects the device locale; it does not add a settings-screen language picker, does not persist a user-chosen language override, and does not add a Zustand store for locale state. That is a natural follow-up once a second locale exists, not part of this spec.
- **Non-goal: additional locales.** Only `en/translation.json` is authored here, per the issue's explicit scope ("Start with en.json as the base locale"). Adding e.g. `es/translation.json` is future work enabled by, but not included in, this change.
- **Non-goal: date/number/currency locale formatting.** `src/utils/temperature.ts`'s `formatTemp` and any date formatting in forecast cards are unchanged — this spec is scoped to string translation via i18next, not `Intl`-based locale-aware formatting. Revisit separately if a future locale needs non-Western number/date conventions.
- **Native permission strings are out of scope.** `app.json`'s `expo-location` plugin config (`locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."`) is a build-time native manifest string (iOS `Info.plist` / Android manifest), not a JS runtime string — it isn't reachable through i18next and would need a separate per-platform localization mechanism (e.g. `.strings`/`.xml` locale variants) if ever localized. Not addressed here.
- **Visible-behavior parity is required.** Every migrated string's English text must match the current literal exactly (including punctuation/casing) — this is a refactor of string _source_, not a copy rewrite. Any copy change discovered as "nicer wording" during migration should be filed as a separate follow-up, not folded into this change.
- **`WEATHER_DESCRIPTIONS` deletion.** Confirmed consumers as of this spec are `WeatherHeader.tsx` and `SavedLocationCard.tsx` only; re-grep immediately before deleting `src/themes/weatherDescriptions.ts` in case a new consumer was added since. If one exists, migrate it too rather than leaving a stray import of a deleted module.
- Per project instructions, run the repository's test command before reporting this work complete.
