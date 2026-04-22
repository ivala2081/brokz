# Pillar Brief 01 — B-Book Web Trader

**Status:** draft outline for Turgut to write against (hybrid content model: pillar = CEO voice).
**Target locale:** EN primary, TR translation to follow.
**Target length:** 3000+ words.
**Target URL:** `/blog/b-book-web-trader-guide` + `/tr/blog/b-book-web-trader-rehberi`
**Goal:** rank top-3 for `b-book web trader` within 90 days of publish; anchor all cluster content.

---

## Why this pillar

Brokz's strongest product is a B-book web trader. Most fintech-engineering content chases generic "trading platform" keywords where Interactive Brokers, TradingView, etc. dominate. **B-book specifically** is an under-served, high-intent B2B niche — the exact broker operators evaluating platform vendors search this term, and there are very few authoritative guides.

A pillar written from real engineering experience (no buzzwords, real trade-offs named) will earn links from broker trade publications (FinanceFeeds, LeapRate, FinanceMagnates) without outreach.

---

## Target reader

**Primary:** CTO / Head of Technology at a retail brokerage running or considering B-book. They are evaluating whether to build in-house vs. license a web trader vs. white-label vs. buy a custom platform from a specialist (Brokz).

**Secondary:** COO / risk officer at a prop firm or market-making desk shopping for a client-facing front end.

**What they are Googling:**
- `b-book web trader`
- `white label b-book platform`
- `b-book risk management software`
- `retail broker web trader comparison`
- `custom web trader vs MT5`
- `market maker trading platform`

---

## Working title options (pick one)

1. `The Complete Guide to B-Book Web Trader Platforms (2026)` — SEO-safe
2. `B-Book Web Trader: Every Trade-off You Must Know Before Buying` — higher CTR, lower keyword purity
3. `Inside the B-Book Web Trader: Architecture, Risk, Execution` — engineering-credibility framing

Recommend **(3)** — matches Brokz's "engineering firm" positioning + differentiates from generic vendor content that dominates options (1)/(2).

---

## Outline (Turgut rewrites each section in his voice)

### 1. What a B-Book Web Trader actually is (~300 words)
- One-sentence definition: a web-based trading front-end for brokers who internalize client flow (market-making / B-book execution model) rather than routing to liquidity providers.
- Contrast with A-book and hybrid execution. Be precise about internalization, risk warehousing.
- Why "web trader" specifically: browser-native, no install, universal access vs. MT4/5 desktop + mobile app combo.

### 2. The economics behind the choice (~400 words)
- Why brokers choose B-book: spread capture, no LP cost, margin predictability for low-volume retail.
- Why they choose A-book: less balance-sheet risk on high-volume / sophisticated flow.
- The real world: almost everyone runs hybrid. The platform must support both.
- **Brokz angle:** our web trader is architected to support hybrid desks — same front end, different back-end routing.

### 3. Architecture that actually holds up at retail volume (~600 words)
- Quote dissemination: WebSocket multiplex vs. polling. Why polling kills UX above 1k concurrent.
- Order routing: client-side state machine vs. server-authoritative. Why server-authoritative is the only correct answer for regulated flow.
- Risk exposure streaming: real-time P&L + exposure push to the trader dashboard.
- Latency budget: where 100ms is fine (chart refresh) vs. where 10ms matters (order confirm).
- **Anti-pattern to call out:** retail brokers who build on Firebase Realtime DB and wonder why exposure calculations lag. (Good for credibility — signals engineering depth.)

### 4. Risk management — the real differentiator (~500 words)
- Per-client margin requirements, different for B-book vs. A-book clients on the same system.
- Exposure dashboards: net position per symbol, total gross, per-desk, per-region.
- Toxic flow detection: which clients are systematically profitable against the house, how to auto-reroute their flow to A-book.
- Kill switches: per-symbol, per-client, per-session.
- **Brokz angle:** our dashboard ships with these built in, not as add-ons.

### 5. Compliance — ESMA / FCA / CySEC / TR SPK realities (~400 words)
- Leverage caps per jurisdiction.
- Negative balance protection implementation (auto-stop-out logic must be precise).
- Best execution reporting — even in B-book, MIFID II RTS 27/28 requires data.
- Trade reconstruction + audit trail — every quote + order + fill stored with signed timestamps.
- KYC + AML tie-ins — web trader as the front door that surfaces suspicious activity.

### 6. UX patterns that convert real clients (~300 words)
- Onboarding flow: how few clicks until first demo trade.
- Order ticket ergonomics: market vs. limit vs. stop. Mobile-first sizing.
- Chart engine — TradingView embed vs. custom. Licensing realities of each.
- Mobile parity — a web trader that doesn't work on iPhone Safari is DOA for retail.

### 7. Integration reality check (~300 words)
- MT4/MT5 bridge for brokers migrating — maintain legacy accounts while migrating to modern front end.
- PSP connectors (Stripe / Paysafe / Bank transfer).
- KYC vendor plug-ins (Sumsub / Onfido).
- CRM outbound (Salesforce / HubSpot / in-house CRM).

### 8. Build vs. buy vs. Brokz (~200 words)
- Build in-house: 12-18 months, 4-6 engineers, ongoing compliance cost. Only sensible at scale.
- Generic white-label: fast, but you ship the vendor's UX and cannot differentiate.
- Custom from specialist (Brokz): 3-6 months, specific to your flow, yours to evolve.
- Softer close — not "hire us today," more "these are the trade-offs, we're happy to brief your CTO."

### 9. Closing + CTA (~100 words)
- Summary: B-book web trader is not a commodity; it's the shop window for the broker brand and the risk-control dashboard for the COO.
- CTA: link to `/products#webTrader`, link to `/contact` for a 30-minute technical walkthrough.

---

## Internal links Turgut should land naturally

- `/products` (specifically the web trader tile)
- `/solutions` (risk management, execution optimization)
- `/about` ("engineering firm" positioning)
- `/contact` (two places minimum — mid-content + closing)

## Keyword density targets (don't stuff — aim for natural usage)

- `b-book web trader` — 6-10 times
- `web trader platform` — 4-6 times
- `broker platform` — 4-6 times
- `market maker` / `b-book broker` / `retail broker` — 3-5 times each
- Long-tail variants surface naturally in section subheadings

## Image / diagram asks (post-draft, Claude can generate outlines for SVG)

- Architecture diagram: web trader → order routing → risk engine → (internal B-book | A-book LP)
- Exposure dashboard mock
- Flow chart: toxic-flow detection → auto-reroute decision

---

## Publishing checklist (once draft is ready)

- [ ] Convert markdown → `content/blog/b-book-web-trader-guide.md` with full frontmatter
- [ ] Frontmatter: title, date, category=`technical`, excerpt (155 chars for meta), author=`Brokz Team`
- [ ] Astro build regenerates sitemap with the new URL
- [ ] Internal-link audit: add 2-3 inbound links to this pillar from `/products`, `/solutions`, homepage reference-architecture section
- [ ] Cluster post draft #1 queued (`B-Book vs A-Book: broker model trade-offs`)
- [ ] LinkedIn post draft: 3 key takeaways + link to pillar, tag 3-5 broker industry accounts
- [ ] TR translation drafted (Claude) → Turgut edits → publishes to `/tr/blog/b-book-web-trader-rehberi`
