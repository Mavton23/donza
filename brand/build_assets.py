import sys, os, json; sys.path.insert(0, os.path.dirname(__file__))
from brand import *
OUT = os.path.join(os.path.dirname(__file__), 'out'); os.makedirs(f'{OUT}/svg', exist_ok=True); os.makedirs(f'{OUT}/ts', exist_ok=True)
P = PAL
def w(name, content): open(f'{OUT}/svg/{name}.svg', 'w').write(content)

# símbolo
w('donza-mark', mark_svg(P['mar'], P['sol']))
w('donza-mark-reverse', mark_svg(P['marClaro'], P['sol']))
w('donza-mark-mono-dark', mark_svg(P['noite'], P['noite']))
w('donza-mark-mono-white', mark_svg(P['white'], P['white']))
# horizontal
w('donza-logo', lockup_svg2(P['mar'], P['sol'], P['marDeep']))
w('donza-logo-reverse', lockup_svg2(P['marClaro'], P['sol'], P['white']))
w('donza-logo-mono-dark', lockup_svg2(P['noite'], P['noite'], P['noite']))
w('donza-logo-mono-white', lockup_svg2(P['white'], P['white'], P['white']))
# vertical
w('donza-logo-stacked', stacked_svg(P['mar'], P['sol'], P['marDeep']))
w('donza-logo-stacked-reverse', stacked_svg(P['marClaro'], P['sol'], P['white']))
# ícones
w('donza-app-icon', tile_svg())
w('donza-app-icon-maskable', tile_svg(maskable=True))
# dispositivo gráfico
w('donza-horizonte', horizon_svg())

# constantes para código (web + API)
d, wd, tx = lockup_parts(700, 15)
x0, y0, mw, mh = BOX
ts = f"""/** Gerado a partir do desenho oficial da marca. Não editar à mão. */
export const MARK_PATH = {json.dumps(D_PATH)};
export const MARK_SUN = {{ cx: {SUN[0]}, cy: {SUN[1]}, r: {SUN[2]} }};
export const MARK_BOX = {{ x: {x0}, y: {y0}, w: {mw}, h: {mh} }};
export const WORDMARK_PATH = {json.dumps(d)};
export const WORDMARK_WIDTH = {wd:.2f};
export const WORDMARK_X = {tx:.2f};
"""
open(f'{OUT}/ts/brand-paths.ts', 'w').write(ts)
print('ok', len(os.listdir(f'{OUT}/svg')), 'svgs; wordmark width', round(wd, 2), 'tx', round(tx, 2))
