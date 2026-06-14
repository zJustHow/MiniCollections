# Mini Collections Mobile (React Native)

Expo app for Android and iOS. Shares API, hooks, i18n, and theme with the Web frontend via `packages/`.

## Prerequisites

- Node.js 20+
- Expo Go app (for device testing) or Android Studio / Xcode simulators
- Backend running on port `8080` for local development

## Setup

From the repo root:

```bash
npm install
```

## Development

```bash
# From repo root
npm run dev:mobile

# Or from mobile/
npm start
```

### API URL

By default the app calls `http://localhost:8080` (iOS simulator) or `http://10.0.2.2:8080` (Android emulator).

Override with a `.env` file (see `.env.example`):

```
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

`app.config.ts` passes this into native builds via `extra.apiUrl`. Profile shows the resolved API URL in **dev builds** only.

### Physical device (same Wi‑Fi as backend)

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
```

Reload Expo after changing `.env`.

## Deep links

Custom scheme: `minicollections://`

When `EXPO_PUBLIC_WEB_URL` is set (same origin as the Web SPA), the app also accepts **Universal Links** / **App Links** on that host, and share buttons emit `https://` URLs instead of the custom scheme.

| Path | Screen |
|------|--------|
| `brands/:brandId/objects/:objectId` | Catalog object detail |
| `brands/:brandId` | Brand objects list |
| `groups/:groupId` | Group objects list (login required) |
| `groups/:groupId/objects/:objectId` | Group object detail (login required) |

Examples:

- `minicollections://brands/1/objects/42`
- `https://your-domain.com/brands/1/objects/42` (requires Universal Links setup)

### Universal Links setup

1. Set `EXPO_PUBLIC_WEB_URL=https://your-domain.com` for EAS builds (or in `.env` for local dev).
2. Replace placeholders in `frontend/public/.well-known/`:
   - `apple-app-site-association` — set your Apple Team ID + bundle id (`com.minicollections.app`).
   - `assetlinks.json` — set the SHA-256 cert fingerprint from your Android signing key (`eas credentials` or Play Console).
3. Ensure your CDN/nginx serves `/.well-known/*` with `Content-Type: application/json` (no redirect on AASA).
4. Rebuild the native app after changing associated domains / intent filters.

## Project structure

```
mobile/src/
  components/neu/   # RN UI components (NeuCard, NeuButton, …)
  navigation/       # React Navigation stacks
  platform/         # Token storage & future native adapters
  providers/        # Auth, Locale
  screens/          # Login, Brands, …
```

## Shared packages

| Package | Purpose |
|---------|---------|
| `@minicollections/api` | HTTP client, auth, brands API |
| `@minicollections/hooks` | `useInfiniteList` |
| `@minicollections/i18n` | Translations |
| `@minicollections/theme` | Design tokens |
| `@minicollections/core` | Pagination helpers, format utilities |

## Brand object detail

Shows brand, series, category, scale, release price/date, image source, view count, and description (aligned with Web).

## Locale

The app picks **en-US** or **zh-CN** from the device language on first launch. Logged-in users sync to their profile `preferred_locale`.

## Screens (MVP)

| Tab | Screens |
|-----|---------|
| Brands | Brand list (search + filters) → **brand objects (search + filters)** → detail |
| Groups | Group list (long-press edit, **combined search**: groups + owned models) → Group objects (add model, sort, edit group, search) → Object detail (edit + image upload) |
| Stats | Collection stats with bar charts (login required) |
| Feedback | My submissions list, submit feedback, view/delete details (login required) |
| Profile | Avatar, settings, **Admin → Submissions** (admin only) |

Auth modals: **Sign in**, **Sign up**, **Forgot password** (email/phone toggle; phone gated by `PHONE_AUTH_ENABLED` in `mobile/src/constants/authFeatures.ts`).

## EAS Build

Install the EAS CLI and link the project once:

```bash
npm install -g eas-cli
cd mobile
eas login
eas init
```

Set production API URL before building:

```bash
# One-time: store secrets for EAS cloud builds
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-api.example.com
eas secret:create --scope project --name EXPO_PUBLIC_WEB_URL --value https://your-domain.com

# Or use a local .env for dev (see .env.example)
```

```bash
# Internal preview APK (Android) or ad-hoc IPA (iOS)
eas build --profile preview --platform android
eas build --profile preview --platform ios

# Store release
eas build --profile production --platform all
```

## App icons & splash

Assets live in `mobile/assets/`. `app.json` / `app.config.ts` references:

- `icon.png` — iOS / fallback
- `splash-icon.png` — launch screen
- `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png` — adaptive icon

Replace these PNGs before store submission; run `eas build` to verify on device.

## HarmonyOS

See `mobile/harmony/README.md` for the planned RNOH migration checklist (not implemented yet).

## Next steps

- Push notifications

Typecheck from repo root: `npm run typecheck:mobile`
