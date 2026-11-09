"""Assembles the Figma import documents from the captured screens.

out/case-study.html  — the case study (one frame per section)
out/app-screens.html — every app screen as editable layers (one frame per screen)
Run after capturing screens:  python3 design/build.py
"""
import base64, glob, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
SCREENS = os.path.join(HERE, "screens")
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)

NAMES = {
    "01-splash": "Splash", "02-welcome": "Welcome", "03-choose-teacher": "Choose teacher", "04-meet-teacher": "Meet teacher",
    "05-daily-goal": "Daily goal", "06-home": "Home", "07-explore-course": "Explore · AI course", "08-explore-teachers": "Explore · Teachers",
    "09-teacher-profile": "Teacher profile", "10-lesson-intro": "Lesson · Intro", "11-lesson-experiment": "Lesson · Experiment",
    "12-lesson-predict": "Lesson · Predict", "13-lesson-check": "Lesson · Check + hint", "14-lesson-complete": "Lesson · Tale grows",
    "15-ask-teacher": "Ask the teacher", "16-journal": "Journal", "17-drawing-board": "Journal · Handwriting", "18-rewards-badges": "Rewards · Badges",
    "19-my-progress": "Rewards · My progress", "20-profile": "Profile & settings", "21-parent-dashboard": "Parent dashboard",
}
order = [k for k in NAMES if os.path.exists(os.path.join(SCREENS, k + ".html"))]

def img(name):
    p = os.path.join(SCREENS, name + ".png")
    if not os.path.exists(p):
        return ""
    return f'<img src="data:image/png;base64,{base64.b64encode(open(p, "rb").read()).decode()}" alt="{NAMES.get(name, name)}">'

LOGO = open(os.path.join(APP, "public", "icon.svg")).read()
def mark(size):
    return LOGO.replace("<svg ", f'<svg width="{size}" height="{size}" ', 1)

INK = "#1E1A2B"
BUBBLE = f'<svg width="96" height="96" viewBox="10 20 80 70"><path d="M24 26H76Q84 26 84 34V64Q84 72 76 72H44L30 84L32 72H24Q16 72 16 64V34Q16 26 24 26Z" fill="#fff" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/></svg>'
BOOK = f'<svg width="96" height="96" viewBox="24 32 52 38"><path d="M50 44Q40 37 28 40V62Q40 59 50 65Z" fill="#FFE2CC" stroke="{INK}" stroke-width="3.4" stroke-linejoin="round"/><path d="M50 44Q60 37 72 40V62Q60 59 50 65Z" fill="#FFD2B0" stroke="{INK}" stroke-width="3.4" stroke-linejoin="round"/></svg>'
SPARK = f'<svg width="96" height="96" viewBox="52 2 36 36"><path d="M70 6L73.5 16.5L84 20L73.5 23.5L70 34L66.5 23.5L56 20L66.5 16.5Z" fill="#FFD93D" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/></svg>'

# ---------- case study ----------
cs = open(os.path.join(HERE, "case-study.template.html")).read()
cs = re.sub(r"\{\{IMG:([a-z0-9-]+)\}\}", lambda m: img(m.group(1)), cs)
for n in (160, 150, 80):
    cs = cs.replace("{{LOGO_MARK_%d}}" % n, mark(n))
cs = cs.replace("{{BUBBLE}}", BUBBLE).replace("{{BOOK}}", BOOK).replace("{{SPARK}}", SPARK)
gal = os.path.join(SCREENS, "gallery.html")
gallery = open(gal).read() if os.path.exists(gal) else ""
# the gallery's own wrapper has inline flex styles; keep only the cards
m = re.match(r'^<div[^>]*>(.*)</div>$', gallery, re.S)
cs = cs.replace("{{GALLERY}}", m.group(1) if m else gallery)
cs = cs.replace("{{SCREEN_LIST}}", '<span class="arrow">→</span>'.join(f'<div class="step">{NAMES[k]}</div>' for k in order))
svgs = {m.group(1): m.group(0) for m in re.finditer(r'<svg[^>]*aria-label="Cartoon of ([^"]+)"[^>]*>.*?</svg>', gallery, re.S)}
def big(svg, w):
    return re.sub(r'width="[^"]*" height="[^"]*"', f'width="{w}" height="{int(w*1.25)}"', svg, count=1)
cast = ["Albert Einstein", "Marie Curie", "Alan Turing", "Leonardo da Vinci", "Steve Jobs", "Nikola Tesla"]
cs = cs.replace("{{COVER_CAST}}", "".join(big(svgs[n], 190) for n in cast if n in svgs))
cs = cs.replace('<link rel="stylesheet"', '<link rel="stylesheet"')
cs = cs.replace("</style>", '</style>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Caveat:wght@500;700&display=swap">', 1)
open(os.path.join(OUT, "case-study.html"), "w").write(cs)

# ---------- app screens (editable layers) ----------
css = "".join(open(f).read() for f in sorted(glob.glob(os.path.join(APP, "dist", "assets", "*.css"))))
shots = []
for k in order:
    html = open(os.path.join(SCREENS, k + ".html")).read()
    shots.append(f'<div class="shot" data-name="{NAMES[k]}">{html}</div>')
doc = f"""<!doctype html><html><head><meta charset="utf-8"><title>Champ app screens</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800;900&display=swap">
<style>{css}
html, body {{ height: auto !important; overflow: visible !important; background: #E9E2D8 !important; }}
body {{ display: flex; flex-wrap: wrap; gap: 80px; padding: 80px; width: 3600px; }}
.shot {{ width: 390px; height: 844px; position: relative; flex: none; }}
.shot > .device {{ position: relative !important; width: 390px !important; height: 844px !important; border-radius: 46px; overflow: hidden; box-shadow: none !important; }}
</style></head><body>{''.join(shots)}</body></html>"""
open(os.path.join(OUT, "app-screens.html"), "w").write(doc)

for f in ("case-study.html", "app-screens.html"):
    print(f, round(os.path.getsize(os.path.join(OUT, f)) / 1e6, 2), "MB", "screens:", len(order))
