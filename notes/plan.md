# Execution Plan

Edit this file directly to change scope/order before I execute. Related background: `notes/site-structure-inspiration-nslinfotech.md`.

## Shared architecture (applies to all items below)
- `src/layouts/BaseLayout.astro` stays the single wrapper for every page (`Header`, `Footer`, `CookieBanner`, and eventually the chat widget) — built once, applies everywhere.
- New pages follow the existing pattern: an Astro route in `src/pages/` + a React component in `src/page-content/` (see `Contact.tsx`, `PrivacyPolicy.tsx`).
- Reuse existing primitives (`Button`, `Card`, `Badge`, `Separator`, `PortfolioCard`) instead of rebuilding UI per page.
- Copy lives in `src/i18n/locales/en/main.json` and `el/main.json`, not hardcoded in components.

---

## 1. Minimal homepage tweaks
Status: ready, no external dependencies.

- **New "How It Works" section** (`id="process"`), inserted between Services and Packages in `src/page-content/HomePage.tsx`.
  - New component `src/components/ProcessSection.tsx`, modeled on `src/components/WhySection.tsx` (own scroll animation, `Separator` + icon heading, same visual language — no new design system).
  - 4 steps:
    1. **Free Strategy Call** — talk through the problem, no obligations
    2. **Proposal & Quote** — clear scope and price within 24 hours, no hidden fees
    3. **Build & Iterate** — agent/automation in 1–2 weeks, apps/dashboards in 3–6 weeks, with check-ins
    4. **Launch & Support** — deployed and supported, not handed off and forgotten
  - New `process` i18n namespace (title, subtitle, 4 steps) added to both `en/main.json` and `el/main.json`.
- **"Live" badge on portfolio cards** — `src/components/PortfolioCard.tsx` gets a `Badge` shown only when the item has a `url` set (irisdrop, athensMytransfer, veridictum, process, skiGreece, nikiMargariti, tattooHealer, transHellas, etui, hedeos, ekarotsi). Items without a public `url` (fireMessage, ridefast, atproPartner, mealAi, near) get no badge.
- Explicitly NOT doing (from the nslinfotech reference): promo/discount banners, satisfaction %, key-stats tiles, tech-stack mega-grid, client-logo wall, chatbot-as-decoration, multiple scattered CTAs.

## 2. SEO page expansion
Status: ready, no external dependencies. Per-project case-study pages explicitly declined by user — portfolio stays homepage-only.

- **`/services`** — standalone page expanding the 4 homepage service cards (AI Agents & Automation, Mobile Apps & Dashboards, Smart Problem Solving, AI Trained on Your Data) into fuller content with more room for keywords than the homepage summary cards.
- **`/about`** — standalone page built from the existing bio content (`about.description1`/`description2` in `main.json`), expanded with more detail than the homepage About section.
- Both get their own `<title>`/meta description, and internal links back to home / to each other / to Contact.
- Blog: deferred — it's an ongoing content commitment (needs actual posts written over time), not a one-time build. Revisit later if wanted.

## 3. Gemini chat agent with history + calendar booking
Status: blocked on manual setup by user (see below) before implementation can start.

- **Frontend**: floating chat widget component, added in `BaseLayout.astro` so it's on every page. Anonymous session id generated client-side (localStorage) to group messages into a conversation.
- **Backend**: new Firebase Cloud Function `chatMessage` (`functions/index.js`, same `onCall` pattern as the existing `sendEmail` function) that:
  - Loads recent history for the session from Firestore and calls the Gemini API (`GEMINI_API_KEY`, currently in root `.env`, needs to move to `functions/.env` for backend use).
  - Uses Gemini function-calling to detect booking intent.
- **Chat history**: stored in Firestore, `chatSessions/{sessionId}/messages`.
- **Booking guardrail** (per user decision): agent collects the visitor's name/email/purpose, shows a summary, and only creates the Google Calendar event after the visitor explicitly confirms. The visitor's email is attached to the event as a guest, so fake/spam bookings are traceable.
- **Calendar integration**: Google Cloud service account (not OAuth) — simplest for a personal Gmail calendar. The service account's email is shared on your Google Calendar with "Make changes to events" permission; the Cloud Function authenticates as that service account to create events.

### Manual steps only the user can do (blocking item 3)
1. In Google Cloud Console: enable the Calendar API, create a service account, download its JSON key.
2. In Google Calendar settings: share your calendar with the service account's email, "Make changes to events" permission.
3. Hand the service account JSON key over so it can be stored as a Firebase Functions secret (never committed to git) — confirm which calendar (primary) it should book into.

---

## Suggested execution order
1. Homepage tweaks (§1)
2. SEO pages (§2)
3. Chat agent (§3) — once the manual GCP/Calendar setup above is done
