# Saraya Rewards Store Frontend Spec

> Goal: Recreate the ZIZO-inspired rewards marketplace shown in the reference screenshot, using Next.js + Tailwind, with mock data today and a Supabase backend later.

## 1. Experience Overview
- **User story**: Players earn currency (points/tokens) across Saraya experiences (Hotspot, QuizApp, RunnerGame, etc.) and redeem them here.
- **Tone**: Dark, neon, space-blue UI with glowing accents, rounded surfaces, and subtle motion.
- **Devices**: Responsive from 1280px desktop down to mobile; cards stack gracefully and filters collapse on small screens.

## 2. Tech Stack & Libraries
| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js (App Router) | `app/` directory, server components by default. |
| UI | React + TypeScript | Strong typing for rewards, orders, filters. |
| Styling | Tailwind CSS | Custom colors, gradients, glassmorphism. |
| Fonts | `next/font` (Plus Jakarta Sans or Inter) | Load in `app/layout.tsx`. |
| Icons | `lucide-react` | Sidebar, actions, status badges. |
| Animation | `framer-motion` | Card hover + staggered entrances. |
| Class helpers | `clsx`, `tailwind-merge` | Conditional styles. |
| Tables (later) | `@tanstack/react-table` | Manage/Orders tables. |
| Data fetching (later) | `@tanstack/react-query` or Supabase client | Replace mock data. |
| Validation (later) | `zod` | Form + filter validation. |

Install now:
```bash
npm install framer-motion lucide-react clsx tailwind-merge
```
Add later when API-ready: `@tanstack/react-table`, `@tanstack/react-query`, `@supabase/supabase-js`, `zod`.

## 3. Routing Map
```
/
└─ rewards/
   ├─ catalog (default landing) – mirror the screenshot
   ├─ manage – admin CRUD table for rewards
   ├─ orders – redemption history & approvals
   └─ perks – curated list of PTO / perks (type === "PERK")
```
Add `/auth/*` routes after Supabase auth.

`app/page.tsx` should redirect to `/rewards/catalog` via `redirect()`.

## 4. Project Structure
```
app/
  layout.tsx                # loads font, TopBar, Sidebar shell
  page.tsx                  # redirect to /rewards/catalog
  rewards/
    layout.tsx             # shell if rewards-only needs custom sidebar spacing
    catalog/page.tsx
    manage/page.tsx
    orders/page.tsx
    perks/page.tsx
components/
  layout/TopBar.tsx        # logo, balances, quick actions
  layout/Sidebar.tsx       # nav + filter CTA button
  catalog/CatalogHeader.tsx
  catalog/FiltersPanel.tsx
  catalog/AnnouncementBanner.tsx
  catalog/HeroRewardCard.tsx
  catalog/RewardsGrid.tsx
  common/RewardCard.tsx
  common/BalanceBadge.tsx
  common/StatPill.tsx
  common/Countdown.tsx
lib/
  types.ts
  mock-data.ts
  utils.ts                 # helpers for currency formatting, tag colors, class merges
public/
  images/rewards/...       # placeholder PNGs
```

## 5. Data Modeling (front-end)
Create `lib/types.ts`:
```ts
export type CurrencyCode = "POINTS" | "TOKENS";
export type RewardType = "PHYSICAL" | "DIGITAL" | "PERK";
export type RewardTag = "FEATURED" | "LIMITED_TIME" | "REQUIRES_APPROVAL";

export interface Reward {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  type: RewardType;
  category: string;
  price: number;
  currency: CurrencyCode;
  stock?: number | null;
  requiresApproval?: boolean;
  tags?: RewardTag[];
  expiresAt?: string | null;
}

export type OrderStatus = "PENDING" | "APPROVED" | "FULFILLED" | "DENIED";

export interface RewardOrder {
  id: string;
  userName: string;
  rewardTitle: string;
  rewardId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}
```
Mock data lives in `lib/mock-data.ts` until Supabase is connected.

## 6. Layout & Component Guidelines
### Shell
- **Background**: `bg-slate-950` body with radial/linear gradients (e.g., `from-[#030617] via-[#050c2d] to-[#050617]`).
- **TopBar**: full width, sticky, height 72px, houses Saraya logo, breadcrumb, balances, quick CTA `+ Add Reward`, notification/profile icons.
- **Sidebar**: 256px width, glass surface (`bg-slate-900/70`), nav icons, filter CTA, collapses to icon bar on mobile.
- **Content**: `max-w-[1400px] mx-auto px-6 lg:px-10 py-8`, use `flex flex-col gap-6`.

### Catalog Page Sections
1. **CatalogHeader** – Search input with icon, Sort dropdown, Extra filter dropdown, currency toggle.
2. **AnnouncementBanner** – Purple gradient, Apple Watch art, CTA button, countdown timer component.
3. **HeroRewardCard** – Large blue card replicating Gucci avatar slide (image right, copy left, slider dots, price pill).
4. **RewardsGrid** – 4-column grid for cards, uses `RewardCard` component.
5. **FiltersPanel** – Price slider, product type select, category select, currency select, apply button. Hidden on mobile, rendered left of content on desktop.

### Manage & Orders Pages
- Use `PageHeader` with actions.
- Table component built on `@tanstack/react-table`, sticky header, glowing surface.
- Inline status badges match statuses (Pending=amber, Approved=emerald, Fulfilled=sky, Denied=rose).

### Perks Page
- Same layout as Catalog but filters `reward.type === "PERK"`.
- Highlight `Requires Approval` ribbon and explain approval policy.

## 7. Reward Card Visual Recipe
- Container: `bg-[#050b23]/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:border-brand-500/80 hover:shadow-[0_20px_45px_rgba(79,70,229,0.35)]`.
- Image: `rounded-2xl aspect-[4/3] object-cover`, optional gradient overlay.
- Badges: Inline pills for `FEATURED`, `LIMITED_TIME`, `REQUIRES_APPROVAL` (use accent colors: indigo, gold, rose).
- Price Row: coin icon + number + currency; show stock or `Qty: 1` text on right.
- Motion: `framer-motion` `whileHover={{ y: -4 }}` + fade-in on mount with `staggerChildren`.

## 8. Tailwind Theme Additions
Extend `tailwind.config.ts`:
```ts
extend: {
  colors: {
    brand: { 50: "#EEF2FF", 100: "#E0E7FF", 500: "#6366F1", 600: "#4F46E5", 700: "#4338CA" },
    surface: { 900: "#020617", 850: "#050b23", 800: "#07102e", card: "#050c26" },
    accent: { pink: "#EC4899", gold: "#FACC15", cyan: "#22D3EE" },
  },
  boxShadow: {
    glow: "0 0 35px rgba(79,70,229,0.45)",
  },
  fontFamily: {
    display: ["Plus Jakarta Sans", "var(--font-plus-jakarta)"],
  },
}
```

## 9. Motion & Interaction
- Use `framer-motion` `AnimatePresence` for page transitions.
- Countdown timer uses `useEffect` interval updating every second.
- Buttons: luminous outlines (`shadow-glow`) on hover, 200ms ease-out transitions.

## 10. Responsive Behaviors
- On <1024px, sidebar collapses to icon tray anchored left; filters move into a slide-over triggered by a `Filters` button near search bar.
- Grid breakpoints: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- TopBar actions stack into kebab menu on mobile.

## 11. Assets & Icons
- Drop placeholder artwork in `public/images/rewards/` (PNG/WebP) named by reward slug.
- Use `next/image` for optimization.
- Import `lucide-react` icons: `Search`, `SlidersHorizontal`, `Bell`, `User`, `ShoppingBag`, `Settings`, `Sparkles`, `ShieldCheck`.

## 12. Accessibility & QA
- Ensure sufficient contrast (aim for 4.5:1 for text on dark surfaces).
- Provide `aria-label` for icon-only buttons.
- Keyboard focus rings: custom `focus-visible:outline-2 focus-visible:outline-brand-500`.
- Write a few Playwright smoke tests later for nav + filters.

## 13. Implementation Roadmap
1. **Initialize styles**: configure Tailwind theme, global gradient background, load font.
2. **Shell**: build `TopBar`, `Sidebar`, global layout.
3. **Mock data**: isolate types + sample rewards/orders/perks.
4. **Catalog**: header, banner, hero card, grid, filters.
5. **Secondary pages**: Manage (table), Orders (table), Perks (filtered grid).
6. **Interactions**: animations, filter toggles, countdown.
7. **Data hookup**: replace mock fetches with Supabase RPCs, add auth once backend ready.

## 14. Future Integration Notes
- Supabase tables map 1:1 to the types above (`rewards`, `reward_orders`, `users`, `user_balances`).
- Host Supabase on Coolify; expose service key through Next server actions or route handlers.
- Hotspot/QuizApp/RunnerGame award points by calling a shared API that writes rows into `user_balances`; front end simply reads aggregated totals.

Use this document as the single source of truth while building the frontend. Feed individual sections into GitHub Copilot as inline comments to steer component generation and keep the UI faithful to the reference shot.
