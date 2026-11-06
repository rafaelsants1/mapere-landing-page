// Extrai a sequência de quadros da abertura a partir do vídeo do Higgsfield.
// Desktop: ~120 quadros, largura nativa do vídeo (1364 px, abaixo do teto de 1920).
// Celular: ~60 quadros, recorte vertical que acompanha o posto pelo vídeo.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src/assets/higgsfield/maquete-aracaju-mergulho-6s.mp4';
const OUT = 'public/frames';
const DURACAO = 5.875;

function extrair(pasta, filtros, qualidade) {
  const dir = path.join(OUT, pasta);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', SRC,
    '-vf', filtros, '-c:v', 'libwebp', '-lossless', '0', '-q:v', String(qualidade),
    '-compression_level', '6', '-preset', 'photo', '-start_number', '0',
    path.join(dir, 'f%03d.webp'),
  ]);
  const arquivos = fs.readdirSync(dir);
  const total = arquivos.reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0);
  console.log(`${pasta}: ${arquivos.length} quadros, ${(total / 1048576).toFixed(2)} MB, primeiro ${(fs.statSync(path.join(dir, 'f000.webp')).size / 1024).toFixed(0)} KB`);
}

extrair('desktop', `fps=${(120 / DURACAO).toFixed(4)}`, 58);
// O recorte (492 x 768) começa com o posto a 42% e termina com posto e carro enquadrados.
extrair('celular', `crop=w=492:h=768:x='573*(1-n/140)':y=0,fps=${(60 / DURACAO).toFixed(4)}`, 66);
