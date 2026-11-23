# Gerador da marca Donza

O desenho oficial (símbolo, wordmark e variantes) é gerado por código, para que fique reproduzível e sem depender de fontes no cliente.

```bash
pip install fonttools brotli uharfbuzz
python3 brand/build_assets.py      # escreve brand/out/svg/*.svg e brand/out/ts/brand-paths.ts
```

- `brand.py`: geometria do símbolo (grelha de 64, espessura uniforme de 11, sol no miolo), lockups e dispositivo Horizonte.
- `glyphs.py`: extrai o contorno de "donza" (Outfit Bold, OFL, de `src/app/fonts/`) com kerning, via HarfBuzz.
- `build_assets.py`: escreve os SVG e as constantes de caminhos.

Depois de alterar o desenho, copie `brand/out/ts/brand-paths.ts` para `src/lib/brand-paths.ts` (web) e `src/common/brand/brand-paths.ts` (API, usado no certificado) e substitua os SVG de `public/brand/svg/`. Os PNG (ícones, imagem de partilha, logótipo de email) foram renderizados a partir destes SVG com Chromium.
