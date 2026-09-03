# ⚛️ React Errors & Troubleshooting

Diagnostic guide for React 19, TypeScript, and UI component rendering issues.

---

# Problem: Hydration Mismatch / Theme Flicker

## Symptoms
Console warning: `Hydration failed because the initial UI does not match what was rendered on the server` or brief flash of light theme in dark mode.

## Cause
Theme state is read exclusively in `useEffect` on the client without matching server-rendered `data-theme` or cookie attributes.

## Solution
1. Use `useMounted` hook to gate theme-sensitive UI elements until client mount.
2. Ensure `HandleAppearance` middleware injects the correct theme class directly on the root `<html>` tag.

## Prevention
Avoid reading `window.matchMedia` or `localStorage` during initial server/client render passes.

## Related
* [[Colors & Themes]]
* [[Design System]]

---

# Problem: Radix UI Dialog / Dropdown Dismissal Bugs

## Symptoms
Clicking outside a modal does not close it, or keyboard `Escape` fails to dismiss dropdowns.

## Cause
Missing `<DialogOverlay>` or conflicting `pointer-events: none` on parent body elements.

## Solution
Ensure Radix primitives are wrapped in their corresponding `Portal` and `Overlay` containers, and check for backdrop pointer events.

## Prevention
Use the pre-built components in `resources/js/components/ui/` rather than re-implementing raw Radix primitives inline.

## Related
* [[Components|UI Components]]
* [[React Structure]]

---

# Problem: TypeScript Build Errors on Route Names

## Symptoms
`tsc --noEmit` fails with `Property 'route' does not exist on type 'Window'` or invalid action signatures.

## Cause
Wayfinder or Ziggy route type definitions have not been regenerated after modifying `routes/web.php`.

## Solution
Re-run Vite or type-check:
```bash
npm run dev
npm run types:check
```

## Prevention
Always run `npm run types:check` before committing route changes.

## Related
* [[TypeScript]]
* [[Routes]]
