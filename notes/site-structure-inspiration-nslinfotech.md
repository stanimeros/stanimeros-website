# Site Structure Inspiration — nslinfotech.com (minimal adaptation)

Source: https://nslinfotech.com/ (fetched 2026-07-29)

## Original site structure (reference)

Nav: Home, Services, About, Portfolio, Blogs, Contact, Get a Quote.

Homepage, top to bottom:
1. Header + promo banner
2. Hero — tagline + 2 CTAs
3. Key stats (4 metrics)
4. Recent work showcase (4 cards w/ status badges: Live/New/Running)
5. Services overview (6 categories)
6. Process — "5-Step Process": Discovery → Design → Development → QA → Launch & Support
7. Differentiators (4 value props)
8. Satisfaction metrics (%)
9. Tech stack grid (30+ items)
10. Client logos
11. CTA band + email signup
12. Footer (4 link columns, newsletter, contact, social)

## Minimal version — what we're actually adopting

Our site is a single-page personal portfolio (Astro + React), already has: Hero → About → Why (pain points) → Services → Packages+FAQ → Portfolio → Contact. We are NOT turning it into an agency site (no promo banners, no satisfaction %, no client-logo wall, no chatbot, no newsletter). Just three light touches on the existing structure:

1. **Process section** — short numbered steps (3–4, not 5), placed between Services and Packages (or Packages and Portfolio). Plain text/number list, no new visual system, matches existing `Separator`/heading pattern used by other sections (see `src/page-content/HomePage.tsx`).
2. **Status badges on portfolio cards** — add a small "Live" badge (using existing `Badge` component) to `PortfolioCard` for items that have a `url`, reusing the existing `technologies` badge row style. No "New"/"Running" states — just a boolean live indicator, since that's the only one relevant to real deployed client work.
3. **Keep a single CTA** — the existing Contact section already serves as the one CTA band; no changes needed there, and no second/duplicate CTA band should be added (avoids the "multiple scattered CTAs" pattern from the source site, which doesn't fit a personal site).

## Explicitly skipped
- Promo/discount banner, email signup, newsletter
- Satisfaction % metrics, key-stats tiles
- Tech stack mega-grid (we may keep Badges in About section as-is, nothing new)
- Client logo wall
- Floating chatbot widget
- Multiple CTA touchpoints beyond the one Contact section

## Relevant files
- `src/page-content/HomePage.tsx` — section order, id="services"/"packages"/"portfolio"
- `src/components/PortfolioCard.tsx` — where the "Live" badge goes
- `src/components/WhySection.tsx` — pattern to follow for a new standalone section component (own file, own scroll animation, `Separator` + icon heading)
- `src/i18n/locales/en/main.json` / `el/main.json` — copy lives here, not hardcoded in components

## Content draft, customized to Pantelis's actual work

Based on `services`/`packages`/`contact` copy already in `main.json` (AI agents & automation, apps & dashboards, optimization/AI, 24h quote turnaround, free strategy call, 1–2 week agent builds / 3–6 week apps). New section: **"How It Works"**, 4 steps, placed after Services and before Packages (id="process"):

1. **Free Strategy Call** — We talk through the problem, no obligations. (mirrors `contact.description`/`packages.faq.items.timeToLaunch`)
2. **Proposal & Quote** — Clear scope and price within 24 hours, no hidden fees. (mirrors `packages.footer`, `faq.hiddenFees`)
3. **Build & Iterate** — Agent/automation in 1–2 weeks, apps & dashboards in 3–6 weeks, with check-ins along the way.
4. **Launch & Support** — Deployed to your infrastructure with ongoing support, not a handoff-and-disappear.

i18n keys to add under a new `process` namespace in both `en/main.json` and `el/main.json`:
```
"process": {
  "title": "How It Works",
  "subtitle": "From first call to launch, here's what to expect",
  "steps": {
    "call":     { "title": "Free Strategy Call",  "description": "..." },
    "quote":    { "title": "Proposal & Quote",    "description": "..." },
    "build":    { "title": "Build & Iterate",     "description": "..." },
    "launch":   { "title": "Launch & Support",    "description": "..." }
  }
}
```

Portfolio "Live" badge: only for items with a `url` set in `portfolioItems` (`src/page-content/HomePage.tsx`) — e.g. irisdrop, athensMytransfer, veridictum, process, skiGreece, nikiMargariti, tattooHealer, transHellas, etui, hedeos, ekarotsi. Items without `url` (fireMessage, ridefast, atproPartner, mealAi, near) are app-store-only or private, so no badge — avoids implying a broken/dead link.

## Status: plan finalized, not yet implemented
Next step: add `process` i18n keys, create `src/components/ProcessSection.tsx` (same shape as `WhySection.tsx`), insert it in `HomePage.tsx` between Services and Packages, and add a `Badge` "Live" to `PortfolioCard.tsx` gated on `url` being set.
