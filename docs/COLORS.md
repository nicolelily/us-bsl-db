# Color Reference

A catalog of every hex color used in the application, grouped by where it's defined and where it's consumed. Generated from a scan of `src/`, `tailwind.config.ts`, and `src/index.css`.

> **Note on themed colors:** The shadcn/ui design tokens (`--background`, `--primary`, `--border`, etc.) in `src/index.css:7-90` are defined in HSL space (no hex equivalents) and are not duplicated here. This document covers only the literal hex colors used in the codebase.

---

## Brand palette — `bsl` Tailwind namespace

Defined in `tailwind.config.ts:66-73`. Use as `bg-bsl-teal`, `text-bsl-brown`, etc.

| Token | Hex | Swatch | Usage |
|---|---|---|---|
| `bsl.teal` | `#7DCBC4` | ![#7DCBC4](https://placehold.co/15x15/7DCBC4/7DCBC4.png) | Primary brand teal. 18 uses across `Navigation.tsx`, `MobileBottomNav.tsx`, `Index.tsx`, `DataFilters.tsx`, etc. — buttons, active nav states, accents. |
| `bsl.brown` | `#5D2A1A` | ![#5D2A1A](https://placehold.co/15x15/5D2A1A/5D2A1A.png) | Dark brown headings/body text. 24 uses — the most-used brand token (`About.tsx`, `Contact.tsx`, `Stats.tsx`, contact subcomponents). |
| `bsl.cream` | `#F5F1E8` | ![#F5F1E8](https://placehold.co/15x15/F5F1E8/F5F1E8.png) | Warm card/section backgrounds. 6 uses (e.g. `Index.tsx`, `Contact.tsx`). |
| `bsl.orange` | `#D2691E` | ![#D2691E](https://placehold.co/15x15/D2691E/D2691E.png) | Defined but not currently referenced as a Tailwind class in `src/`. See chart-theme `accent` for inline equivalent. |
| `bsl.background` | `#F8FDFC` | ![#F8FDFC](https://placehold.co/15x15/F8FDFC/F8FDFC.png) | Page background tint. 2 uses. |
| `bsl.border` | `#B8E6E2` | ![#B8E6E2](https://placehold.co/15x15/B8E6E2/B8E6E2.png) | Light teal borders. 3 uses. |

## Brand palette — `dogdata` Tailwind namespace

Defined in `tailwind.config.ts:74-81`. Largely overlaps with `bsl.*` — these are semantic aliases that point at the same hexes.

| Token | Hex | Swatch | Aliases | Usage |
|---|---|---|---|---|
| `dogdata.blue` | `#7DCBC4` | ![#7DCBC4](https://placehold.co/15x15/7DCBC4/7DCBC4.png) | same as `bsl.teal` | 3 uses. |
| `dogdata.bluelight` | `#B8E6E2` | ![#B8E6E2](https://placehold.co/15x15/B8E6E2/B8E6E2.png) | same as `bsl.border` | 1 use. |
| `dogdata.accent` | `#5D2A1A` | ![#5D2A1A](https://placehold.co/15x15/5D2A1A/5D2A1A.png) | same as `bsl.brown` | not referenced directly. |
| `dogdata.background` | `#F8FDFC` | ![#F8FDFC](https://placehold.co/15x15/F8FDFC/F8FDFC.png) | same as `bsl.background` | 4 uses. |
| `dogdata.muted` | `#F5F1E8` | ![#F5F1E8](https://placehold.co/15x15/F5F1E8/F5F1E8.png) | same as `bsl.cream` | 2 uses. |
| `dogdata.text` | `#5D2A1A` | ![#5D2A1A](https://placehold.co/15x15/5D2A1A/5D2A1A.png) | same as `bsl.brown` | 17 uses — second most-used token overall. |

## Chart theme

Defined in `src/lib/chart-theme.ts`. Consumed by D3/Observable Plot/Recharts components.

| Role | Hex | Swatch | Used in |
|---|---|---|---|
| `primary` | `#7DCBC4` | ![#7DCBC4](https://placehold.co/15x15/7DCBC4/7DCBC4.png) | Chart primary series. Also hardcoded in `StatsComponent.tsx:52,66` and `DonutChart.tsx:39`. |
| `secondary` | `#5D2A1A` | ![#5D2A1A](https://placehold.co/15x15/5D2A1A/5D2A1A.png) | Chart secondary series. Also hardcoded in `StatsComponent.tsx:52` and `DonutChart.tsx:39`. |
| `accent` | `#D2691E` | ![#D2691E](https://placehold.co/15x15/D2691E/D2691E.png) | Chart accent. Also in `StatsComponent.tsx:52` color array. |
| `background.light` | `#FFFFFF` | ![#FFFFFF](https://placehold.co/15x15/FFFFFF/FFFFFF.png) | Light-mode chart background. |
| `background.dark` | `#1C1C1C` | ![#1C1C1C](https://placehold.co/15x15/1C1C1C/1C1C1C.png) | Dark-mode chart background. |
| `text.light` | `#374151` | ![#374151](https://placehold.co/15x15/374151/374151.png) | Light-mode chart text (Tailwind gray-700). |
| `text.dark` | `#E5E7EB` | ![#E5E7EB](https://placehold.co/15x15/E5E7EB/E5E7EB.png) | Dark-mode chart text (Tailwind gray-200). |
| `axis.light` | `#9CA3AF` | ![#9CA3AF](https://placehold.co/15x15/9CA3AF/9CA3AF.png) | Light-mode chart axes (Tailwind gray-400). |
| `axis.dark` | `#4B5563` | ![#4B5563](https://placehold.co/15x15/4B5563/4B5563.png) | Dark-mode chart axes (Tailwind gray-600). |

## Inline / one-off hexes

These are written as literal hex strings in component files rather than going through Tailwind tokens.

| Hex | Swatch | Location | Purpose |
|---|---|---|---|
| `#0d9488` | ![#0d9488](https://placehold.co/15x15/0d9488/0d9488.png) | `src/index.css:112` | Keyboard focus ring outline (Tailwind teal-600). The focus shadow at `src/index.css:118` uses the rgba form `rgba(13,148,136,0.25)`. |
| `#C5763D` | ![#C5763D](https://placehold.co/15x15/C5763D/C5763D.png) | `DataTable.tsx:67`, `MapComponent.tsx:30` | "Orange-ish" — active state in `DataTable`, BSL-status marker color on the map. Slightly different from `bsl.orange` (`#D2691E`). |
| `#b5662d` | ![#b5662d](https://placehold.co/15x15/b5662d/b5662d.png) | `DataTable.tsx:67` | Darker hover variant of `#C5763D`. |
| `#74CFC5` | ![#74CFC5](https://placehold.co/15x15/74CFC5/74CFC5.png) | `DataTable.tsx:69`, `MapComponent.tsx:32` | "Teal" — active button + map marker. Slightly different from `bsl.teal` (`#7DCBC4`). |
| `#5fb8ad` | ![#5fb8ad](https://placehold.co/15x15/5fb8ad/5fb8ad.png) | `DataTable.tsx:69` | Darker hover variant of `#74CFC5`. |
| `#ef4444` | ![#ef4444](https://placehold.co/15x15/ef4444/ef4444.png) | `MapComponent.tsx:28` | Destructive/red map marker (Tailwind red-500). |
| `#3b82f6` | ![#3b82f6](https://placehold.co/15x15/3b82f6/3b82f6.png) | `MapComponent.tsx:36` | Blue map marker (Tailwind blue-500). |
| `#6b7280` | ![#6b7280](https://placehold.co/15x15/6b7280/6b7280.png) | `MapComponent.tsx:34` | Gray map marker (Tailwind gray-500). |
| `#333` | ![#333333](https://placehold.co/15x15/333333/333333.png) | `DonutChart.tsx:105` | D3 label text fill. |
| `#fff` | ![#FFFFFF](https://placehold.co/15x15/FFFFFF/FFFFFF.png) | `DonutChart.tsx:58` | D3 arc stroke; also used as a recharts selector token in `ui/chart.tsx`. |
| `#ccc` | ![#CCCCCC](https://placehold.co/15x15/CCCCCC/CCCCCC.png) | `ui/chart.tsx:53` | Recharts default stroke matched via attribute selector (not a rendered color — used to override recharts defaults). |

## Legacy / unused

`src/App.css` still contains the default Vite + React template (`#646cffaa`, `#61dafbaa`, `#888`). It is imported by the app but the styles only apply to elements that don't exist in the current UI. Safe to delete if you want to clean it up.

---

## Quick observations

- `#7DCBC4` (brand teal) and `#5D2A1A` (brand brown) are the workhorses — together they cover ~60% of brand-token usage.
- `bsl.*` and `dogdata.*` are two names for the same palette. Consolidating to one namespace would simplify the design system but requires a codebase-wide rename.
- The map (`MapComponent.tsx`) and the data table active states use slightly off-brand variants (`#74CFC5`, `#C5763D`) instead of `bsl.teal` / `bsl.orange`. Worth aligning if pixel-perfect brand consistency matters.
- The focus-ring teal (`#0d9488`, Tailwind teal-600) does not match the brand teal (`#7DCBC4`). Intentional for WCAG contrast, but worth knowing.
