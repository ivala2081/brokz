-- ============================================================================
-- Brokz local development seed
-- ----------------------------------------------------------------------------
-- Loaded by `supabase db reset` (runs migrations then this file).
-- Contains: product catalog, one sample organization, one draft blog post.
-- No fake user data or test emails — create real accounts via Supabase Studio
-- or the signup flow, and the profile trigger will provision profiles.
-- ============================================================================

-- ---------- Products --------------------------------------------------------
insert into public.products (slug, name, description, category, base_price, currency, is_active)
values
  (
    'web-trader',
    'Web Trader',
    'B-book-ready, multi-asset web trading platform for retail brokers. Fast, reliable, fully branded.',
    'trading-platform',
    25000.00,
    'USD',
    true
  ),
  (
    'crm',
    'CRM',
    'Broker-grade CRM built for client onboarding, KYC, sales pipelines, and retention workflows.',
    'crm',
    18000.00,
    'USD',
    true
  ),
  (
    'bridge',
    'Bridge',
    'Low-latency order routing bridge connecting MT4/MT5 and Brokz Web Trader to liquidity providers.',
    'infrastructure',
    15000.00,
    'USD',
    true
  ),
  (
    'white-label',
    'White Label',
    'End-to-end white-label package: trader, CRM, bridge, payments — fully rebranded for your firm.',
    'bundle',
    75000.00,
    'USD',
    true
  ),
  (
    'risk-management',
    'Risk Management',
    'Real-time exposure, A-book/B-book routing, P&L monitoring, and dealer intervention tooling.',
    'risk',
    22000.00,
    'USD',
    true
  ),
  (
    'payment-gateway',
    'Payment Gateway',
    'Aggregated deposit/withdrawal gateway with multi-PSP routing, reconciliation, and compliance hooks.',
    'payments',
    12000.00,
    'USD',
    true
  )
on conflict (slug) do nothing;

-- ---------- Sample organization --------------------------------------------
insert into public.organizations (id, name, country, website, contact_email, status, notes)
values (
  '00000000-0000-0000-0000-0000000000a1',
  'Sample Broker Ltd.',
  'Cyprus',
  'https://example.com',
  'ops@example.com',
  'active',
  'Seed data — local development only.'
)
on conflict (id) do nothing;

-- ---------- Sample blog post (draft) ---------------------------------------
insert into public.blog_posts (slug, title, excerpt, body_mdx, status, tags)
values (
  'bbook-web-trader-primer',
  'What a B-Book Web Trader Actually Does (And Why It Matters)',
  'A plain-language explainer for broker operators: what B-book means, where the web trader fits, and which trade-offs are worth the money.',
  '# What a B-Book Web Trader Actually Does\n\n> Draft — pillar seed content.\n\nLorem ipsum placeholder. Real content authored in Phase 1.\n',
  'draft',
  array['web-trader', 'b-book', 'primer']
)
on conflict (slug) do nothing;
