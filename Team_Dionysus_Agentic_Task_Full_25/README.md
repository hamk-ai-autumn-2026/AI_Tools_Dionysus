# Team Dionysus — Agentic AI Task (Assignment 25)

Full submission package for the Agentic AI assignment. Each team member used **Z.ai (GLM Agent)** to build a Nepal-themed wiki website, then captured a screenshot of the result.

## Team Members & Tasks

| # | Member | Wiki Site | Topic | Tool Used |
|---|--------|-----------|-------|-----------|
| 1 | Udit Bhattarai | SwarSansar — Nepali Music Wiki | Narayan Gopal (featured article) | Z.ai (GLM Agent) |
| 2 | Lotus Nyaupane | HimalRoute — Trekking Routes Guide | Everest Base Camp trek | Z.ai (GLM Agent) |
| 3 | Milan Khadka | MomoMandala — Nepali Food Wiki | Momo (featured dish) | Z.ai (GLM Agent) |
| 4 | Dipen Gaihre | Dharohar Archives — Kathmandu Heritage Wiki | Pashupatinath Temple | Z.ai (GLM Agent) |

## Folder Structure

```
.
├── Team_Dionysus_Agentic_Task_Report.docx   ← Final submission document (9 pages)
├── README.md                                 ← This file
├── screenshots/                              ← 4 screenshots (one per member, 1440×900)
│   ├── task1_udit_nepali_music_wiki.png
│   ├── task2_lotus_himalaya_trekking_guide.png
│   ├── task3_milan_nepali_cuisine_wiki.png
│   └── task4_dipen_kathmandu_heritage_wiki.png
└── sites/                                    ← 4 standalone HTML wiki websites
    ├── nepali-music-wiki.html
    ├── himalaya-trekking-guide.html
    ├── nepali-cuisine-wiki.html
    └── kathmandu-heritage-wiki.html
```

Each HTML file in `sites/` is **fully self-contained** (all CSS is inline — no build step, no dependencies, no internet needed).

---

## How to Open & Use in VS Code

### Step 1 — Unzip
Extract the ZIP anywhere on your computer, e.g. `Desktop\Team_Dionysus\`.

### Step 2 — Open the folder in VS Code
Two ways:
- **Menu:** VS Code → `File` → `Open Folder...` → select the extracted folder
- **Drag & drop:** drag the extracted folder onto the VS Code window

### Step 3 — View the wiki websites

**Option A (quickest):** In VS Code's Explorer (left sidebar), right-click any file in
`sites/` (e.g. `nepali-music-wiki.html`) → `Reveal in File Explorer` / `Reveal in Finder`
→ double-click it to open in your browser (Chrome/Edge/Firefox).

**Option B (Live preview inside VS Code — recommended):**
1. Click the **Extensions** icon in the left sidebar (or press `Ctrl+Shift+X`)
2. Search for **"Live Server"** (by Ritwick Dey) → click **Install**
3. Right-click any HTML file in `sites/` → **"Open with Live Server"**
4. The site opens in your browser and auto-reloads whenever you edit & save the file

**Option C (from terminal):**
1. Open VS Code's terminal: `` Ctrl+` `` (backtick)
2. Run one of:
   - Windows: `start sites\nepali-music-wiki.html`
   - macOS: `open sites/nepali-music-wiki.html`
   - Linux: `xdg-open sites/nepali-music-wiki.html`

### Step 4 — View the screenshots
Click any PNG in `screenshots/` — VS Code has a built-in image viewer.

### Step 5 — Edit the submission document
`Team_Dionysus_Agentic_Task_Report.docx` opens in Microsoft Word / Google Docs /
LibreOffice / WPS Office. In VS Code you can only view it as plain XML — for edits use Word.

**Tip:** Add your student IDs / section / course details to the cover page before submitting.

---

## How to Submit
1. Open the `.docx` → fill in any missing personal details
2. Attach/submit the `.docx` (it already contains all 4 screenshots embedded)
3. Keep the `sites/` folder in case your instructor wants to verify the live pages

## Tech Notes
- Sites: pure HTML5 + CSS3, responsive, no frameworks
- Report: generated with docx-js, Times New Roman, 1.5 line spacing
- Screenshots: 1440×900 viewport, browser-based capture
- Agent tool: Z.ai (GLM Agent)
