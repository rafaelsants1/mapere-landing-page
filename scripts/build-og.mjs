// Imagem de compartilhamento 1200 x 630: assinatura "Mapere." sobre a maquete noturna.
import fs from 'node:fs';
import sharp from 'sharp';

const logo = JSON.parse(fs.readFileSync('src/data/logo.json', 'utf8'));
const W = 1200;
const H = 630;

const largura = 700;
const [, , vw, vh] = logo.viewBox.split(' ').map(Number);
const altura = (largura * vh) / vw;
const assinatura = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura.toFixed(1)}" viewBox="${logo.viewBox}"><g fill="#F3EDE2"><path d="${logo.simbolo48}"/>${logo.letras.map((d) => `<path d="${d}"/>`).join('')}</g><path fill="#F0641E" d="${logo.ponto}"/></svg>`;

const veu = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="v" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#17110E" stop-opacity=".94"/><stop offset=".62" stop-color="#17110E" stop-opacity=".78"/><stop offset="1" stop-color="#17110E" stop-opacity=".32"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#v)"/></svg>`;

await sharp('src/assets/higgsfield/maquete-recarga-geral-v2.png')
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .composite([
    { input: Buffer.from(veu) },
    { input: Buffer.from(assinatura), left: 72, top: Math.round((H - altura) / 2) },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og.jpg');

const kb = fs.statSync('public/og.jpg').size / 1024;
console.log(`og.jpg ${W}x${H} ${kb.toFixed(0)} KB`);
