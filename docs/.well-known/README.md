# `.well-known/` — Deep Linking templates

Files here are served raw at `https://gpleoo.github.io/Smemorandum/.well-known/`
to enable iOS Universal Links and Android App Links.

> ⚠️ **Jekyll** ignores directories starting with `.` by default.
> The `_config.yml` includes `.well-known` so it gets published.

## `apple-app-site-association` (iOS Universal Links)

- Replace `TEAMID` with your Apple Developer Team ID (10 chars, e.g. `ABCDE12345`).
  Find it at https://developer.apple.com/account → Membership.
- The Bundle ID `com.smemorandum.app` matches `app.json > ios.bundleIdentifier`.
- File **must** be served as `application/json` (GitHub Pages does this automatically
  for files under `.well-known/`).
- After deploying:
  1. Add `applinks:gpleoo.github.io` to `app.json > ios.associatedDomains` (already done).
  2. Test with `xcrun simctl openurl booted https://gpleoo.github.io/Smemorandum/event/123`.
  3. Validate: https://branch.io/resources/aasa-validator/

## `assetlinks.json` (Android App Links)

- Replace `SHA256_FINGERPRINT_PLACEHOLDER` with the SHA-256 of the signing cert.
  Get it after the first EAS build with:
  ```
  keytool -list -v -keystore /path/to/keystore.jks
  ```
  or via Google Play Console → Setup → App integrity → App signing key cert.
- The package `com.smemorandum.app` matches `app.json > android.package`.
- After deploying:
  1. `app.json > android.intentFilters` already declares `https://gpleoo.github.io/Smemorandum/...` with `autoVerify: true`.
  2. Validate: https://developers.google.com/digital-asset-links/tools/generator

## Routing

Both templates route the following paths to the app (handled in-app):
- `/event/{id}` — open a specific event detail
- `/share/{token}` — open a shared wish/share card

The root `/` and other paths stay on web (landing + privacy).
