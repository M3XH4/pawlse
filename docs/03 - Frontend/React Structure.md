# ⚛️ React Structure

PAWLSE's client application is constructed using **React 19** with **TypeScript** and modular functional components.

---

## 📂 Source Code Layout (`resources/js/`)

```
resources/js/
├── actions/             # Wayfinder route action bindings
├── components/          # Reusable UI component library
│   ├── admin/           # Admin-specific navigation, headers, charts, shells
│   ├── dashboard/       # Dashboard widgets, theme toggles, notification menus
│   ├── ui/              # Radix UI primitives (Button, Dialog, Card, Input, etc.)
│   └── *.tsx            # Domain-specific components (AdoptionWizard, LiveMap, etc.)
├── hooks/               # Custom React hooks
├── layouts/             # Page layout wrappers (App, Dashboard, Admin, SuperAdmin, Auth)
├── pages/               # Routed Inertia page components
├── types/               # TypeScript interfaces & types
├── app.tsx              # Main Inertia application bootstrap
└── ssr.tsx              # Server-Side Rendering entrypoint (optional)
```

---

## 🧩 Component Design Principles

1. **Composition over Inheritance**: Complex pages are composed of modular UI building blocks located in `components/ui/` and feature-specific components.
2. **Prop Interface Definitions**: Every component explicitly defines its prop contract via TypeScript interfaces.
3. **Radix UI Primitives**: Accessible UI primitives (modals, dropdowns, tooltips, tabs) are headless and styled using Tailwind CSS classes.
4. **Motion Micro-Interactions**: Enhanced user experience with staggered entrances, card reveals, and button active states using `motion`.
5. **Separation of Concerns**: UI rendering is separated from backend communication; forms use Inertia's `useForm` hook while controllers supply initial props.

---

## 🔗 Related Documentation
- [[Inertia Architecture]]
- [[Pages]]
- [[Components]]
- [[Layouts]]
- [[TypeScript]]
- [[State Management]]
