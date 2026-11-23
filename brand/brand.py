import os, sys; sys.path.insert(0, os.path.dirname(__file__))
from glyphs import wordmark

PAL = dict(mar='#0E6B63', marDeep='#0B4F4A', noite='#0A2E2D', sol='#F4B13A', areia='#FAF8F3', marClaro='#6FD9CA', white='#FFFFFF')

# Símbolo: D (grelha 64) com contraperfuração; espessura uniforme 11; sol no miolo.
D_PATH = 'M12 14a4 4 0 0 1 4-4H30A22 22 0 0 1 30 54H16a4 4 0 0 1-4-4ZM23 23a2 2 0 0 1 2-2H30A11 11 0 0 1 30 43H25a2 2 0 0 1-2-2Z'
SUN = (32, 32, 6.6)
BOX = (12, 10, 40, 44)  # x,y,w,h do símbolo (tight)

def mark_inner(body, sun):
    cx, cy, r = SUN
    return f'<path fill="{body}" fill-rule="evenodd" d="{D_PATH}"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="{sun}"/>'

def mark_svg(body, sun, pad=0, bg=None, size=None):
    x, y, w, h = BOX
    vb = f'{x-pad} {y-pad} {w+2*pad} {h+2*pad}'
    sz = f' width="{size}" height="{size*(h+2*pad)/(w+2*pad):.0f}"' if size else ''
    rect = f'<rect x="{x-pad}" y="{y-pad}" width="{w+2*pad}" height="{h+2*pad}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"{sz} role="img" aria-label="Donza">{rect}{mark_inner(body, sun)}</svg>'

def lockup_parts(wght=700, gap=15):
    d, w, s, upm = wordmark(wght=wght)
    x0, y0, mw, mh = BOX
    # D: baseline em y=54 ; a linha de base do texto = 54 ; 'd' sobe 44 => topo = 10 (igual ao topo do D)
    tx = x0 + mw + gap
    return d, w, tx

def lockup_svg(body, sun, word, wght=700, gap=15, size_w=None):
    d, w, tx = lockup_parts(wght, gap)
    x0, y0, mw, mh = BOX
    total = (tx - x0) + w
    vb = f'{x0} {y0} {total:.2f} {mh}'
    base = y0 + mh
    sz = f' width="{size_w}"' if size_w else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"{sz} role="img" aria-label="Donza">'
            f'{mark_inner(body, sun)}<path fill="{word}" transform="translate({tx:.2f} {base})" d="{d}"/></svg>')

PADV = 1.5  # folga vertical para o overshoot das letras redondas

def lockup_svg2(body, sun, word, gap=15, size_w=None, bg=None, padx=0):
    d, w, tx = lockup_parts(700, gap)
    x0, y0, mw, mh = BOX
    total = (tx - x0) + w
    vb = f'{x0-padx:.2f} {y0-PADV-padx:.2f} {total+2*padx:.2f} {mh+2*PADV+2*padx:.2f}'
    base = y0 + mh
    sz = f' width="{size_w}"' if size_w else ''
    rect = f'<rect x="{x0-padx:.2f}" y="{y0-PADV-padx:.2f}" width="{total+2*padx:.2f}" height="{mh+2*PADV+2*padx:.2f}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"{sz} role="img" aria-label="Donza">{rect}'
            f'{mark_inner(body, sun)}<path fill="{word}" transform="translate({tx:.2f} {base})" d="{d}"/></svg>')

def stacked_svg(body, sun, word, size_w=None):
    d, w, tx = lockup_parts(700, 15)
    ms, ws = 1.5, 0.78
    W = max(w * ws, BOX[2] * ms) + 8
    mark_w, mark_h = BOX[2] * ms, BOX[3] * ms
    H = mark_h + 18 + 44 * ws + 2 * PADV
    mx = (W - mark_w) / 2
    wx = (W - w * ws) / 2
    base = mark_h + 18 + 44 * ws + PADV
    sz = f' width="{size_w}"' if size_w else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}"{sz} role="img" aria-label="Donza">'
            f'<g transform="translate({mx - BOX[0]*ms:.2f} {PADV - BOX[1]*ms:.2f}) scale({ms})">{mark_inner(body, sun)}</g>'
            f'<path fill="{word}" transform="translate({wx:.2f} {base:.2f}) scale({ws})" d="{d}"/></svg>')

def tile_svg(size=512, maskable=False, s=None):
    """Ícone de aplicação: base verde, D em areia, sol âmbar. Maskable = sangrado total, símbolo na zona segura."""
    P = PAL
    sc = s or (1.12 if maskable else 1.28)
    cx = cy = 50
    tx = cx - (BOX[0] + BOX[2] / 2) * sc
    ty = cy - (BOX[1] + BOX[3] / 2) * sc
    rx = 0 if maskable else 22
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="{size}" height="{size}" role="img" aria-label="Donza">'
            f'<rect width="100" height="100" rx="{rx}" fill="{P["mar"]}"/>'
            f'<g transform="translate({tx:.2f} {ty:.2f}) scale({sc})">{mark_inner(P["areia"], P["sol"])}</g></svg>')

HORIZON = None
def horizon_svg(w=800, h=400, colors=('#0E6B63', '#F4B13A'), opacity=(1, .62, .36, .2, .1)):
    """Dispositivo gráfico: anéis concentricos (o arco do D) a nascer de uma linha do horizonte, com o sol no centro."""
    cx, cy = w / 2, h
    ring_w, gap = h * 0.075, h * 0.05
    r = h * 0.2
    parts = [f'<circle cx="{cx}" cy="{cy}" r="{r:.1f}" fill="{colors[1]}"/>'] 
    for i, op in enumerate(opacity):
        r_out = r + gap + ring_w * (i + 1) + gap * i
        r_mid = r_out - ring_w / 2
        parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r_mid:.1f}" fill="none" stroke="{colors[0]}" stroke-width="{ring_w:.1f}" stroke-opacity="{op}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="Horizonte Donza">'
            f'<clipPath id="c"><rect width="{w}" height="{h}"/></clipPath><g clip-path="url(#c)">{"".join(parts)}</g></svg>')
