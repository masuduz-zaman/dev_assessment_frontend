# DevAssess Web

Next.js 15 App Router + TypeScript + Tailwind + TanStack Query + Framer Motion + Recharts.

```
src/
  app/                    routes only - thin pages that render feature components
    (public)/             landing, assessments, jobs, companies, candidates, rankings, payment result
    (auth)/               login, register (split screen layout)
    (dashboard)/          admin/, company/, candidate/, notifications, payments (guarded shell)
    exam/[id]/            distraction-free exam runner
  features/<domain>/      api.ts (typed API client), types.ts, components
  components/
    ui/                   Button, Card, Badge, form fields, Modal, Tabs, DataTable, Skeleton, Avatar
    layout/               Navbar, Footer, DashboardShell, AuthGuard, UserMenu, NotificationBell
    motion/               FadeIn, Stagger, CountUp
    common/               PageHeader, QueryState (loading/error/empty), StatCard, SearchInput
  providers/              QueryProvider, AuthProvider (session, Google login)
  lib/                    http client (envelope unwrapping, error mapping), storage, utils
  hooks/  config/  types/
```

- All data comes from the API - including option lists (`/public/meta`), landing statistics, demo accounts and the Google client id. Nothing is hard-coded in components.
- Every list uses `QueryState` for consistent skeleton / error / empty states.
- Animations: page transitions, scroll reveals, staggered lists, animated counters, sliding tab/nav pills, floating hero cards, animated charts and modals.

```bash
npm install
cp .env.example   # API_URL
npm run dev
```
