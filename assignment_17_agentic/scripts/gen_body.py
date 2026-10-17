#!/usr/bin/env python3
"""Assignment 17 experience report - body PDF (ReportLab, TocDocTemplate)."""
import os
import sys
import hashlib

PDF_SKILL_DIR = '/home/z/my-project/skills/pdf'
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, 'scripts'))

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    Image, KeepTogether, CondPageBreak, HRFlowable,
)
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage

# ------------------------------------------------------------------ fonts ---
FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                   italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

from pdf import install_font_fallback  # noqa: E402
install_font_fallback()

# ------------------------------------------------------- cascade palette ----
PAGE_BG       = colors.HexColor('#f5f5f5')
SECTION_BG    = colors.HexColor('#edefef')
CARD_BG       = colors.HexColor('#e4e6e7')
TABLE_STRIPE  = colors.HexColor('#f1f2f3')
HEADER_FILL   = colors.HexColor('#435762')
COVER_BLOCK   = colors.HexColor('#5b727e')
BORDER        = colors.HexColor('#afc3ce')
ICON          = colors.HexColor('#326984')
ACCENT        = colors.HexColor('#1b6d96')
ACCENT_2      = colors.HexColor('#bc7157')
TEXT_PRIMARY  = colors.HexColor('#212324')
TEXT_MUTED    = colors.HexColor('#868c8f')
SEM_ERROR     = colors.HexColor('#a94b43')

# ------------------------------------------------------------- geometry -----
MARGIN = 0.9 * inch
PAGE_W, PAGE_H = A4
AVAIL_W = PAGE_W - 2 * MARGIN
AVAIL_H = PAGE_H - 2 * MARGIN
H1_THRESHOLD = AVAIL_H * 0.25
MAX_KEEP_HEIGHT = PAGE_H * 0.4
ASSETS = '/home/z/my-project/download/assets'
OUT = '/home/z/my-project/scripts/body.pdf'

DOC_TITLE = 'Assignment 17: Agentic Application Development - Experience Report'
DOC_AUTHOR = 'Team Dionysus'

# --------------------------------------------------------------- styles -----
body = ParagraphStyle('Body', fontName='FreeSerif', fontSize=10.5, leading=17,
                      alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
                      spaceBefore=0, spaceAfter=10)
h1 = ParagraphStyle('H1', fontName='FreeSerif', fontSize=22, leading=27,
                    textColor=TEXT_PRIMARY, spaceBefore=18, spaceAfter=4)
h2 = ParagraphStyle('H2', fontName='FreeSerif', fontSize=15, leading=20,
                    textColor=HEADER_FILL, spaceBefore=14, spaceAfter=8)
caption = ParagraphStyle('Caption', fontName='FreeSerif', fontSize=8.5, leading=12,
                         alignment=TA_CENTER, textColor=TEXT_MUTED,
                         spaceBefore=3, spaceAfter=6)
quote = ParagraphStyle('Quote', fontName='FreeSerif-Italic', fontSize=11, leading=17,
                       leftIndent=24, textColor=HEADER_FILL, spaceBefore=6, spaceAfter=6)
bullet = ParagraphStyle('Bullet', fontName='FreeSerif', fontSize=10.5, leading=17,
                        alignment=TA_LEFT, textColor=TEXT_PRIMARY,
                        leftIndent=14, spaceAfter=7)
th = ParagraphStyle('TH', fontName='FreeSerif', fontSize=9.5, leading=13,
                    textColor=colors.white, alignment=TA_LEFT)
td = ParagraphStyle('TD', fontName='FreeSerif', fontSize=9.5, leading=13.5,
                    textColor=TEXT_PRIMARY, alignment=TA_LEFT)
td_mono = ParagraphStyle('TDM', fontName='DejaVuSans', fontSize=8, leading=12,
                         textColor=TEXT_PRIMARY, alignment=TA_LEFT)
stat_big = ParagraphStyle('StatBig', fontName='FreeSerif', fontSize=20, leading=24,
                          textColor=ACCENT, alignment=TA_CENTER)
stat_lab = ParagraphStyle('StatLab', fontName='FreeSerif', fontSize=8.5, leading=11,
                          textColor=TEXT_MUTED, alignment=TA_CENTER)
toc_title = ParagraphStyle('TocTitle', fontName='FreeSerif', fontSize=20, leading=26,
                           textColor=TEXT_PRIMARY, spaceAfter=16)
toc_l0 = ParagraphStyle('TOC0', fontName='FreeSerif', fontSize=11.5, leading=20,
                        leftIndent=8, textColor=TEXT_PRIMARY)

# ------------------------------------------------------------ doc class -----
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

ROMAN = {1: 'i', 2: 'ii', 3: 'iii', 4: 'iv', 5: 'v'}

def on_page(canvas, doc):
    canvas.saveState()
    if doc.page == 1:
        # TOC page: roman numeral footer, no header rule
        canvas.setFont('FreeSerif', 9)
        canvas.setFillColor(TEXT_MUTED)
        canvas.drawCentredString(PAGE_W / 2, 0.5 * inch, ROMAN.get(doc.page, 'i'))
    else:
        # header: doc title left + accent rule
        canvas.setFont('FreeSerif', 7.5)
        canvas.setFillColor(TEXT_MUTED)
        canvas.drawString(MARGIN, PAGE_H - 0.55 * inch, DOC_TITLE)
        canvas.setStrokeColor(ACCENT)
        canvas.setLineWidth(1.2)
        canvas.line(MARGIN, PAGE_H - 0.62 * inch, PAGE_W - MARGIN, PAGE_H - 0.62 * inch)
        # footer: author left + arabic page number right, light rule above
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, 0.62 * inch, PAGE_W - MARGIN, 0.62 * inch)
        canvas.setFont('FreeSerif', 7.5)
        canvas.setFillColor(TEXT_MUTED)
        canvas.drawString(MARGIN, 0.45 * inch, DOC_AUTHOR)
        canvas.drawRightString(PAGE_W - MARGIN, 0.45 * inch, str(doc.page - 1))
    canvas.restoreState()

# -------------------------------------------------------------- helpers -----
def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def h1_block(num, title, first_para):
    """H1 with accent underline rule + orphan prevention + keep with first paragraph."""
    head = add_heading('%d. %s' % (num, title), h1, level=0)
    rule = HRFlowable(width='100%', color=ACCENT, thickness=1.2,
                      spaceBefore=0, spaceAfter=10)
    return [CondPageBreak(H1_THRESHOLD),
            KeepTogether([head, rule, Paragraph(first_para, body)])]

def safe_keep_together(elements):
    total_h = 0
    for el in elements:
        w, hgt = el.wrap(AVAIL_W, PAGE_H)
        total_h += hgt
    if total_h <= MAX_KEEP_HEIGHT:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)

def fit_image(img_path, max_w, max_h):
    pil = PILImage.open(img_path)
    ow, oh = pil.size
    ratio = min(max_w / ow, max_h / oh, 1.0)
    return Image(img_path, width=ow * ratio, height=oh * ratio)

def figure(path, cap, max_h=300):
    img = fit_image(path, AVAIL_W * 0.92, max_h)
    img.hAlign = 'CENTER'
    return [Spacer(1, 10), KeepTogether([img, Paragraph(cap, caption)]), Spacer(1, 8)]

def make_table(header, rows, ratios, mono_cols=()):
    col_widths = [r * AVAIL_W * 0.98 for r in ratios]
    assert sum(col_widths) <= AVAIL_W + 0.5
    data = [[Paragraph('<b>%s</b>' % c, th) for c in header]]
    for row in rows:
        cells = []
        for i, c in enumerate(row):
            cells.append(Paragraph(c, td_mono if i in mono_cols else td))
        data.append(cells)
    t = Table(data, colWidths=col_widths, hAlign='CENTER', repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for r in range(1, len(data)):
        style.append(('BACKGROUND', (0, r), (-1, r),
                      TABLE_STRIPE if r % 2 == 1 else colors.white))
    t.setStyle(TableStyle(style))
    return t

def stat_row(stats):
    cw = AVAIL_W * 0.96 / len(stats)
    data = [[Paragraph('<b>%s</b>' % v, stat_big) for v, _ in stats],
            [Paragraph(l, stat_lab) for _, l in stats]]
    t = Table(data, colWidths=[cw] * len(stats), hAlign='CENTER')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, ACCENT),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 10),
        ('LINEAFTER', (0, 0), (-2, -1), 0.5, BORDER),
    ]))
    return t

# ---------------------------------------------------------------- story -----
story = []

# --- TOC page (front matter, roman numeral) ---
story.append(Paragraph('<b>Table of Contents</b>', toc_title))
toc = TableOfContents()
toc.levelStyles = [toc_l0]
story.append(toc)
story.append(PageBreak())

# =========================================================== Section 1 ======
story.extend(h1_block(1, 'The Task and the Tool',
    'For Assignment 17 we used an agentic coding tool in full automatic mode to build a '
    'web application from scratch: <b>Dionysus</b>, a cocktail and mocktail recipe finder '
    'named after our team. The agent ran end-to-end in one session: it planned the work, '
    'wrote every file, started the dev server, inspected its own output in a headless '
    'browser, took screenshots, diagnosed failures, and iterated until the result was '
    'polished. The tool was the Z.ai agentic coding agent (GLM model), driving a '
    'Next.js 16 + TypeScript stack with the shadcn/ui component library, Tailwind CSS 4, '
    'and Framer Motion, against the public TheCocktailDB API.'))
story.append(Paragraph(
    'We deliberately did not accept the first output. The assignment warns against '
    'being happy with one-shotting, so we treated the first generation as a baseline '
    'artifact to be critiqued, broken, and rebuilt. The session produced four shipped '
    'versions (v1 crash, v1-fixed, v2 redesign, v3 polish) and the numbers below '
    'summarise what happened along the way.', body))
story.append(Spacer(1, 8))
story.append(stat_row([
    ('4', 'versions shipped'),
    ('2', 'crash-level failures'),
    ('9', 'prompts / directives'),
    ('3', 'defects caught by browser testing'),
]))
story.append(Spacer(1, 14))

# =========================================================== Section 2 ======
story.extend(h1_block(2, 'First Attempt: the One-Shot Crash',
    'The opening directive was intentionally minimal, the way many developers actually '
    'start with an agent: <i>"Build a cocktail finder app with search. Use TheCocktailDB '
    'API. Show results as cards."</i> The agent produced a single-file React page in '
    'seconds: a search input, a three-column card grid, and a fetch straight to the API '
    'from the client. The code compiled without a single warning, and the dev server '
    'answered with HTTP 200. By every shallow signal, the one-shot had succeeded.'))
story.append(Paragraph(
    'It had not. The first browser render crashed with <b>Runtime TypeError: '
    '"drinks.map is not a function"</b>. The root cause is instructive. For an empty '
    'search query, TheCocktailDB does not return an empty array or null; it returns the '
    'JSON string <font name="DejaVuSans" size="8">{"drinks":"no data found"}</font>. '
    'The generated guard <font name="DejaVuSans" size="8">setDrinks(data.drinks || [])</font> '
    'only filters falsy values, and the string "no data found" is truthy, so it flowed '
    'straight into state and blew up when React tried to map it. A truthy value of the '
    'wrong type defeated the guard entirely.', body))
story.append(Spacer(1, 6))
story.extend(figure(f'{ASSETS}/v1-baseline.png',
    'Figure 1: v1 as generated by the first prompt - the one-shot compiled cleanly but '
    'crashed on first render with a TypeError.', 270))
story.append(Paragraph(
    'The agent verified the diagnosis independently: it replayed the request with curl '
    'and again inside the browser context, confirmed the response shape, and only then '
    'patched the code. The lesson generalises: when an agent trusts an undocumented API '
    'shape, a failure belongs to the prompt as much as to the code - nobody had asked '
    'the agent to test edge-case responses.', body))

# =========================================================== Section 3 ======
story.extend(h1_block(3, 'Second Iteration: Working but Unacceptable',
    'A one-line fix (<font name="DejaVuSans" size="8">Array.isArray(data.drinks) ? '
    'data.drinks : []</font>) made the app render, and the second screenshot exposed a '
    'different, slower failure. The page was a blank white void: the empty initial '
    'search returned zero results and the UI showed nothing at all - no guidance, no '
    'empty state, no hint that anything was possible. Nothing on screen said '
    '"Dionysus" or suggested that cocktails were involved.'))
story.extend(figure(f'{ASSETS}/v1-fixed.png',
    'Figure 2: v1-fixed no longer crashes, but a functional app with an empty grid is '
    'still a failed first impression.', 260))
story.append(Paragraph(
    'The critique that follows is the agent reviewing its own baseline the way a '
    'senior reviewer would, and it matches the assignment\'s demand for polished UI '
    'over one-shot output:', body))
story.append(Spacer(1, 4))
t = make_table(
    ['Deficiency', 'Why it matters'],
    [
        ['Blank void on empty search', 'Zero guidance; the user sees an abandoned page instead of an invitation'],
        ['Default white/black theme', 'No brand identity; nothing distinguishes the product from a tutorial'],
        ['Text-only cards, no images', 'A drink app is a visual product; photos carry the desire'],
        ['Fixed 3-column grid', 'Breaks on mobile; no responsive breakpoints at all'],
        ['"Loading..." text', 'No skeletons; layout jumps when data arrives'],
        ['No detail view', 'Recipes (ingredients, measures, instructions) were unreachable'],
        ['No favorites or filters', 'No persistence, no way to narrow a hundred results'],
        ['Search button only', 'No debounce, no Enter key, no clear button'],
    ],
    [0.34, 0.66])
story.extend(safe_keep_together([t, Paragraph('Table 1: UI deficiencies found in the v1-fixed baseline.', caption)]))

# =========================================================== Section 4 ======
story.extend(h1_block(4, 'Third Iteration: the Full Redesign',
    'The redesign directive abandoned incremental patching: <i>"Redesign completely as a '
    'dark, premium Dionysus theme. Wine and gold palette, serif display typography, '
    'ambient glows. Add a server-side API route with caching, a curated classics grid, '
    'a deterministic drink-of-the-day hero, category and zero-proof filters, favorites '
    'with toasts, a detail modal with ingredients and measures, skeleton loaders, and a '
    'designed empty state. Verify every flow in the browser."</i> The specificity paid '
    'off: one iteration produced the complete redesign.'))
story.append(Paragraph(
    'Three architectural decisions mattered. First, all API access moved behind a '
    'Next.js route handler with a 10-minute in-memory cache, and the response shape is '
    'normalised to an array at the edge - the crash class from section 2 is now '
    'impossible for the client to hit. Second, the initial experience fetches twelve '
    'curated classics in parallel, so the app always opens on a full, beautiful grid '
    'instead of an empty state. Third, favorites persist in localStorage through a '
    'single guarded accessor.', body))
story.extend(figure(f'{ASSETS}/v2-redesign.png',
    'Figure 3: v2 redesign - Dionysus theme, curated classics, drink-of-the-day hero, '
    'filters and favorites.', 330))
story.append(Paragraph(
    'Browser verification was part of the iteration, not an afterthought. The agent '
    'drove a headless browser through the golden path and captured evidence for each '
    'flow: searching "gin tonic" returned one matching card; opening it showed Gin '
    '4 cl, Tonic Water 10 cl, Lemon Peel and Ice with measures plus the mixing '
    'instructions; tapping the heart raised the favorites badge and fired a toast; and '
    'a gibberish query produced the designed empty state instead of a blank page.', body))
story.extend(figure(f'{ASSETS}/v2-modal.png',
    'Figure 4: the detail modal verified in-browser - ingredients with measures and '
    'instructions render from the lookup endpoint.', 260))

# =========================================================== Section 5 ======
story.extend(h1_block(5, 'Fourth Iteration: Polish and a Real Bug',
    'The polish pass combined self-review with interaction testing, and it caught the '
    'most subtle defect of the session: the Favorites view intersected saved drinks '
    'with the currently loaded list, so anything favorited in an earlier session '
    'silently disappeared. Unit-visible, browser-caught, and exactly the kind of bug '
    'that survives compilation. The fix renders favorites from storage directly, '
    'making them survive searches and sessions.'))
story.append(Paragraph(
    'The same pass added the micro-interactions that separate a demo from a product: '
    'a "View recipe" pill that rises from the card image on hover, a "/" keyboard '
    'shortcut that focuses search, an accessible aria-label on the input, sharper hero '
    'copy ("A new classic every day", "Chosen by fate today"), and a cleanup of a '
    'sloppy state reset flagged by lint. Final verification confirmed the shortcut, '
    'the persisted favorites badge across reloads, and a clean mobile layout at 390 px '
    'with an icon-only header.', body))
story.extend(figure(f'{ASSETS}/v3-final-hero.png',
    'Figure 5: v3 final hero - gradient display type, drink-of-the-day card, and the '
    'keyboard hint in the search placeholder.', 280))

# =========================================================== Section 6 ======
story.extend(h1_block(6, 'Strategy Comparison and Failure Analysis',
    'Every prompt in this session drove the same model - the Z.ai agent on GLM - so '
    'the honest comparison is between prompting strategies, not vendor logos. The '
    'pattern was consistent: the vague prompt produced the most code in the least '
    'time and the worst defect; the structured redesign prompt produced the largest '
    'quality jump; and the incremental polish prompts produced the smallest but '
    'highest-trust changes. Capability was never the bottleneck - specification was.'))
t = make_table(
    ['#', 'Strategy / prompt style', 'Result'],
    [
        ['P1', 'Vague one-shot: "Build a cocktail finder with search, use TheCocktailDB, show cards"',
         'Failed: compiled but crashed on first render (wrong type into state)'],
        ['P2', 'Minimal fix request: keep v1, patch the crash',
         'Worked, but exposed the blank-void UX failure; fix was one line'],
        ['P3', 'Structured redesign: named palette, typography, 9 features, verification mandate',
         'One iteration to demo-quality; design system + API route + full flows'],
        ['P4', 'Critique-driven polish: fix favorites bug, add hover pill, "/" shortcut, copy edits',
         'Small diffs, lint-clean, all verified in browser'],
    ],
    [0.07, 0.48, 0.45])
story.extend(safe_keep_together([t, Paragraph('Table 2: Prompt-strategy comparison within one agent (Z.ai GLM, full-auto).', caption)]))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'The failures deserve their own ledger, because each one has a distinct root cause '
    'and a transferable lesson. Notably, none of the three defects would have been '
    'caught by reading the code: all three required executing the app and looking at '
    'it, which is precisely what an agent in full-auto mode can do that a one-shot '
    'code generator cannot.', body))
t = make_table(
    ['Failure', 'Root cause', 'Fix and lesson'],
    [
        ['Crash: drinks.map is not a function',
         'API returns the string "no data found" for empty queries; the || guard passes truthy strings through',
         'Array.isArray normalisation at the API edge; validate external data shapes, never trust them'],
        ['Blank void on load',
         'No empty state was requested; the agent optimised for the happy path only',
         'Designed empty state with recovery actions; specify the zero-results experience explicitly'],
        ['Favorites vanished between sessions',
         'Favorites view derived from the current browse list instead of storage',
         'Render from localStorage directly; browser-test state that outlives a page'],
    ],
    [0.26, 0.40, 0.34])
story.extend(safe_keep_together([t, Paragraph('Table 3: Failure taxonomy with root causes and lessons.', caption)]))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The || operator guards against absence, not against the wrong type.',
    quote))

# =========================================================== Section 7 ======
story.extend(h1_block(7, 'Lessons Learned',
    'Working with an agentic tool in full-automatic mode changed where our effort '
    'went. We wrote almost no code by hand; we spent that budget on specification, '
    'critique, and verification instead. The specific takeaways:'))
for item in [
    '<b>One-shotting is a mirage.</b> The v1 baseline compiled cleanly, served HTTP 200, '
    'and still crashed on its first real render. "It compiles" and "the server is up" '
    'are not evidence of a working product.',
    '<b>Vague prompts are expensive.</b> The cheapest-looking prompt produced the most '
    'expensive defect. Every hour the vague prompt saved was repaid with debugging '
    'interest during verification.',
    '<b>Specific design language beats adjectives.</b> Naming the palette, typography, '
    'features, and the verification mandate produced demo-quality UI in one iteration; '
    'asking for a "nice design" would not have.',
    '<b>Make the agent prove it.</b> Screenshots, console checks, interaction tests and '
    'mobile viewports caught three defects that code review would have missed.',
    '<b>Prompts are specs for failure modes too.</b> Empty results, session persistence, '
    'and untrusted API shapes all failed precisely where the prompt had said nothing.',
]:
    story.append(Paragraph('•  ' + item, bullet))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'The final application is genuinely shippable: a themed, responsive, animated '
    'recipe finder with search, caching, favorites, detail views, and designed '
    'failure states, delivered in four iterations with every core flow verified in '
    'the browser. The difference between the v1 crash and the v3 product is not '
    'model capability - it is the discipline of iteration that this assignment '
    'asked us to practice.', body))

# ----------------------------------------------------------------- build ----
doc = TocDocTemplate(
    OUT, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN, topMargin=MARGIN, bottomMargin=MARGIN,
    title=DOC_TITLE, author='Z.ai', creator='Z.ai',
    subject='Experience report on agentic application development - Team Dionysus',
)
doc.multiBuild(story, onFirstPage=on_page, onLaterPages=on_page)
print('body pages:', doc.page)
print('OK ->', OUT)
