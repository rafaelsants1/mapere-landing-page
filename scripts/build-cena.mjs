// Gera as imagens da câmera da abertura a partir das maquetes do Higgsfield.
import fs from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/cena';
fs.mkdirSync(OUT, { recursive: true });

// O close saiu mais frio que a foto anterior: o ganho por canal aquece para a troca não aparecer.
const PLANOS = [
  { nome: 'geral', arquivo: 'geral-v2', ganho: [1, 1, 1] },
  { nome: 'meio', arquivo: 'meio-v2', ganho: [1, 1, 1] },
  { nome: 'perto', arquivo: 'perto-v3', ganho: [1.12, 0.98, 0.82] },
];

for (const { nome, arquivo, ganho } of PLANOS) {
  for (const largura of [1400, 2400]) {
    const destino = `${OUT}/${nome}-${largura}.webp`;
    await sharp(`src/assets/higgsfield/maquete-recarga-${arquivo}.png`)
      .resize(largura)
      .linear(ganho, [0, 0, 0])
      .webp({ quality: largura > 2000 ? 70 : 74, effort: 6 })
      .toFile(destino);
    console.log(destino, `${(fs.statSync(destino).size / 1024).toFixed(0)} KB`);
  }
}

// Versão sem foco da meia distância, para a troca de fotos parecer ajuste de lente.
const foco = `${OUT}/meio-foco-900.webp`;
await sharp('src/assets/higgsfield/maquete-recarga-meio-v2.png').resize(900).blur(3).webp({ quality: 60, effort: 6 }).toFile(foco);
console.log(foco, `${(fs.statSync(foco).size / 1024).toFixed(0)} KB`);
