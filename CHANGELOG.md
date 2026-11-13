# CHANGELOG — SRI NEYA CRANE SERVICES (SNC)

All notable changes to the SNC enterprise platform are documented in this file.

---

## [1.1.0] — 2026-11-13 — Platform Quality & SEO Hardening

### Added
- **SEO**: `robots.txt` for search engine crawl policies
- **SEO**: `sitemap.xml` with full page index and priorities
- **SEO**: JSON-LD structured data (`LocalBusiness`, `EmergencyService`) in `index.html`
- **SEO**: Open Graph and Twitter Card social meta tags on all 8 pages
- **PWA**: `manifest.json` with Caterpillar Yellow branding and standalone display
- **PWA**: `sw.js` service worker with offline caching strategy
- **PWA**: Service worker registration in `main.js`
- **UI**: Custom Caterpillar-themed `404.html` error page
- **UI**: SVG favicon `assets/images/favicon.svg` with SNC triangle emblem
- **UI**: Favicon, Apple touch icon, manifest and theme-color meta linked across all pages
- **A11y**: Skip-to-content keyboard link on all pages
- **A11y**: ARIA landmark `<main id="main-content">` on all pages
- **A11y**: `prefers-reduced-motion` media query in `style.css`
- **A11y**: High-visibility `focus-visible` keyboard focus rings in `style.css`
- **Perf**: `preconnect` and `dns-prefetch` hints for fonts and CDN on all pages
- **Security**: `.well-known/security.txt` per RFC 9116
- **Styles**: Comprehensive print stylesheet for fleet specs and emergency contacts
- **Forms**: Phone number validation on booking form
- **JS**: Auto-updating copyright year utility
- **Docs**: `CHANGELOG.md`

### Changed
- Upgraded print styles from minimal to full page-break and colour-safe rules

---

## [1.0.0] — 2026-10-05 — Initial Release

### Added
- ACE-style geometric stencil SNC logo with Caterpillar Yellow branding
- Soundboard with chain tension snap in Automation Lab
- Physical modal lifting chain sound with multi-link cascade clatter
- Interactive crane lifting automation, chain sound engine, preloader
- Full Sri Neya Crane Services enterprise website (Caterpillar UI)
- 1,500+ works completed real-time dashboard
- Live GPS fleet tracker
- 24/7 emergency dispatch portal
