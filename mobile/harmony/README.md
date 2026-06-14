# HarmonyOS (RNOH) — Future Target

Mini Collections mobile is built with **Expo + React Native**. Most business logic lives in shared packages (`packages/api`, `packages/hooks`, `packages/i18n`, `packages/theme`, `packages/core`) and can be reused on HarmonyOS via [React Native OpenHarmony (RNOH)](https://gitee.com/openharmony-sig/ohos_react_native).

## Current status

- **Not scaffolded yet.** Android and iOS are the active targets (`mobile/` Expo app).
- This folder documents the intended migration path when HarmonyOS support is needed.

## Recommended approach

1. **Keep shared logic in `packages/`** — already platform-agnostic; do not duplicate API or i18n in a Harmony-specific tree.
2. **Create an RNOH app** (separate from Expo) that:
   - Depends on the same `@minicollections/*` workspace packages.
   - Reuses `mobile/src/screens`, `navigation`, and `components` where RNOH-compatible (replace Expo-only modules: `expo-image`, `expo-secure-store`, `expo-image-picker` with OH equivalents or community shims).
3. **Platform adapters** — extend `mobile/src/platform/` with Harmony storage and image-picker implementations selected at build time.

## Expo modules to replace on HarmonyOS

| Expo module | Harmony direction |
|-------------|-------------------|
| `expo-secure-store` | Encrypted preferences / HUKS-backed storage |
| `expo-image-picker` | OH media picker API |
| `expo-image` | RN `Image` or OH image component |
| `expo-constants` | Build-time env / native config |

## Metro / monorepo

The existing `mobile/metro.config.js` watches the repo root for workspace packages. An RNOH project will need a similar Metro config so `@minicollections/*` resolves from `packages/`.

## When to start

Prioritize RNOH after:

- Core Android/iOS flows are stable (auth, groups, stats, profile).
- EAS preview builds succeed against production API.
- Product requires AppGallery distribution.

Until then, use this document as the checklist; no Harmony native project is checked in.
