"""Conserta o "Você" do começo do vídeo 06, sem gerar voz nova.

Nas quatro takes que começam com "[firm] Você chega" (as duas da narração e as duas do
teste de tom), a voz engole o "ocê": o reconhecimento de voz ouviu "V chega" em todas.
A linha 2 começa com "Você tenta de novo" depois de uma pausa, e ali o "Você" sai inteiro.

Este script monta a take C a partir da take A:
  [o "Você" da linha 2, de 3,400 a 3,640 s] + [a take A a partir de 0,165 s, o começo do "ch" de "chega"]
O primeiro corte cai no silêncio antes da linha 2, e o segundo no fim do "ê", antes do
fechamento do "t" de "tenta". O resto da take A fica igual, inclusive a linha 2.

Uso (na pasta do vídeo): python -I _fonte/emendar-voce.py
Depois: node _motor/narracao.mjs 06 c
"""

import json
import subprocess
from pathlib import Path

import numpy as np

TAXA = 48000
VOCE = (3.400, 3.640)   # "Você" da linha 2 na take A
CHEGA = 0.165           # começo do "ch" de "chega" na take A
ENTRA = 0.005           # rampa de entrada do "ch", contra estalo

pasta = Path(__file__).parent / "audio"
bruto = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", str(pasta / "narracao-take-a.mp3"), "-f", "s16le", "-ac", "1", "-ar", str(TAXA), "-"],
    capture_output=True, check=True).stdout
pcm = np.frombuffer(bruto, np.int16).astype(np.float32)

voce = pcm[int(VOCE[0] * TAXA):int(VOCE[1] * TAXA)].copy()
resto = pcm[int(CHEGA * TAXA):].copy()
n = int(ENTRA * TAXA)
resto[:n] *= np.linspace(0, 1, n)
novo = np.concatenate([voce, resto])
desloca = len(voce) / TAXA - CHEGA   # tempo novo = tempo antigo + desloca, do "chega" em diante

subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ac", "1", "-ar", str(TAXA), "-i", "-",
     "-c:a", "libmp3lame", "-b:a", "256k", str(pasta / "narracao-take-c.mp3")],
    input=np.clip(novo, -32768, 32767).astype(np.int16).tobytes(), check=True)

# Palavras: o "Você" da linha 1 passa a ter o tempo do "Você" da linha 2 (menos o início
# do trecho); do "chega" em diante, tudo anda junto.
palavras = json.loads((pasta / "narracao-take-a.palavras.json").read_text(encoding="utf8"))["words"]
faladas = [i for i, w in enumerate(palavras) if w["type"] == "word" and not w["text"].startswith("[")]
i_voce1, i_chega = faladas[0], faladas[1]
i_voce2 = next(i for i in faladas[2:] if palavras[i]["text"] == "Você")
saida = []
for i, w in enumerate(palavras):
    w = dict(w)
    if i < i_voce1:
        continue   # a marcação [firm] não é falada
    if i == i_voce1:
        w["start"] = round(palavras[i_voce2]["start"] - VOCE[0], 3)
        w["end"] = round(palavras[i_voce2]["end"] - VOCE[0], 3)
    elif i >= i_chega:
        w["start"] = round(w["start"] + desloca, 3)
        w["end"] = round(w["end"] + desloca, 3)
    else:
        continue
    saida.append(w)
(pasta / "narracao-take-c.palavras.json").write_text(json.dumps({"words": saida}, ensure_ascii=False), encoding="utf8")
print(f"take C: {len(novo) / TAXA:.3f} s; 'Você' da linha 2 ({VOCE[1] - VOCE[0]:.3f} s) no lugar do 'V'; resto da take A deslocado {desloca:+.3f} s")
