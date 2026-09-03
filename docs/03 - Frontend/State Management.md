# 🧠 State Management

PAWLSE adopts a **server-first, lightweight client-side state strategy** leveraging Inertia.js v3, React hooks, and localStorage / cookies.

---

## 🏗️ State Distribution Strategy

```mermaid
graph TD
    subgraph ServerDriven ["🌐 Server-Driven State (Inertia.js)"]
        PageProps["Page Props (Controller returned DTOs)"]
        SharedProps["Global Shared Props (auth, notifications, chrome)"]
        FlashState["Session Flash Messages (success, error, toast)"]
    end

    subgraph ClientComponentState ["⚛️ Component & Local State"]
        FormState["Inertia useForm (Form fields, validation, dirty state)"]
        UIState["React useState / useReducer (Modals, tabs, filters)"]
        CustomHooks["Custom Hooks (Notifications, Appearance, Clipboard)"]
    end

    subgraph PersistentState ["💾 Browser Persistence"]
        ThemeCookie["'appearance' Cookie (light / dark / system)"]
        SidebarCookie["'sidebar_state' Cookie (expanded / collapsed)"]
    end
```

---

## 🔍 State Management Layers

### 1. Page & Server Data (Inertia Props)
- Data is owned by the backend database and passed directly via Inertia page responses.
- Eliminates the need for client-side Redux/Zustand stores for caching relational entities.
- When an action is performed (e.g. approving an adoption), Laravel redirects back or to a new route, and Inertia automatically updates the relevant page props.

### 2. Form State (`useForm`)
- The `@inertiajs/react` `useForm` hook encapsulates form inputs, touched state, validation error bags, and submission status:
```tsx
const { data, setData, post, processing, errors, isDirty } = useForm({
    title: '',
    description: '',
});
```

### 3. Shared Global Notifications (`useDashboardNotifications`)
- Unread notifications and counts are passed in `HandleInertiaRequests` shared data.
- The `useDashboardNotifications` hook provides optimistic local marking-as-read and deletion actions while dispatching background PATCH/DELETE requests to `/account/notifications/*`.

### 4. Theme & Appearance (`useAppearance`)
- Manages switching between `light`, `dark`, and `system` modes.
- Synchronizes with a client cookie read by `HandleAppearance` middleware to prevent theme flickering on page refresh.

---

## 🔗 Related Documentation
- [[Inertia Architecture]]
- [[React Structure]]
- [[Components]]
- [[Design System]]
