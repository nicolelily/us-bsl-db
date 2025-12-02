<!-- PR template for hybrid mobile nav reviewer checklist -->
# Reviewer checklist — Hybrid mobile navigation

Thanks for reviewing this PR. It adds a hybrid mobile navigation pattern: a fixed bottom tab bar for primary routes (Home, Map, Charts) and a Radix Dialog-based "More" drawer for secondary routes (About, Contact).

Quick test steps
- Run the app locally: `npm run dev` and open http://localhost:5173
- Use a mobile device emulator (Chrome/Firefox device toolbar or Safari Responsive Design Mode) or a real device on the same network.

Core checks
- [ ] Bottom tab bar is visible on small screens and contains Home, Map, Charts.
- [ ] Bottom tab bar is hidden on `/auth` (sign-in) route.
- [ ] Active tab shows a visible active state (color + optional background).
- [ ] Icons in the bottom bar are decorative (aria-hidden) and labels are present.

Drawer / "More" menu
- [ ] Hamburger (More) button visible in the header on mobile.
- [ ] Activating the button opens a bottom drawer dialog with About and Contact links.
- [ ] Dialog is announced to assistive tech (has Title and Description).
- [ ] Focus is trapped inside the dialog while open and restored to the trigger on close.
- [ ] Dialog closes on Escape and when clicking the overlay.

Accessibility and keyboard
- [ ] All interactive elements show a visible focus ring when keyboard-only navigating.
- [ ] Bottom nav links include `aria-current="page"` for the active route.
- [ ] Test with a screen reader (VoiceOver or NVDA/JAWS) to confirm dialog announcement and link names.

Visual / layout
- [ ] Bottom nav accounts for safe-area insets (iPhone home indicator) and does not obscure page content.
- [ ] Pages have bottom padding when mobile nav is present (no hidden content under nav).

Regression & misc
- [ ] Desktop navigation remains unchanged and still displays the full horizontal nav.
- [ ] No console errors or accessibility warnings in the browser devtools.
- [ ] Run `npm run lint` (if configured) to ensure no lint errors introduced.
- [ ] Database security reviewed (if DB affected): Verify Row Level Security is enabled (and forced where appropriate) on impacted tables. If needed, include a migration asserting `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` and `ALTER TABLE ... FORCE ROW LEVEL SECURITY;`.

Notes / follow-ups
- Consider adding automated a11y tests (axe) or end-to-end tests for keyboard/dialog behavior.
- If you want different hide/show behavior for other routes (e.g., hide on `/submit`), list them as requested changes.

If everything looks good, approve & merge. Attach a screenshot of mobile nav and the open More drawer (optional but helpful).
