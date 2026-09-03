# 📱 Responsive Design

PAWLSE is designed mobile-first to ensure seamless operational usage on field smartphones (for volunteers and rescue reporters) as well as wide desktop monitors (for shelter administrators).

---

## 📐 Breakpoint Specifications

PAWLSE uses standard Tailwind CSS v4 responsive breakpoints:

| Breakpoint | Minimum Width | Typical Target Devices | Key Layout Adaptations |
|---|---|---|---|
| **`sm`** | `640px` | Large phones / small tablets | Single-column cards transition to 2-column grids |
| **`md`** | `768px` | Tablets / iPad portrait | Mobile drawer menu switches to horizontal nav; modal dialogs expand |
| **`lg`** | `1024px` | Laptops / Desktop screens | Collapsible dashboard sidebar un-docks to permanent left panel |
| **`xl`** | `1280px` | Large desktop displays | 3 to 4 column adoptable pet grids and multi-metric analytics charts |
| **`2xl`** | `1536px` | Ultra-wide monitors | Max-width content constraint (`max-w-7xl mx-auto`) |

---

## 📱 Mobile-First Field Optimizations

1. **Rescue Camera & Photo Upload**: Large tap targets and native camera access on iOS / Android for immediate stray photo capture.
2. **Interactive SOS Dispatch**: Floating emergency button accessible from any mobile screen.
3. **Collapsible Admin Navigation**: Off-canvas slide-out sheet (`Sheet` component from Radix) for full admin capabilities on mobile devices.
4. **Touch-Friendly Form Controls**: Native date pickers, thumb-friendly numeric keypads for OTP inputs, and swipeable adoption pet galleries.

---

## 🔗 Related Documentation
- [[Design System]]
- [[Colors & Themes]]
- [[Layouts]]
- [[Components|UI Components]]
