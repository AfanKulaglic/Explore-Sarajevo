## Saraya Rewards Store

This project recreates the dark, neon rewards marketplace shown in the ZIZO-inspired reference UI. Players will eventually earn currency across Saraya experiences (Hotspot, QuizApp, RunnerGame, etc.) and redeem them here. The current scope focuses on a pixel-perfect frontend using Next.js, Tailwind CSS, and TypeScript while real data lives in Supabase later.

### Documentation
- 📘 **Frontend spec**: [`docs/rewards-store-frontend-spec.md`](docs/rewards-store-frontend-spec.md) — single source of truth for routes, components, data models, theming, and roadmap.

### Tech Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS with custom gradients and glass surfaces
- Recommended libs: `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge` (install via `npm install framer-motion lucide-react clsx tailwind-merge`).

### Getting Started
```bash
npm install
npm run dev
# visit http://localhost:3000
```

### Next Steps
1. Apply the Tailwind theme described in the spec.
2. Build the shared layout (TopBar, Sidebar) and catalog page with mock data.
3. Clone patterns for Manage, Orders, and Perks pages, then prepare for Supabase integration.
