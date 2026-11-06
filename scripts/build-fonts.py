"""Gera as fontes auto-hospedadas em public/fonts (woff2, subset latin).

Uso:  python scripts/build-fonts.py <pasta-com-os-ttf> (precisa de fonttools e brotli)

Bricolage Grotesque: peso 800 e largura 100 fixos, tamanho óptico variável.
Atkinson Hyperlegible Next: peso variável 400-800.
Atkinson Hyperlegible Mono: peso variável 400-500.
"""
import io
import pathlib
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Rafael\Downloads\refs-visuais-mapere\fontes-mapere")
MONO_SRC = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "data/fontes")
OUT = pathlib.Path("public/fonts")
OUT.mkdir(parents=True, exist_ok=True)

LATIN = (
    list(range(0x20, 0x7F)) + list(range(0xA0, 0x100))
    + [0x131, 0x152, 0x153, 0x2BB, 0x2BC, 0x2C6, 0x2DA, 0x2DC]
    + list(range(0x2000, 0x2070)) + [0x20AC, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2212, 0x2215, 0xFEFF, 0xFFFD]
)


def build(path, name, axes):
    font = TTFont(path)
    if axes:
        font = instancer.instantiateVariableFont(font, axes)
        buffer = io.BytesIO()
        font.save(buffer)
        buffer.seek(0)
        font = TTFont(buffer)
    options = subset.Options()
    options.layout_features = ["*"]
    options.flavor = "woff2"
    options.name_IDs = [1, 2, 3, 4, 6]
    options.notdef_outline = True
    options.hinting = False
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=LATIN)
    subsetter.subset(font)
    font.flavor = "woff2"
    target = OUT / f"{name}.woff2"
    font.save(target)
    print(f"{target}  {target.stat().st_size / 1024:.1f} KB")


build(SRC / "BricolageGrotesque[opsz,wdth,wght].ttf", "bricolage-grotesque-800", {"wght": 800, "wdth": 100})
build(SRC / "AtkinsonHyperlegibleNext[wght].ttf", "atkinson-hyperlegible-next", {"wght": (400, 800)})
build(MONO_SRC / "AtkinsonHyperlegibleMono[wght].ttf", "atkinson-hyperlegible-mono", {"wght": (400, 500)})
