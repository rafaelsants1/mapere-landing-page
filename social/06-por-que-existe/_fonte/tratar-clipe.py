"""Limpa um clipe do Veo antes de ele virar fundo do vídeo 06.

Faz duas coisas, as duas opcionais:
- --poste x,y,w,h: na região dada, troca cada quadro pela mediana de 13 quadros
  vizinhos, com borda suave. Some com o que cai rápido (os riscos âmbar do poste,
  que podem ser lidos como faísca) e mantém o que está parado.
- --emblema quadro,x,y[,ini,fim]: segue o emblema do capô a partir de um quadro
  em que ele está visível e desfoca uma elipse em volta dele, em todos os quadros
  ou só de ini a fim (quando o carro vira e o emblema sai de vista). Com
  --busca, o passo por quadro cresce, para carro rápido. Com --elipse-fixa, a
  elipse fica do tamanho maior; sem ela, cresce com x, como no clipe 1, em que o
  carro vem da esquerda para perto.
- --tela x,y,w,h,quadro (pode repetir): mantém apagada a tela do carregador (ou
  outra luz que o Veo acendeu, como o anel do suporte do cabo). No retângulo da
  tela, o que ficou mais claro que no quadro de referência (tela apagada) e não
  tem tom de pele é trocado pelo pixel da referência. A mão, quente ou escura,
  fica. Só serve com a câmera parada.
- --led x,y,w,h (pode repetir): cobre um ponto pequeno, como o LED verde do
  suporte do cabo, com a cor média da borda em volta, em todos os quadros.

Uso: python -I tratar-clipe.py entrada.mp4 saida.mp4 [--poste ...] [--emblema ...] [--tela ...] [--led ...]
Precisa de ffmpeg, numpy e Pillow.
"""

import argparse
import json
import subprocess

import numpy as np
from PIL import Image, ImageFilter

RAIO_MEDIANA = 6          # 13 quadros
BORDA = 24                # px de transição suave na região do poste
MOLDE = (30, 20)          # largura e altura do molde do emblema
BUSCA = 10                # px de busca em cada direção, quadro a quadro
ELIPSE = (46, 30)         # tamanho da elipse desfocada no maior emblema


def info(caminho):
    saida = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,r_frame_rate",
         "-of", "json", caminho],
        capture_output=True, text=True, check=True).stdout
    s = json.loads(saida)["streams"][0]
    return int(s["width"]), int(s["height"]), s["r_frame_rate"]


def quadros(caminho, w, h):
    proc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", caminho, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE)
    tam = w * h * 3
    while True:
        buf = proc.stdout.read(tam)
        if len(buf) < tam:
            break
        yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    proc.wait()


def mascara_retangulo(w, h, borda):
    m = np.ones((h, w), np.float32)
    for i in range(borda):
        v = (i + 1) / (borda + 1)
        m[i, :] = np.minimum(m[i, :], v)
        m[h - 1 - i, :] = np.minimum(m[h - 1 - i, :], v)
        m[:, i] = np.minimum(m[:, i], v)
        m[:, w - 1 - i] = np.minimum(m[:, w - 1 - i], v)
    return m[..., None]


def seguir(cinzas, inicio, x0, y0, busca=BUSCA, ini=0, fim=None):
    """Centro do emblema em cada quadro de ini a fim, pela menor diferença quadrática."""
    mw, mh = MOLDE
    pos = [None] * len(cinzas)
    n = len(cinzas) if fim is None else fim + 1
    pos[inicio] = (x0, y0)

    def recorte(g, cx, cy):
        return g[cy - mh // 2: cy - mh // 2 + mh, cx - mw // 2: cx - mw // 2 + mw]

    for passo in (-1, 1):
        molde = recorte(cinzas[inicio], x0, y0).astype(np.float32)
        cx, cy = x0, y0
        vx = vy = 0   # último deslocamento: a busca parte de onde o carro deve estar
        f = inicio + passo
        while ini <= f < n:
            g = cinzas[f]
            px, py = cx + vx, cy + vy
            melhor = None
            for dy in range(-busca, busca + 1):
                for dx in range(-busca, busca + 1):
                    r = recorte(g, px + dx, py + dy).astype(np.float32)
                    if r.shape != molde.shape:
                        continue
                    d = float(((r - molde) ** 2).mean())
                    if melhor is None or d < melhor[0]:
                        melhor = (d, px + dx, py + dy)
            if melhor is None:   # saiu do quadro
                break
            _, nx, ny = melhor
            vx, vy = nx - cx, ny - cy
            cx, cy = nx, ny
            pos[f] = (cx, cy)
            # O molde muda aos poucos, porque o carro cresce ao se aproximar.
            molde = 0.5 * molde + 0.5 * recorte(g, cx, cy).astype(np.float32)
            f += passo
    return pos


def desfocar_elipse(q, cx, cy, ew, eh):
    # A caixa para na borda do quadro quando o carro está saindo.
    x0, y0 = max(0, cx - ew), max(0, cy - eh)
    x1, y1 = min(q.shape[1], cx + ew), min(q.shape[0], cy + eh)
    if x1 - x0 < 4 or y1 - y0 < 4:
        return
    pedaco = q[y0:y1, x0:x1]
    borrado = np.asarray(Image.fromarray(pedaco).filter(ImageFilter.GaussianBlur(max(3, ew // 6))))
    yy, xx = np.mgrid[y0:y1, x0:x1]
    d = ((xx - cx) / (ew / 2)) ** 2 + ((yy - cy) / (eh / 2)) ** 2
    a = np.clip(1.5 - d, 0, 1)[..., None]   # cheio dentro da elipse, some até 1,5x
    q[y0:y1, x0:x1] = (pedaco * (1 - a) + borrado * a).astype(np.uint8)


def apagar_tela(orig, ref, borda):
    """Troca por `ref` o que ficou mais claro que a tela apagada e não tem tom de pele."""
    o = orig.astype(np.float32)
    rf = ref.astype(np.float32)
    lum = lambda q: 0.3 * q[..., 0] + 0.59 * q[..., 1] + 0.11 * q[..., 2]
    mais_claro = lum(o) - lum(rf)
    quente = o[..., 0] - o[..., 2]   # pele na luz âmbar: R bem acima de B
    a = np.clip(mais_claro / 15, 0, 1) * np.clip((15 - quente) / 15, 0, 1)
    a = (a * borda)[..., None]
    return (o * (1 - a) + rf * a).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("saida")
    ap.add_argument("--poste")
    ap.add_argument("--emblema")
    ap.add_argument("--busca", type=int, default=BUSCA)
    ap.add_argument("--elipse-fixa", action="store_true")
    ap.add_argument("--tela", action="append", default=[])
    ap.add_argument("--led", action="append", default=[])
    ap.add_argument("--crf", default="14")
    a = ap.parse_args()

    w, h, fps = info(a.entrada)
    regiao = tuple(int(v) for v in a.poste.split(",")) if a.poste else None
    emb = tuple(int(v) for v in a.emblema.split(",")) if a.emblema else None
    telas = [tuple(int(v) for v in s.split(",")) for s in a.tela]
    leds = [tuple(int(v) for v in s.split(",")) for s in a.led]

    # Passada 1: guarda só o necessário (a região do poste, o quadro em cinza
    # e a tela apagada do quadro de referência).
    recortes, cinzas = [], []
    tela_refs = [None] * len(telas)
    for i, q in enumerate(quadros(a.entrada, w, h)):
        for k, (tx, ty, tw, th, tref) in enumerate(telas):
            if i == tref:
                tela_refs[k] = q[ty:ty + th, tx:tx + tw].copy()
        if regiao:
            rx, ry, rw, rh = regiao
            recortes.append(q[ry:ry + rh, rx:rx + rw].copy())
        if emb:
            cinzas.append(q.astype(np.float32).mean(axis=2).astype(np.uint8))
    n = max(len(recortes), len(cinzas))

    trilha = None
    if emb:
        ini, fim = (emb[3], emb[4]) if len(emb) == 5 else (0, None)
        trilha = seguir(cinzas, emb[0], emb[1], emb[2], a.busca, ini, fim)
        xs = [p[0] for p in trilha if p]
        xmin, xmax = min(xs), max(xs)

    pilha = np.stack(recortes) if regiao else None
    mascara = mascara_retangulo(regiao[2], regiao[3], BORDA) if regiao else None
    bordas_tela = [mascara_retangulo(t[2], t[3], 3)[..., 0] for t in telas]

    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{w}x{h}", "-r", fps, "-i", "-",
         "-c:v", "libx264", "-preset", "slow", "-crf", a.crf,
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.saida],
        stdin=subprocess.PIPE)

    # Passada 2: aplica as limpezas e grava.
    for i, q in enumerate(quadros(a.entrada, w, h)):
        q = q.copy()
        if regiao:
            rx, ry, rw, rh = regiao
            j0, j1 = max(0, i - RAIO_MEDIANA), min(n, i + RAIO_MEDIANA + 1)
            med = np.median(pilha[j0:j1], axis=0)
            orig = q[ry:ry + rh, rx:rx + rw].astype(np.float32)
            q[ry:ry + rh, rx:rx + rw] = (orig * (1 - mascara) + med * mascara).astype(np.uint8)
        for (tx, ty, tw, th, _), ref, borda in zip(telas, tela_refs, bordas_tela):
            q[ty:ty + th, tx:tx + tw] = apagar_tela(q[ty:ty + th, tx:tx + tw], ref, borda)
        for lx, ly, lw, lh in leds:
            moldura = q[ly - 2:ly + lh + 2, lx - 2:lx + lw + 2].reshape(-1, 3)
            dentro = np.zeros((lh + 4, lw + 4), bool)
            dentro[2:-2, 2:-2] = True
            q[ly:ly + lh, lx:lx + lw] = moldura[~dentro.ravel()].mean(axis=0).astype(np.uint8)
        if trilha and trilha[i]:
            cx, cy = trilha[i]
            # A elipse acompanha o carro: menor quando ele está longe.
            escala = 1.0 if a.elipse_fixa else 0.4 + 0.6 * (cx - xmin) / max(1, xmax - xmin)
            desfocar_elipse(q, cx, cy, int(ELIPSE[0] * escala), int(ELIPSE[1] * escala))
        enc.stdin.write(q.tobytes())

    enc.stdin.close()
    enc.wait()
    if trilha:
        with open(a.saida.rsplit(".", 1)[0] + ".trilha.json", "w") as f:
            json.dump(trilha, f)
    print(f"ok: {n} quadros em {a.saida}")


if __name__ == "__main__":
    main()
