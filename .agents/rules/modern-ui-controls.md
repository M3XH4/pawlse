# Modern UI Controls

When adding new features, pages, tabs, modals, or forms in `resources/js/`, always use the project's modern UI components instead of native HTML form controls:

- **Select / Dropdowns**: Use `ModernSelect` (`@/components/ui/modern-select`) instead of native `<select>`.
  - Use `size="sm"` for compact filter toolbars or dense modal grids, and `searchable={false}` when the option list is short (≤ 6 items).
  - Keep option labels clean and text-only (no emojis or gender/category icons inside `<ModernSelect>` options).
- **Date Inputs**: Use `ModernDatePicker` (`@/components/ui/modern-date-picker`) instead of `<input type="date">`.
- **Date-Time Inputs**: Use `ModernDateTimePicker` (`@/components/ui/modern-date-time-picker`) instead of `<input type="datetime-local">`.
- **Icons**: Use `lucide-react` icons instead of raw emojis or Unicode symbols across UI elements, badges, buttons, and labels (and keep `<ModernSelect>` option labels text-only).
- **Dashboard Tabs**: Active tabs should highlight via text and bottom-border color (`text-paw-orange border-paw-orange`), never by filling the tab background with orange on hover or click.
- **Dialogs & Alerts**: Never use native browser `alert()`, `confirm()`, `window.confirm()`, or `prompt()` in React components or dashboard pages. Always use `ConfirmationModal` (`@/components/ui/confirmation-modal`) with the `useConfirmationModal` hook (`@/hooks/use-confirmation-modal`), passing `hideCancel={true}` for single-button informational notices.
