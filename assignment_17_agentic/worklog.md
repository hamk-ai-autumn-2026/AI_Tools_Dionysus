# Worklog — Assignment 17: Agentic Application Development (Team Dionysus)

App: "Dionysus" — cocktail & mocktail finder (Next.js 16 + TheCocktailDB API)
Report: PDF experience documentation (~1500 words) with model comparison table.

---
Task ID: 1
Agent: main (Z.ai GLM agent)
Task: Initialize fullstack environment

Work Log:
- Ran init-fullstack.sh; Next.js 16 + shadcn/ui project ready, dev server on :3000
- Verified TheCocktailDB API reachable from sandbox (curl 200, JSON OK)
- Plan: v1 baseline one-shot -> screenshot/critique -> v2 design system -> v3 animation polish -> PDF report

Stage Summary:
- Environment ready; data source confirmed live API

---
Task ID: 2
Agent: main (Z.ai GLM agent)
Task: Build v1 baseline one-shot + diagnose failure

Work Log:
- Wrote v1 page.tsx: client-side fetch to TheCocktailDB, plain Card grid (typical first prompt result)
- FAILURE #1 (authentic): v1 crashed on first render — Runtime TypeError "drinks.map is not a function"
- Root cause diagnosed via curl + agent-browser eval: TheCocktailDB returns {"drinks":"no data found"}
  (a truthy STRING, not null) for empty search queries; v1's `data.drinks || []` guard passes truthy
  strings through, so the string entered state and `.map()` crashed. Lesson: `||` is not a type guard.
- Fix: `Array.isArray(data.drinks) ? data.drinks : []`
- Screenshots: download/assets/v1-baseline.png (crash), v1-retry.png (repro)

Stage Summary:
- v1 failure documented with root cause; minimal patch applied next (v1-fixed), then full redesign in v2

---
Task ID: 3
Agent: main (Z.ai GLM agent)
Task: v2 full redesign + browser verification

Work Log:
- Added server API route /api/cocktails (search/lookup/random/browse) with 10-min in-memory cache;
  normalizes TheCocktailDB's "no data found" string to [] at the edge
- Redesigned UI: Dionysus dark wine/gold theme, serif display font (Georgia stack, no network dep),
  ambient glow background, gradient headline, Drink-of-the-Day hero card, curated classics grid
  (12 parallel cached fetches), category + zero-proof filters, favorites (localStorage + sonner toasts),
  detail modal with ingredients/measures/instructions, skeleton loaders, designed empty state,
  framer-motion entrance/layout animations, responsive 1-2-3-4 col grid, sticky header/footer
- Browser-verified: search "gin tonic" -> 1 result; modal shows Gin 4cl/Tonic 10cl + instructions;
  favorite toggle -> toast + badge count 1; gibberish search -> "Nothing in the cellar" empty state;
  mobile 390px renders single column with icon-only header
- Lint: 0 errors 0 warnings (after removing unused eslint-disable directives)
- Screenshots: v2-redesign.png, v2-modal.png, v2-emptystate.png, v2-mobile.png

Stage Summary:
- v2 fully functional and polished; found functional gap for v3: Favorites view intersects with
  current browse list only (old favorites invisible) -> fix in v3 along with hover pill + copy tweak

---
Task ID: 4
Agent: main (Z.ai GLM agent)
Task: v3 polish + final verification

Work Log:
- FIXED favorites-view bug: Favorites tab now renders from localStorage directly (survives across
  searches/sessions) instead of intersecting with current browse list
- Added: "View recipe" hover pill on cards, "/" keyboard shortcut to focus search (verified via
  activeElement check), aria-label on search, hero copy improved ("A new classic every day",
  "Chosen by fate today"), cleaned surpriseMe query reset
- Lint 0/0; "/" shortcut verified; favorites count persisted across reloads (badge=1 from earlier session)
- Final screenshots: v3-final-hero.png, v3-final-desktop.png, v3-final-full.png, v3-final-mobile.png

Stage Summary:
- App complete: 3 versions, 1 crash failure + 1 blank-void failure + 1 favorites bug — all documented
  with root causes. Ready for PDF report generation.

---
Task ID: 5
Agent: main (Z.ai GLM agent)
Task: PDF experience report

Work Log:
- Read full PDF skill chain: report.md + fonts.md + cover.md + palette.md + overflow.md + fill-engine.md + pagination.md
- palette.cascade generated (seed 17, minimal mode) for both ReportLab body and cover CSS
- Chapter numbering plan output (cover/TOC unnumbered; sections 1-7)
- Body: scripts/gen_body.py (TocDocTemplate + multiBuild, TOC gate, FreeSerif, install_font_fallback,
  CondPageBreak 25% threshold, safe_keep_together, Paragraph-only table cells, stat callout row,
  5 figures via fit_image + KeepTogether captions, roman TOC footer / arabic body footer)
- code.sanitize -> ran (8 pages) -> cover.html Template 01 HUD (grid bg 5%, 8px anchor line,
  kicker/hero/summary/meta/footer anchor drawers, palette --c-* vars)
- FAILURE (fixed): cover_validate.js flagged nested <span> in hero as text-text overlap -> removed
  span, single-block hero -> validators pass
- Rendered via html2poster.js --width 794px; merged via pypdf with normalize_page_to_a4
- FAILURE (fixed): pdf_qa page-size mismatch (cover 595.9pt vs A4 595.3pt, under 2pt threshold)
  -> tightened normalize threshold to 0.1pt -> re-merged -> QA pass
- meta.brand + pages.clean (0 blank) + font.check (0 issues) + toc.check (0 errors) + pdf_qa: PASS
  (1 warning: cover margin asymmetry = Template 01 by-design left anchor, permitted by overflow.md 1.5)
- Verified visually: rendered all 9 pages to PNG and inspected cover, body, figures, tables, last page

Stage Summary:
- FINAL DELIVERABLES:
  1. App: Dionysus cocktail finder (Next.js 16) running on :3000 (preview panel)
  2. PDF: /home/z/my-project/download/Assignment-17-Agentic-App-Development-Team-Dionysus.pdf
     (9 pages: cover + TOC + 7 body; ~1777 body words; 5 figures; 3 tables; 1 stat callout)
  3. Evidence screenshots: download/assets/ (v1 crash, v1-fixed blank, v2 redesign/modal/empty/mobile,
     v3 final hero/desktop/full)




