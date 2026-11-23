"""Extrai o contorno de 'donza' (Outfit, OFL) com kerning, para um wordmark independente de fontes."""
import io, sys, json
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import uharfbuzz as hb

import os
SRC = os.path.join(os.path.dirname(__file__), '..', 'src', 'app', 'fonts', 'outfit-latin-wght-normal.woff2')

def wordmark(text='donza', wght=700, track=-0.015, target_asc=44.0):
    """Devolve (path_d, width, height_info) com origem na linha de base; escala para que o 'd' tenha target_asc unidades."""
    f = TTFont(SRC)
    f = instancer.instantiateVariableFont(f, {'wght': wght}, inplace=False)
    f.flavor = None
    buf = io.BytesIO(); f.save(buf); data = buf.getvalue()
    face = hb.Face(data); font = hb.Font(face)
    b = hb.Buffer(); b.add_str(text); b.guess_segment_properties()
    hb.shape(font, b, {'kern': True, 'liga': False})
    order = f.getGlyphOrder(); gs = f.getGlyphSet(); upm = f['head'].unitsPerEm
    # altura do 'd'
    bp = BoundsPen(gs); gs[f.getBestCmap()[ord('d')]].draw(bp); asc = bp.bounds[3]
    s = target_asc / asc
    x = 0.0; parts = []
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        name = order[info.codepoint]
        pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
        tp = TransformPen(pen, (s, 0, 0, -s, x + pos.x_offset * s, -pos.y_offset * s))
        gs[name].draw(tp)
        parts.append(pen.getCommands())
        x += (pos.x_advance + track * upm) * s
    x -= track * upm * s
    # bounds reais (esquerda do d, direita do a)
    return ' '.join(parts), x, s, upm

if __name__ == '__main__':
    d, w, s, upm = wordmark(wght=int(sys.argv[1]) if len(sys.argv) > 1 else 700)
    print(w, s, len(d))
