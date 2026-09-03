# 🎨 Colors & Themes

PAWLSE employs a role-driven color palette and dual light/dark themes defined via modern CSS custom properties in `resources/css/app.css`.

---

## 🌈 Role & Dashboard Theme Colors

Each authenticated role has a dedicated visual theme applied using the `[data-dashboard-theme]` attribute:

| Portal | Theme Name | Primary Hex | Gradient / Shadow Hex |
|---|---|---|---|
| **Public Portal** | `paw-orange` | `#F59E0B` | `#FBBF24` (Amber/Orange) |
| **User Dashboard** | `user` | `#16a34a` | `#15803d` ➔ `#22c55e` (Forest Green) |
| **Volunteer Dashboard** | `volunteer` | `#00b4d8` | `#0096c7` ➔ `#48cae4` (Ocean Blue) |
| **Admin Dashboard** | `admin` | `#0d9488` | `#0f766e` ➔ `#14b8a6` (Deep Teal) |
| **Super Admin Dashboard**| `super-admin` | `#7c3aed` | `#6d28d9` ➔ `#c026d3` (Royal Purple) |

---

## 🎨 Semantic Color Tokens (Light vs. Dark)

| Semantic Token | Light Mode (HEX / CSS) | Dark Mode (OKLCH) | Usage |
|---|---|---|---|
| `--background` | `#F8FAFC` (Slate 50) | `oklch(0.145 0 0)` | Global page canvas background |
| `--foreground` | `#1F2937` (Gray 800) | `oklch(0.985 0 0)` | Primary body text and headers |
| `--card` | `#FFFFFF` | `oklch(0.145 0 0)` | Card containers and dialog boxes |
| `--border` | `#E2E8F0` (Slate 200) | `oklch(0.269 0 0)` | Borders, separators, and card outlines |
| `--muted` | `#F1F5F9` (Slate 100) | `oklch(0.269 0 0)` | Secondary pill backgrounds |
| `--muted-foreground` | `#64748B` (Slate 500) | `oklch(0.708 0 0)` | Subtitles, timestamp labels, help text |
| `--destructive` | `#FB7185` (Rose 400) | `oklch(0.396 0.141 25.723)` | Delete buttons, rejection badges, SOS alerts |

---

## 🌓 Dark Mode Implementation
- Controlled via `next-themes` and stored in the `appearance` cookie.
- Switching between `Light`, `Dark`, and `System` is managed dynamically by the `ThemeToggle` component.

---

## 🔗 Related Documentation
- [[Design System]]
- [[Typography]]
- [[Layouts]]
- [[Dashboard]]
