# E2E Testing Strategy — Weather App

## Context

The app currently has zero E2E coverage. Unit tests (Jest + `jest-expo`) exist for pure functions and Zustand store logic, plus one shallow component test with all children mocked — but **no test ever renders a real screen, navigates between routes, or exercises the real API → store → UI data flow.** That's the gap this plan fills: confidence that a user can actually sign in, search/add/view a location's weather, manage saved locations, and adjust settings, on a real Android device/emulator, in CI, on every PR.

Scope for this first phase: **mobile only** (Android via a free GH Actions emulator to start, no device-farm spend yet), a **small blocking smoke suite** on PRs that grows over time, and a **new Clerk test instance/test user setup** to bypass the sign-up bot-protection widget.

---

## 1. E2E tooling recommendation

### Recommendation: **Maestro**

|                            | Maestro                                                                                                                                                                                                                                          | Detox                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native project requirement | Drives a built `.apk`/`.ipa` as a black box — doesn't care that `ios/`/`android/` aren't committed (this repo uses CNG; native dirs are `.gitignore`d, regenerated via `expo prebuild`)                                                          | Needs to hook into the native build/test target directly; more setup friction on a CNG project where native folders don't exist until prebuild runs |
| New Architecture (Fabric)  | No special handling needed — UI-level black-box driving                                                                                                                                                                                          | Historically had rougher edges with Fabric/new arch; more moving parts to keep in sync with RN 0.81                                                 |
| Selector story             | Works off accessible text/id out of the box; repo currently has **zero `testID`s** on real screens, so either tool needs a testID pass — Maestro's YAML flows are simple enough that this pass is low-effort                                     | Same testID gap, but Detox's JS test files are heavier boilerplate per flow                                                                         |
| CI/device story            | Runs on a plain Android emulator with a CLI (`maestro test`); also has first-class support in **EAS Workflows**, which this repo already uses for its build/OTA pipeline — a natural on-ramp to a paid device farm later without switching tools | Needs its own emulator/build orchestration (`detox build`/`detox test`), more config (`.detoxrc.js`, build variants)                                |
| Debugging                  | Maestro Studio gives a live element inspector; flows are declarative YAML, easy to read in PR diffs                                                                                                                                              | Requires more JS glue and native build debugging when something breaks at the build layer, not just the flow layer                                  |
| Team ramp-up               | No new test-runner API to learn — flows are YAML with a small command vocabulary                                                                                                                                                                 | Requires learning Detox's JS API and native build tooling                                                                                           |

Given the CNG setup, New Architecture, no existing testIDs, no existing E2E experience, and the fact that EAS Workflows already exist as an integration point, **Maestro is the lower-friction choice** and leaves a clean upgrade path to EAS-hosted device farms (including iOS) later without re-tooling.

**Supporting libraries/setup:**

- **Test data**: no factory/seeding library needed — Open-Meteo (weather + geocoding) requires no auth key and is free/stable, so flows hit the real API against a small fixed set of well-known test cities (deterministic enough for assertions like "London" appearing in search results). No mocking layer (e.g. MSW) is warranted at this layer — that's what the unit-test layer already covers for `weather.ts`'s transform logic.
- **Auth test data**: a dedicated Clerk test user in a Clerk test/dev instance, plus **Clerk Testing Tokens** (Clerk's official mechanism for bypassing bot-protection/CAPTCHA in automated tests) — needed specifically because `sign-up.tsx` renders Clerk's invisible `clerk-captcha` widget.
- **Visual regression**: skip for now. Sky backgrounds are procedurally blended per weather condition/time of day (`skyGradient.ts`) — already covered by a deterministic unit test; pixel-diffing a live-gradient screen would be noisy and low-value.
- **Accessibility checks**: skip as a dedicated E2E layer for now — no existing precedent in this repo, and Maestro doesn't have a built-in a11y auditor. Revisit with `@testing-library/react-native`'s accessibility queries at the unit level if this becomes a priority.
- **Prerequisite work**: a `testID`/`accessibilityLabel` pass on interactive elements across `(auth)` and `(private)` screens (search input, swipe-row actions, unit segmented control, notification switch, sign-out button, etc.) — none exist today outside of test mocks.

---

## 2. Feature/flow coverage plan

Ordered by business risk × likelihood of silent breakage. **Phase 1 (initial blocking smoke suite)** is marked; the rest is the growth roadmap.

### Phase 1 — smoke suite (blocking on PRs)

1. **Sign in → land on home** _(auth gate is the single point of failure for the entire app)_
   - Happy path: valid test-user credentials → redirected to `/`.
   - Edge case: invalid password → native `Alert` shown, stays on sign-in.
   - NOT tested here: Clerk's internal auth logic, token storage mechanics — that's Clerk's own responsibility; we only verify our redirect/gate wiring.
2. **First-run empty state → search → preview → add → appears in pager** _(core value prop: this is the only way a new user gets any weather data at all)_
   - Happy path: no saved locations → auto-redirect to `/location` → search a known city → tap result → preview modal shows weather → tap Add → back on home, new location visible in pager.
   - Edge case: search a nonsense query → empty results state. Edge case: try to add a location already saved → "Add" button is absent on preview.
   - NOT tested here: WMO-code-to-condition mapping, temperature formatting — pure functions, unit-test those directly (currently a gap — `weather.ts`'s mapping has no unit test either; flag for the unit-test backlog, not E2E).

### Phase 2 — expand once Phase 1 is stable

3. **Saved-location management (swipe actions)** — swipe-to-delete a saved location; swipe-to-subscribe/unsubscribe for notifications; tap a row to jump the home pager to it. High silent-breakage risk because gesture-based UI regresses invisibly (a broken swipe threshold doesn't show up as a compile/type error).
4. **Notification subscription cap (max 2)** — subscribe two locations successfully, attempt a third → native alert blocks it. This is a specific, easily-regressed business rule (`MAX_SUBSCRIPTIONS`) with no current test at any layer.
5. **Settings: unit toggle reflected on weather card** — toggle °C/°F in Settings, confirm the currently-viewed weather card's displayed temperature changes. NOT tested here: the °C↔°F math itself (already unit-tested) — only that the toggle actually propagates to the rendered screen.
6. **Sign out → back to sign-in gate** — confirms the private→auth redirect direction, mirroring #1.
7. **Cross-session persistence** — add a location / toggle a unit / enable notifications, force-quit and relaunch the app, confirm state survived (the real `AsyncStorage` `load()` round trip). Currently the biggest integration gap: `load()` hydration is unit-tested with mocked storage per-store, but nothing exercises the real read-after-restart path end to end.
8. **Saved-location cap (max 10)** — lower priority; same shape as the notification cap but less frequently hit in real usage.

### High-value but hard to test E2E — and how to handle

- **Clerk sign-up email verification** (code-entry step) — needs either a real test inbox or Clerk's test-mode fixed-OTP support. Recommend deferring sign-up-flow E2E until the Clerk test instance is set up with fixed verification codes; sign-in with a pre-provisioned user is enough for Phase 1.
- **Push notification scheduling/content** (`scheduleAllWeatherAlerts`, fixed 13:47 local time, condition-based filtering) — can't reliably assert real OS notification delivery from a UI-driven E2E flow. Keep this at the unit level (currently untested — flag as a unit-test gap) and let E2E only verify the _subscribe/unsubscribe UI and the cap alert_, not that a notification actually fires.
- **OS permission dialogs** (notification permission prompt) — Maestro can pre-grant/deny permissions at launch; use that instead of trying to tap through a real OS dialog, which varies by Android version/OEM.
- **GPS "current location" flow** (`useLocation.ts` + `expo-location`) — currently unused dead code, not wired into any screen. Nothing to test until it's actually shipped.
- **Web build** — explicitly out of scope for this phase; revisit with a lightweight Playwright smoke suite only if/when the web target is actually shipped to users.

---

## 3. Setup plan

### Folder structure

```
.maestro/
  config.yaml                 # appId, global env vars (test user email/password via env)
  flows/
    auth/
      sign-in-happy-path.yaml
      sign-in-invalid-password.yaml
    locations/
      add-first-location.yaml
      search-no-results.yaml
      swipe-delete-location.yaml
      swipe-toggle-notification-subscription.yaml
      notification-cap-alert.yaml
    settings/
      toggle-units-reflected-on-card.yaml
      sign-out.yaml
    persistence/
      relaunch-preserves-state.yaml
  subflows/
    login-as-test-user.yaml     # reusable via `runFlow`, called from most flows
```

Component-driven/page-object abstraction isn't needed at this scale — Maestro's `runFlow` for shared subflows (mainly login) is enough; avoid building a custom framework layer prematurely.

### Test data strategy

- One dedicated Clerk **test user** (fixed email/password), provisioned in a Clerk test/dev instance, credentials injected into CI via secrets (`MAESTRO_TEST_EMAIL`/`MAESTRO_TEST_PASSWORD`), referenced in flows via `env` in `config.yaml`.
- Clerk **Testing Tokens** enabled on that instance to bypass the `clerk-captcha` bot-protection widget during automated sign-in/sign-up.
- A small fixed set of real-world test cities (e.g. "London", "Tokyo") used as search fixtures — no seeding/cleanup needed since Open-Meteo is stateless and free; the app's own saved-locations state is reset each run (see below), so no server-side cleanup step exists.
- Per-run isolation: each Maestro run starts from a fresh app install/data-clear (`clearState: true` on launch) so saved locations/units/notifications don't leak between runs or accumulate toward the 10-location cap.

### Environment strategy

- **Local dev**: run Maestro flows against a local Android emulator with a locally-built dev-client APK (`pnpm android` build, then `maestro test .maestro/flows/...`).
- **CI**: Android emulator booted directly on the existing `ubuntu-latest` GitHub Actions runner (e.g. via `reactivecircus/android-emulator-runner`), running a debug/dev-client build produced in the same job (or a cached EAS build if boot time becomes a bottleneck). No device farm / EAS Workflows integration yet — deferred until there's budget, at which point Maestro's existing EAS integration makes that an additive change, not a re-tool.
- **iOS**: explicitly deferred (needs either a macOS runner or a device farm) — noted as future work, not part of this phase.

### CI integration approach

- New GitHub Actions job (separate from the existing lint/typecheck/test:ci job, or a new workflow file) that: builds an Android dev-client APK → boots an emulator → installs the APK → runs the Phase 1 smoke flows via `maestro test`.
- **Blocking on PRs to `main`**, but scoped tightly to the Phase 1 smoke suite only (sign-in happy/invalid-path + first-run add-location flow) — kept small deliberately so it stays reliable enough to gate merges from day one.
- As Phase 2 flows are added, evaluate each for flakiness before promoting it into the blocking suite; a flaky flow should run non-blocking (e.g. a nightly job) until proven stable, rather than eroding trust in the required check.

---

## Open follow-ups (not blocking this plan, worth tracking separately)

- `src/api/weather.ts`'s WMO-code mapping has no unit test today — recommend adding one regardless of E2E work.
- `src/utils/notifications.ts` (`scheduleAllWeatherAlerts`/`scheduleWeatherAlerts`) has no test at any layer — recommend a unit test given E2E can't meaningfully verify actual notification delivery.
- CLAUDE.md's "YOU MUST run `npm test`" instruction conflicts with the repo's actual pnpm-only convention (`pnpm test:ci` is what CI runs) — worth fixing independently of this plan.
