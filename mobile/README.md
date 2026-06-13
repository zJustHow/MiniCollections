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
| `@minicollections/core` | Pagination helpers |

## Screens (MVP)

| Tab | Screens |
|-----|---------|
| Brands | Brand list → Brand objects (search) → Object detail → Add to group |
| Groups | Group list (long-press edit) → Group objects (edit group, search) → Object detail (edit + image upload) |
| Stats | Collection stats with bar charts (login required) |
| Profile | Avatar, display name, phone bind, password, locale sync, delete account |

Auth modals: **Sign in**, **Sign up**, **Forgot password** (email/phone toggle; phone gated by `PHONE_AUTH_ENABLED` in `mobile/src/constants/authFeatures.ts`).

## EAS Build

Install the EAS CLI and link the project once:

```bash
npm install -g eas-cli
cd mobile
eas login
eas init
```

Set production API URL before building (e.g. `EXPO_PUBLIC_API_URL` in EAS secrets or `eas.json` env).

```bash
# Internal preview APK (Android) or ad-hoc IPA (iOS)
eas build --profile preview --platform android
eas build --profile preview --platform ios

# Store release
eas build --profile production --platform all
```

## Next steps

- Push notifications
- HarmonyOS via RNOH (`mobile/harmony/`)
