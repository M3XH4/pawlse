# ⚡ Inertia Errors & Troubleshooting

Diagnostic guide for Inertia.js v3 client/server bridge issues, visit cancellations, and prop collisions.

---

# Problem: All Modals/Inputs Reset on Background Poll or Visit

## Symptoms
Typing into an active form gets wiped out when a background notification poll or page re-visit occurs.

## Cause
Full page prop replacement without preserving form state (`preserveState: true`).

## Solution
When triggering programmatic visits or form posts, include `preserveState` and `preserveScroll`:
```tsx
router.visit(route('account.admin.rescue-management'), {
    preserveState: true,
    preserveScroll: true,
    only: ['reports'],
});
```

## Prevention
Use Inertia's `useForm` hook for all forms, as it maintains its own encapsulated client-side state across re-renders.

## Related
* [[Inertia Architecture]]
* [[State Management]]

---

# Problem: File Uploads Fail Silently in `useForm`

## Symptoms
Pet photo uploads or document submissions send empty payloads or trigger validation errors despite files being selected.

## Cause
`useForm` requires `forceFormData: true` when submitting files via `router.post()` or binary FormData payloads.

## Solution
Ensure the file object is directly passed into `useForm` fields:
```tsx
const { data, setData, post } = useForm({
    image: null as File | null,
});

// Submit using post()
post(route('adopt.apply'), {
    forceFormData: true,
});
```

## Prevention
Verify that `<input type="file" onChange={(e) => setData('image', e.target.files?.[0] || null)} />` binds directly to the File object.

## Related
* [[Inertia Architecture]]
* [[Validation]]

---

# Problem: `Inertia::render()` Component Not Found

## Symptoms
Browser displays an error dialog: `Cannot find module './pages/some-page.tsx'` upon navigation.

## Cause
The path passed to `Inertia::render('some-page')` does not match the actual file name or casing in `resources/js/pages/`.

## Solution
Ensure the casing and relative path in `Inertia::render('admin/rescue-management')` match `resources/js/pages/admin/rescue-management.tsx`.

## Prevention
Check file paths in `resources/js/pages/` before referencing them in controllers.

## Related
* [[Pages]]
* [[Controllers]]
