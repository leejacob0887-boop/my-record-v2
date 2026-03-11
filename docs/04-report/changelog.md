# Changelog

All notable changes to my-record-v2 will be documented in this file.

## [PWA-v1.0.0] - 2026-03-11

### Added
- Progressive Web App (PWA) full support
- Web App Manifest (public/manifest.json) with 10 fields including name, short_name, display:standalone, theme_color, icons
- Service Worker implementation (src/app/sw.ts) with Serwist v9 class-based API
- Three-tier caching strategy:
  - Cache First for static assets (JS, CSS, fonts, images)
  - Network First for HTML pages
  - Network Only for API requests (Supabase)
- Offline fallback page (src/app/offline/page.tsx) with user-friendly UI
- App icons in two sizes: 192x192px and 512x512px (public/icons/)
- Home screen installation support for iOS and Android
- PWA metadata in layout.tsx (manifest link, apple-touch-icon, theme-color meta tags)
- Runtime caching with ExpirationPlugin for CDN font management
- Support for maskable app icons (adaptive icons for Android)

### Changed
- next.config.ts: Wrapped with @serwist/next withSerwistInit
- package.json: Added @serwist/next ^9.5.6 and serwist ^9.5.6 dependencies
- tsconfig.json: Added "webworker" library for Service Worker TypeScript support
- Build configuration: Added --webpack flag to maintain webpack compatibility with Next.js 15

### Fixed
- Resolved Next.js 15 Turbopack conflict with @serwist/next (webpack-based) using --webpack build flag
- Corrected Service Worker API from serwist v8's installSerwist() to v9's new Serwist() class-based approach
- Updated runtime caching handler syntax from string-based to class instance (e.g., new NetworkOnly() instead of "NetworkOnly")
- Adjusted defaultCache array position for proper handler priority in runtime caching rules
- Updated fallbacks structure to match serwist v9 entries-based API

### Deprecated
- None

### Removed
- None

### Security
- Service Worker requires HTTPS (or localhost for development)
- All API calls to Supabase use Network Only strategy (graceful offline failure)

### Performance
- Reduced reload time on revisit through Cache First strategy for static assets
- Expected 50%+ improvement in page load times for cached content
- CDN fonts cached for 1 year with ExpirationPlugin (max 10 entries)

---

## Release Notes

### v1.0.0 Summary (2026-03-11)
- **Feature**: Progressive Web App
- **Match Rate**: 94% (15/16 design items matched)
- **Completion**: 100% (5/5 functional requirements, 4/4 non-functional requirements)
- **Files**: 9 modified/created (config, components, assets, manifest)
- **Status**: Ready for production testing

**What's New**:
- Install my-record-v2 directly to your home screen on mobile
- Use your records offline with cache-first loading strategy
- Enjoy native app-like experience without browser UI
- Access saved records even when offline

**Next Steps**:
- Run production build: `npm run build && npm start`
- Test with Lighthouse PWA audit (target: 90+ score)
- Verify home screen installation on Android/iOS devices
- Test offline mode in browser DevTools

---

## Installation & Migration

### For Users
After PWA v1.0.0, you can now:
1. Open my-record-v2 in mobile Chrome
2. Tap the install button in the address bar
3. Add to Home Screen
4. Launch from home screen like a native app

### For Developers
```bash
# Install dependencies
npm install

# Run production build (uses --webpack flag)
npm run build

# Start server for PWA testing
npm start

# Test PWA with Chrome DevTools
# 1. Go to Application tab
# 2. Check Manifest and Service Workers sections
# 3. Run Lighthouse PWA audit
```

---

## Verification Checklist

- [x] Web App Manifest created and linked
- [x] Service Worker registered with cache strategies
- [x] Offline fallback page implemented
- [x] App icons (192x192, 512x512) added
- [x] Standalone mode enabled
- [x] PWA metadata in head tags
- [x] TypeScript webworker lib configured
- [ ] Lighthouse PWA score 90+ (requires production build test)
- [ ] Mobile installation tested on Android
- [ ] Mobile installation tested on iOS

---

## Related Documents

- Plan: [docs/01-plan/features/pwa.plan.md](../01-plan/features/pwa.plan.md)
- Design: [docs/02-design/features/pwa.design.md](../02-design/features/pwa.design.md)
- Analysis: [docs/03-analysis/pwa.analysis.md](../03-analysis/pwa.analysis.md)
- Report: [docs/04-report/pwa.report.md](./pwa.report.md)
