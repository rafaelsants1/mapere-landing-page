// Abre a cena de um vídeo (social/NN-.../_fonte/cena.html) no Edge do sistema e espera
// ela ficar pronta. Base de quadros.mjs, renderizar.mjs e capa.mjs.
// Veio do vídeo 03; agora serve a qualquer vídeo da série.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const motor = dirname(fileURLToPath(import.meta.url));
export const LARGURA = 1080;
export const ALTURA = 1920;

// Zona segura, em pixels a partir de cada borda. Medida em 2026-11-11 nas capturas do
// vídeo 02 publicado (TikTok e Instagram, iPhone). Ver a memória "zona segura dos Reels".
export const ZONA = { topo: 220, base: 480, direita: 180, esquerda: 110 };

// playwright-core já está instalado na pasta do post 01.
const require = createRequire(join(motor, '..', '01-apresentacao', '_fonte', 'package.json'));
const { chromium } = require('playwright-core');

// Pasta do vídeo a partir do 1º argumento: "04", "04-video-4-status" ou um caminho.
export function pastaDoVideo(arg) {
  if (!arg) throw new Error('Diga o vídeo: node _motor/<script>.mjs 04 ...');
  const social = join(motor, '..');
  if (existsSync(resolve(arg, '_fonte'))) return resolve(arg);
  const { readdirSync } = require('node:fs');
  const achou = readdirSync(social).find((n) => n === arg || n.startsWith(`${arg}-`));
  if (!achou) throw new Error(`Não achei o vídeo "${arg}" em social/.`);
  return join(social, achou);
}

export function lerRoteiro(video) {
  return JSON.parse(readFileSync(join(video, '_fonte', 'roteiro.json'), 'utf8'));
}

// "nome+0.3" ou "nome-0.2" ou um número, resolvido nas marcas da cena.
export function instante(expr, marcas) {
  if (typeof expr === 'number') return expr;
  const m = String(expr).match(/^([A-Za-z_][\w]*)\s*([+-]\s*\d+(?:\.\d+)?)?$/);
  if (!m || !(m[1] in marcas)) throw new Error(`Instante "${expr}" não bate com nenhuma marca.`);
  return marcas[m[1]] + (m[2] ? Number(m[2].replace(/\s/g, '')) : 0);
}

export async function abrirCena(video) {
  const browser = await chromium.launch({
    channel: 'msedge',
    args: ['--allow-file-access-from-files', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-gpu'],
  });
  const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA }, deviceScaleFactor: 1 });
  const erros = [];
  page.on('pageerror', (e) => erros.push(`erro na página: ${e.message}`));
  page.on('requestfailed', (r) => erros.push(`não carregou: ${r.url()}`));
  await page.goto(pathToFileURL(join(video, '_fonte', 'cena.html')).href, { waitUntil: 'load' });
  try {
    await page.waitForFunction(() => document.body.dataset.pronto, null, { timeout: 30000 });
  } catch {
    erros.push('a cena não marcou data-pronto em 30 s');
  }
  const estado = await page.evaluate(() => ({
    pronto: document.body.dataset.pronto,
    fontes: window.__fontes || [],
    duracao: window.__duracao,
    marcas: window.__marcas,
  }));
  const faltando = estado.fontes.filter((f) => !f.ok).map((f) => f.fonte);
  if (faltando.length) erros.push(`fontes que não carregaram: ${faltando.join(', ')}`);
  if (estado.pronto !== '1') erros.push(`data-pronto = ${estado.pronto}`);
  if (erros.length) {
    await browser.close();
    throw new Error(erros.join('\n'));
  }
  console.log(`cena pronta: ${estado.duracao} s`);
  return { browser, page, duracao: estado.duracao, marcas: estado.marcas };
}

// Texto essencial visível que sai da zona segura no quadro atual.
export function foraDaZona(page) {
  return page.evaluate(
    ({ Z, L, A }) => {
      const fora = [];
      for (const n of document.querySelectorAll('[data-essencial]')) {
        if (getComputedStyle(n).visibility === 'hidden') continue;
        let opacidade = 1;
        for (let a = n; a instanceof Element; a = a.parentElement) opacidade *= parseFloat(getComputedStyle(a).opacity);
        if (opacidade < 0.5) continue;
        let b = n.getBoundingClientRect();
        if (n.matches('.bloco, #cta, .medir-texto')) {
          const faixa = document.createRange();
          faixa.selectNodeContents(n);
          b = faixa.getBoundingClientRect();
        }
        if (!b.width || !b.height) continue;
        const motivos = [];
        if (b.left < Z.esquerda) motivos.push(`esquerda ${Math.round(b.left)}`);
        if (b.right > L - Z.direita) motivos.push(`direita ${Math.round(b.right)}`);
        if (b.top < Z.topo) motivos.push(`topo ${Math.round(b.top)}`);
        if (b.bottom > A - Z.base) motivos.push(`base ${Math.round(b.bottom)}`);
        if (motivos.length) fora.push(`${n.dataset.essencial}: ${motivos.join(', ')}`);
      }
      return fora;
    },
    { Z: ZONA, L: LARGURA, A: ALTURA },
  );
}

// Desenha (ou tira) a zona segura por cima da cena.
export function zonaSegura(page, ligada) {
  return page.evaluate(
    ({ Z, ligada }) => {
      document.getElementById('zona')?.remove();
      if (!ligada) return;
      const z = document.createElement('div');
      z.id = 'zona';
      z.style.cssText = 'position:absolute;inset:0;z-index:99;pointer-events:none;font:700 24px/1.2 "Atkinson Hyperlegible Next",sans-serif;color:#fff';
      const faixa = (css, texto) => {
        const f = document.createElement('div');
        f.style.cssText = `position:absolute;background:rgb(0 160 255/.3);display:flex;align-items:center;justify-content:center;text-align:center;${css}`;
        f.textContent = texto;
        z.appendChild(f);
      };
      faixa(`left:0;top:0;width:100%;height:${Z.topo}px`, 'barra do app');
      faixa(`left:0;bottom:0;width:100%;height:${Z.base}px`, '25% de baixo: nome e legenda do post');
      faixa(`right:0;top:${Z.topo}px;bottom:${Z.base}px;width:${Z.direita}px`, 'botões');
      faixa(`left:0;top:${Z.topo}px;bottom:${Z.base}px;width:${Z.esquerda}px`, '');
      const moldura = document.createElement('div');
      moldura.style.cssText = `position:absolute;left:${Z.esquerda}px;top:${Z.topo}px;right:${Z.direita}px;bottom:${Z.base}px;border:3px dashed rgb(0 200 255/.95)`;
      z.appendChild(moldura);
      document.getElementById('palco').appendChild(z);
    },
    { Z: ZONA, ligada },
  );
}
