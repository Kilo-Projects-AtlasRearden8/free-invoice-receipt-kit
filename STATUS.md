# STATUS

## What was built

Free Invoice & Receipt Kit — fillable, printable, no-account-needed small-business paperwork for freelancers and small businesses. Published by **Asdale Dynamics, LLC** (Indiana). Everything runs locally in the browser; no account, no signup, no network requests, no secrets or personal data.

Files:
- `LICENSE` — MIT License, copyright line exactly "Copyright (c) 2026 Asdale Dynamics, LLC"
- `README.md` — kit description, credits Asdale Dynamics, LLC, usage instructions, About section
- `STATUS.md` — this file
- `verify.js` — self-contained verification/test suite (536 checks, all passing)
- `styles.css` — shared screen + print styles (`@media print` hides controls, clean form output)
- `invoice.html` / `invoice.md` — invoice with client/business fields, line items, auto-calculating subtotal/tax/total, blank printable rows
- `receipt-log.html` / `receipt-log.md` — receipt log with running total, blank printable rows
- `mileage-tracker.html` / `mileage-tracker.md` — business mileage log with rate and deduction math, blank printable rows
- `expense-categories.html` / `expense-categories.md` — printable category reference + blank monthly category log

## How to run

1. Open the folder: `cd /workspace/kilo-lab/free-invoice-receipt-kit`
2. Open any `.html` file in a browser (Chrome, Firefox, Edge, Safari): double-click, or `open invoice.html` / `xdg-open invoice.html`
3. Fill fields on screen; totals calculate automatically. Print (`Ctrl+P` / `Cmd+P`) or "Save as PDF." Print styles strip buttons/controls so only the form prints. Blank rows print empty for handwriting.
4. Markdown (`.md`) files are plain-text copies printable from any Markdown renderer.
5. Run verification: `node verify.js`

No build step, no install, no account needed.

## Verification results

- `node verify.js`: **536/536 checks passed**
  - All 13 required files present
  - All 4 HTML files: valid DOCTYPE, html/head/body/title, charset meta, `styles.css` link, Asdale Dynamics, LLC credit, "no account" claim, balanced/closed tags
  - `LICENSE` contains exact line "Copyright (c) 2026 Asdale Dynamics, LLC" plus MIT grant and "AS IS" clause
  - `README.md` and all 4 `.md` files credit Asdale Dynamics, LLC
  - Calculation logic checks: money formatting, mileage formatting (no toString radix bug), invoice tax math, receipt total math
- Fixed prior bug: `mileage-tracker.html` used `toString(radix)` with radix 0/1 (throws RangeError); replaced with `String(miles)` / `miles.toFixed(1)`
- No lint/test toolchain beyond `verify.js` (static HTML/Markdown only). No `.github/workflows` added, per instructions.
- No git remotes, no push, no publish.

## Known gaps

- Calculations are client-side only. No server-side storage; data is lost on refresh unless printed/saved as PDF.
- HTML verified structurally (tag balance, required elements), not rendered in a browser or accessibility-audited beyond `for`/`id` label pairing.
- US-centric tax references (mileage rate default 0.70, tax year 2026) — marked "education only, not tax advice."
- No `.gitignore` (repo contains only source files; nothing build-generated).
- Blank rows print empty because browser placeholders do not print; this is intentional for handwriting.
