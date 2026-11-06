// Gera os mapas de Aracaju a partir do OpenStreetMap (ODbL), em build time.
//   node scripts/build-map.mjs            usa o cache em data/osm/
//   node scripts/build-map.mjs --refresh  baixa de novo do Overpass
// Saídas: src/data/mapa/*.json (paths SVG) e public/mapa/*.webp (camadas fixas).
import fs from 'node:fs';
import path from 'node:path';
import mapshaper from 'mapshaper';
import sharp from 'sharp';

const REFRESH = process.argv.includes('--refresh');
const OSM = 'data/osm';
const OUT_JSON = 'src/data/mapa';
const OUT_IMG = 'public/mapa';
fs.mkdirSync(OSM, { recursive: true });
fs.mkdirSync(OUT_JSON, { recursive: true });
fs.mkdirSync(OUT_IMG, { recursive: true });

const NOITE = '#17110E';
const LINHO = '#F3EDE2';

// ---------- 1. Overpass ----------
const CONSULTAS = {
  roads: `[out:json][timeout:170];way["highway"~"^(motorway|trunk|primary|secondary|tertiary|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|residential|unclassified|living_street)$"](-11.17,-37.19,-10.84,-36.98);out geom;`,
  water: `[out:json][timeout:170];(way["natural"="coastline"](-11.30,-37.35,-10.70,-36.85);way["waterway"~"^(river|canal|stream)$"](-11.17,-37.19,-10.84,-36.98););out geom;`,
  water2: `[out:json][timeout:170];(way["natural"="water"](-11.17,-37.19,-10.84,-36.98);relation["natural"="water"](-11.17,-37.19,-10.84,-36.98);way["natural"="wetland"](-11.17,-37.19,-10.84,-36.98);relation["natural"="wetland"](-11.17,-37.19,-10.84,-36.98);way["waterway"="riverbank"](-11.17,-37.19,-10.84,-36.98););out geom;`,
  boundary: `[out:json][timeout:120];relation(303928);out geom;`,
  buildings: `[out:json][timeout:120];way["building"](-11.03,-37.10,-10.88,-37.03);out geom;`,
};

async function baixar(nome) {
  const arquivo = path.join(OSM, `raw-${nome}.json`);
  if (fs.existsSync(arquivo) && !REFRESH) return JSON.parse(fs.readFileSync(arquivo, 'utf8')).elements;
  const servidores = ['https://overpass-api.de/api/interpreter', 'https://z.overpass-api.de/api/interpreter'];
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    const url = servidores[tentativa % servidores.length];
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'mapere-landing-build/0.1' },
        body: new URLSearchParams({ data: CONSULTAS[nome] }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const texto = await r.text();
      fs.writeFileSync(arquivo, texto);
      return JSON.parse(texto).elements;
    } catch (erro) {
      console.warn(`Overpass ${nome}: ${erro.message}. Nova tentativa em ${(tentativa + 1) * 15}s`);
      await new Promise((ok) => setTimeout(ok, (tentativa + 1) * 15000));
    }
  }
  throw new Error(`Overpass indisponível para ${nome}. Rode de novo mais tarde.`);
}

// ---------- 2. GeoJSON + mapshaper ----------
const lonlat = (g) => g.map((p) => [p.lon, p.lat]);
const igual = (a, b) => a[0] === b[0] && a[1] === b[1];
const fechado = (a) => igual(a[0], a[a.length - 1]);

function juntarAneis(ways) {
  const soltos = ways.map((w) => w.slice());
  const aneis = [];
  while (soltos.length) {
    let atual = soltos.pop();
    let mudou = true;
    while (mudou && !fechado(atual)) {
      mudou = false;
      for (let i = 0; i < soltos.length; i++) {
        const w = soltos[i];
        const fim = atual[atual.length - 1];
        const ini = atual[0];
        if (igual(fim, w[0])) atual = atual.concat(w.slice(1));
        else if (igual(fim, w[w.length - 1])) atual = atual.concat(w.slice(0, -1).reverse());
        else if (igual(ini, w[w.length - 1])) atual = w.slice(0, -1).concat(atual);
        else if (igual(ini, w[0])) atual = w.slice(1).reverse().concat(atual);
        else continue;
        soltos.splice(i, 1);
        mudou = true;
        break;
      }
    }
    aneis.push(atual);
  }
  return aneis;
}

async function simplificar(fc, intervalo) {
  const saida = await mapshaper.applyCommands(
    `-i in.json -simplify interval=${intervalo} keep-shapes -o out.json format=geojson`,
    { 'in.json': JSON.stringify(fc) },
  );
  const json = JSON.parse(saida['out.json'].toString());
  // Sem atributos, o mapshaper devolve GeometryCollection em vez de FeatureCollection.
  if (json.geometries) {
    return { type: 'FeatureCollection', features: json.geometries.map((geometry) => ({ type: 'Feature', properties: {}, geometry })) };
  }
  json.features = json.features.filter((f) => f.geometry);
  return json;
}

const CLASSE = {
  trunk: 'tronco', trunk_link: 'tronco', motorway: 'tronco', motorway_link: 'tronco',
  primary: 'primaria', primary_link: 'primaria',
  secondary: 'secundaria', secondary_link: 'secundaria',
  tertiary: 'terciaria', tertiary_link: 'terciaria',
  residential: 'local', unclassified: 'local', living_street: 'local',
};

const [roads, water, water2, boundary, buildings] = await Promise.all(
  ['roads', 'water', 'water2', 'boundary', 'buildings'].map(baixar),
);

const ruasFC = {
  type: 'FeatureCollection',
  features: roads.map((e) => ({
    type: 'Feature',
    properties: { c: CLASSE[e.tags.highway] ?? 'local' },
    geometry: { type: 'LineString', coordinates: lonlat(e.geometry) },
  })),
};

const aguaPoligonos = [];
for (const e of water2) {
  if (e.tags.natural !== 'water' && e.tags.waterway !== 'riverbank') continue;
  if (e.type === 'way' && e.geometry && e.geometry.length > 3) aguaPoligonos.push([lonlat(e.geometry)]);
  if (e.type === 'relation') {
    const fora = juntarAneis(e.members.filter((m) => m.role !== 'inner' && m.geometry).map((m) => lonlat(m.geometry))).filter(fechado);
    const dentro = juntarAneis(e.members.filter((m) => m.role === 'inner' && m.geometry).map((m) => lonlat(m.geometry))).filter(fechado);
    for (const anel of fora) aguaPoligonos.push([anel, ...dentro]);
  }
}
const aguaFC = {
  type: 'FeatureCollection',
  features: aguaPoligonos.map((coordinates) => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates } })),
};

const costaBruta = juntarAneis(water.filter((e) => e.tags.natural === 'coastline' && e.geometry).map((e) => lonlat(e.geometry)));
const costaFC = {
  type: 'FeatureCollection',
  features: costaBruta.map((coordinates) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } })),
};
const riosFC = {
  type: 'FeatureCollection',
  features: water.filter((e) => e.tags.waterway === 'river' && e.geometry).map((e) => ({
    type: 'Feature', properties: { n: e.tags.name ?? '' }, geometry: { type: 'LineString', coordinates: lonlat(e.geometry) },
  })),
};

const limiteAneis = juntarAneis(boundary[0].members.filter((m) => m.role === 'outer' && m.geometry).map((m) => lonlat(m.geometry)));
const limiteFC = {
  type: 'FeatureCollection',
  features: limiteAneis.map((a) => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [a] } })),
};

const andaresDe = (t) => {
  const n = parseFloat(t['building:levels']);
  if (Number.isFinite(n) && n > 0) return Math.min(n, 40);
  const h = parseFloat(t.height);
  if (Number.isFinite(h) && h > 0) return Math.min(h / 3, 40);
  return 0;
};
const prediosFC = {
  type: 'FeatureCollection',
  features: buildings.filter((e) => e.geometry && e.geometry.length > 3).map((e) => ({
    type: 'Feature', properties: { a: andaresDe(e.tags) }, geometry: { type: 'Polygon', coordinates: [lonlat(e.geometry)] },
  })),
};

const [ruas, agua, costa, rios, limite, predios] = await Promise.all([
  simplificar(ruasFC, 4), simplificar(aguaFC, 8), simplificar(costaFC, 8),
  simplificar(riosFC, 8), simplificar(limiteFC, 12), simplificar(prediosFC, 1.5),
]);
console.log(`ruas ${ruas.features.length} · água ${agua.features.length} · costa ${costa.features.length} · rios ${rios.features.length} · prédios ${predios.features.length}`);

// ---------- 3. Utilidades de geometria ----------
const LAT0 = -10.93;
const LON0 = -37.06;
const KX = Math.cos((LAT0 * Math.PI) / 180);
const M_LAT = 110574; // metros por grau de latitude nesta faixa
const metros = ([lon, lat]) => [(lon - LON0) * KX * M_LAT, (lat - LAT0) * M_LAT];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const r1 = (n) => Math.round(n * 10) / 10;

function projetor({ norte, sul, oeste, leste, largura }) {
  const s = largura / ((leste - oeste) * KX);
  return {
    largura,
    altura: (norte - sul) * s,
    p: ([lon, lat]) => [(lon - oeste) * KX * s, (norte - lat) * s],
  };
}

function caminho(pts) {
  let d = '';
  let ultimo = null;
  for (const [x, y] of pts) {
    const a = r1(x);
    const b = r1(y);
    if (ultimo && ultimo[0] === a && ultimo[1] === b) continue;
    d += `${d ? 'L' : 'M'}${a} ${b}`;
    ultimo = [a, b];
  }
  return d;
}

// Corta uma polilinha pelo retângulo, devolvendo os trechos que ficam dentro.
function recortar(pts, x0, y0, x1, y1) {
  const dentro = ([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
  const trechos = [];
  let atual = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (dentro(p)) {
      if (!atual.length && i > 0) atual.push(pts[i - 1]);
      atual.push(p);
    } else if (atual.length) {
      atual.push(p);
      trechos.push(atual);
      atual = [];
    }
  }
  if (atual.length) trechos.push(atual);
  return trechos;
}

const linhasDe = (f) => (f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates);
const aneisDe = (f) => (f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates.flat());

// Junta trechos com a mesma ponta em cadeias longas, boas para o DrawSVG.
function cadeias(linhas) {
  const chave = (p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
  const pontas = new Map();
  linhas.forEach((l, i) => {
    for (const p of [l[0], l[l.length - 1]]) {
      const k = chave(p);
      if (!pontas.has(k)) pontas.set(k, []);
      pontas.get(k).push(i);
    }
  });
  const usado = new Set();
  const saida = [];
  linhas.forEach((l, i) => {
    if (usado.has(i)) return;
    usado.add(i);
    let atual = l.slice();
    for (let lado = 0; lado < 2; lado++) {
      for (;;) {
        const k = chave(atual[atual.length - 1]);
        const prox = (pontas.get(k) ?? []).find((j) => !usado.has(j));
        if (prox === undefined) break;
        usado.add(prox);
        const w = linhas[prox];
        atual = atual.concat(chave(w[0]) === k ? w.slice(1) : w.slice(0, -1).reverse());
      }
      atual.reverse();
    }
    saida.push(atual);
  });
  return saida;
}

// ---------- 4. Rota real pelas ruas (Dijkstra sobre o grafo do OSM) ----------
const grafo = new Map();
const noCoord = new Map();
const PESO = { tronco: 0.6, primaria: 0.6, secundaria: 0.65, terciaria: 0.85, local: 1.25 };
for (const e of roads) {
  const peso = PESO[CLASSE[e.tags.highway] ?? 'local'];
  const g = e.geometry;
  for (let i = 0; i < g.length; i++) {
    const k = `${g[i].lat},${g[i].lon}`;
    noCoord.set(k, [g[i].lon, g[i].lat]);
    if (!grafo.has(k)) grafo.set(k, []);
    if (i > 0) {
      const a = `${g[i - 1].lat},${g[i - 1].lon}`;
      const custo = dist(metros([g[i].lon, g[i].lat]), metros([g[i - 1].lon, g[i - 1].lat])) * peso;
      grafo.get(k).push([a, custo]);
      grafo.get(a).push([k, custo]);
    }
  }
}
function noMaisPerto(lon, lat) {
  let melhor = null;
  let d = Infinity;
  const alvo = metros([lon, lat]);
  for (const [k, c] of noCoord) {
    const x = dist(metros(c), alvo);
    if (x < d && grafo.get(k).length > 0) { d = x; melhor = k; }
  }
  return melhor;
}
function menorCaminho(de, para) {
  const custo = new Map([[de, 0]]);
  const veio = new Map();
  const fila = [[0, de]];
  const visto = new Set();
  while (fila.length) {
    fila.sort((a, b) => b[0] - a[0]);
    const [c, u] = fila.pop();
    if (visto.has(u)) continue;
    visto.add(u);
    if (u === para) break;
    for (const [v, w] of grafo.get(u)) {
      const n = c + w;
      if (n < (custo.get(v) ?? Infinity)) { custo.set(v, n); veio.set(v, u); fila.push([n, v]); }
    }
  }
  const pts = [];
  for (let u = para; u; u = veio.get(u)) pts.unshift(noCoord.get(u));
  return pts;
}
function rotaPor(paradas) {
  const nos = paradas.map(([lat, lon]) => noMaisPerto(lon, lat));
  let pts = [];
  for (let i = 1; i < nos.length; i++) {
    const t = menorCaminho(nos[i - 1], nos[i]);
    pts = pts.concat(i === 1 ? t : t.slice(1));
  }
  return { pts, nos: nos.map((k) => noCoord.get(k)) };
}

// Simplifica mantendo pontas (Douglas-Peucker, em metros).
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const m = pts.map(metros);
  const manter = new Uint8Array(pts.length);
  manter[0] = 1;
  manter[pts.length - 1] = 1;
  const pilha = [[0, pts.length - 1]];
  while (pilha.length) {
    const [a, b] = pilha.pop();
    let maior = 0;
    let idx = -1;
    const [ax, ay] = m[a];
    const [bx, by] = m[b];
    const L = Math.hypot(bx - ax, by - ay) || 1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((by - ay) * m[i][0] - (bx - ax) * m[i][1] + bx * ay - by * ax) / L;
      if (d > maior) { maior = d; idx = i; }
    }
    if (maior > tol) { manter[idx] = 1; pilha.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => manter[i]);
}

async function rasterizar(svg, arquivo, largura, opcoes = {}) {
  await sharp(Buffer.from(svg), { limitInputPixels: false, density: 96 })
    .resize({ width: largura })
    .webp({ quality: opcoes.q ?? 62, alphaQuality: 80, effort: 6 })
    .toFile(path.join(OUT_IMG, arquivo));
  const kb = fs.statSync(path.join(OUT_IMG, arquivo)).size / 1024;
  console.log(`  ${arquivo} ${kb.toFixed(0)} KB`);
}

// ---------- 5. Cena "O problema": mapa em linha da cidade ----------
async function cenaProblema() {
  const P = projetor({ norte: -10.862, sul: -10.998, oeste: -37.128, leste: -36.99, largura: 1000 });
  const W = P.largura;
  const H = Math.round(P.altura);
  const tudo = (coords) => recortar(coords.map(P.p), -4, -4, W + 4, H + 4);

  const rotaCfg = [
    [-10.9835, -37.0445], // saída na Atalaia
    [-10.9462, -37.0512], // parada 1
    [-10.9405, -37.0720], // parada 2
    [-10.9105, -37.0580], // parada 3
  ];
  const rota = rotaPor(rotaCfg);
  const rotaPts = dp(rota.pts, 4).map(P.p);
  const pontoEm = (c) => P.p(c).map(r1);
  let total = 0;
  const comp = [0];
  for (let i = 1; i < rotaPts.length; i++) { total += dist(rotaPts[i - 1], rotaPts[i]); comp.push(total); }
  const progressoDe = (alvo) => {
    let melhor = 0;
    let d = Infinity;
    rotaPts.forEach((p, i) => { const x = dist(p, alvo); if (x < d) { d = x; melhor = i; } });
    return Math.round((comp[melhor] / total) * 1000) / 1000;
  };
  const inicio = rotaPts[0];

  const arteriaLinhas = [];
  for (const f of ruas.features) {
    for (const l of linhasDe(f)) {
      if (['tronco', 'primaria', 'secundaria'].includes(f.properties.c)) arteriaLinhas.push(l);
    }
  }
  const arterias = [];
  for (const c of cadeias(arteriaLinhas)) {
    for (const t of tudo(c)) {
      let tam = 0;
      for (let i = 1; i < t.length; i++) tam += dist(t[i - 1], t[i]);
      if (tam < 30) continue;
      const dI = dist(t[0], inicio);
      const dF = dist(t[t.length - 1], inicio);
      const orientado = dF < dI ? t.slice().reverse() : t;
      arterias.push({ d: caminho(orientado), q: Math.round(Math.min(dI, dF)), t: Math.round(tam) });
    }
  }
  arterias.sort((a, b) => a.q - b.q);

  // Malha de ruas em três anéis, do início da rota para fora.
  const maxD = Math.hypot(W, H);
  const anel = (p) => { const d = dist(p, inicio) / maxD; return d < 0.33 ? 0 : d < 0.55 ? 1 : 2; };
  const outras = { 0: [], 1: [], 2: [] };
  for (const f of ruas.features) {
    if (['tronco', 'primaria', 'secundaria'].includes(f.properties.c)) continue;
    for (const l of linhasDe(f)) {
      for (const t of tudo(l)) outras[anel(t[0])].push({ d: caminho(t), c: f.properties.c });
    }
  }
  for (const i of [0, 1, 2]) {
    const local = outras[i].filter((o) => o.c === 'local').map((o) => o.d).join('');
    const tercia = outras[i].filter((o) => o.c !== 'local').map((o) => o.d).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2}" height="${H * 2}" viewBox="0 0 ${W} ${H}" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${local}" stroke="${LINHO}" stroke-opacity=".3" stroke-width=".55"/><path d="${tercia}" stroke="${LINHO}" stroke-opacity=".5" stroke-width=".8"/></svg>`;
    await rasterizar(svg, `cidade-ruas-${i + 1}.webp`, 1800, { q: 55 });
    await rasterizar(svg, `cidade-ruas-${i + 1}-sm.webp`, 1000, { q: 55 });
  }

  // Fundo: costa, rios e curvas na água (traços concêntricos recortados pela água).
  const aguaD = agua.features.flatMap((f) => aneisDe(f)).map((a) => `${caminho(a.map(P.p))}Z`).join('');
  const costaPts = costa.features.flatMap(linhasDe).flatMap((l) => tudo(l));
  const costaD = costaPts.map(caminho).join('');
  const costaLonga = costa.features.flatMap(linhasDe).sort((a, b) => b.length - a.length)[0];
  const costaProj = costaLonga.map(P.p);
  // Fecha o mar pelo lado leste para virar área recortável.
  const ordem = costaProj[0][1] < costaProj[costaProj.length - 1][1] ? costaProj : costaProj.slice().reverse();
  const mar = `${caminho(ordem)}L${W + 900} ${H + 900}L${W + 900} -900Z`;
  const curvas = [130, 104, 80, 58, 39, 23, 10];
  let contornos = '';
  for (const w of curvas) {
    const op = (0.17 + 0.2 * (1 - w / 130)).toFixed(3);
    contornos += `<path d="${aguaD}" stroke="${LINHO}" stroke-opacity="${op}" stroke-width="${w + 1}"/><path d="${costaD}" stroke="${LINHO}" stroke-opacity="${op}" stroke-width="${w + 1}"/>`;
    contornos += `<path d="${aguaD}" stroke="${NOITE}" stroke-width="${w}"/><path d="${costaD}" stroke="${NOITE}" stroke-width="${w}"/>`;
  }
  const fundo = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2}" height="${H * 2}" viewBox="0 0 ${W} ${H}" fill="none" stroke-linecap="round" stroke-linejoin="round"><defs><clipPath id="a"><path d="${aguaD}${mar}"/></clipPath></defs><rect width="${W}" height="${H}" fill="${NOITE}"/><g clip-path="url(#a)">${contornos}</g><path d="${aguaD}" stroke="${LINHO}" stroke-opacity=".5" stroke-width=".9"/><path d="${costaD}" stroke="${LINHO}" stroke-opacity=".62" stroke-width="1.1"/></svg>`;
  await rasterizar(fundo, 'cidade-agua.webp', 1800, { q: 60 });
  await rasterizar(fundo, 'cidade-agua-sm.webp', 1000, { q: 60 });

  const paradas = rota.nos.slice(1).map((c) => {
    const p = pontoEm(c);
    return { x: p[0], y: p[1], t: progressoDe(p) };
  });
  const dados = {
    viewBox: `0 0 ${W} ${H}`,
    largura: W,
    altura: H,
    arterias: arterias.map(({ d, q, t }) => ({ d, q, t })),
    rota: caminho(rotaPts),
    inicio: inicio.map(r1),
    paradas,
    extras: [[-10.9255, -37.0495], [-10.904, -37.076]].map(([lat, lon]) => pontoEm(noCoord.get(noMaisPerto(lon, lat)))),
  };
  fs.writeFileSync(path.join(OUT_JSON, 'problema.json'), JSON.stringify(dados));
  console.log(`problema: ${arterias.length} artérias, ${(JSON.stringify(dados).length / 1024).toFixed(0)} KB, viewBox ${dados.viewBox}`);

  // Prévia para conferência (não vai para o site).
  const previa = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="${LINHO}" stroke-opacity=".78" stroke-width="1.1">${dados.arterias.map((a) => `<path d="${a.d}"/>`).join('')}</g><path d="${dados.rota}" stroke="#F0641E" stroke-width="2.4"/>${paradas.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="9" fill="#F5B700"/>`).join('')}${dados.extras.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="#D92D4B"/>`).join('')}</svg>`;
  if (process.env.PREVIA) {
    const base = await sharp(path.join(OUT_IMG, 'cidade-agua.webp')).resize({ width: W }).toBuffer();
    const camadas = await Promise.all([1, 2, 3].map((i) => sharp(path.join(OUT_IMG, `cidade-ruas-${i}.webp`)).resize({ width: W }).toBuffer()));
    await sharp(base).composite([...camadas.map((input) => ({ input })), { input: Buffer.from(previa) }]).jpeg({ quality: 78 }).toFile('.tmp/hf/previa-problema.jpg');
  }
}

// ---------- 6. Tela do app: recorte de Aracaju em modo claro ----------
async function cenaTela() {
  const W = 390;
  const H = 844;
  const leste = -37.0432;
  const oeste = leste - 0.0145;
  const span = ((leste - oeste) * KX * H) / W;
  const norte = -10.9262;
  const sul = norte - span;
  const P = projetor({ norte, sul, oeste, leste, largura: W });
  const noPixel = (x, y) => [oeste + (x / W) * (leste - oeste), norte - (y / H) * (norte - sul)];
  const no = (x, y) => { const [lon, lat] = noPixel(x, y); return noMaisPerto(lon, lat); };
  const tudo = (coords) => recortar(coords.map(P.p), -6, -6, W + 6, H + 6);

  const classes = { local: [], terciaria: [], principal: [] };
  for (const f of ruas.features) {
    const c = f.properties.c === 'local' ? 'local' : f.properties.c === 'terciaria' ? 'terciaria' : 'principal';
    for (const l of linhasDe(f)) for (const t of tudo(l)) classes[c].push(caminho(t));
  }

  const dentroAgua = agua.features.flatMap((f) => aneisDe(f)).map((a) => a.map(P.p))
    .filter((a) => a.some(([x, y]) => x > -60 && x < W + 60 && y > -60 && y < H + 60));
  const aguaD = dentroAgua.map((a) => `${caminho(a)}Z`).join('');

  const eu = no(96, 492);
  const posto = no(232, 300);
  const rota = menorCaminho(eu, posto);
  const rotaPts = dp(rota, 3).map(P.p);
  const px = (k) => P.p(noCoord.get(k)).map(r1);
  const lugares = [
    { id: 'p1', st: 'ocupado', xy: [64, 272] },
    { id: 'p2', st: 'livre', xy: [150, 226] },
    { id: 'p3', st: 'seminfo', xy: [40, 400] },
    { id: 'p4', st: 'ocupado', xy: [262, 420] },
    { id: 'p5', st: 'defeito', xy: [112, 340] },
    { id: 'p6', st: 'seminfo', xy: [300, 232] },
  ].map((l) => ({ id: l.id, st: l.st, xy: px(no(...l.xy)) }));

  const dados = {
    viewBox: `0 0 ${W} ${H}`,
    local: classes.local.join(''),
    terciaria: classes.terciaria.join(''),
    principal: classes.principal.join(''),
    agua: aguaD,
    rota: caminho(rotaPts),
    eu: px(eu),
    posto: px(posto),
    lugares,
  };
  fs.writeFileSync(path.join(OUT_JSON, 'tela.json'), JSON.stringify(dados));
  console.log(`tela: ${(JSON.stringify(dados).length / 1024).toFixed(0)} KB`);

  if (process.env.PREVIA) {
    const pin = (xy, c) => `<circle cx="${xy[0]}" cy="${xy[1]}" r="9" fill="${c}" stroke="#17110E" stroke-width="2"/>`;
    const cores = { ocupado: '#F5B700', livre: '#12B76A', seminfo: '#8C857B', defeito: '#D92D4B' };
    const previa = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#EFE8DB"/><path d="${dados.agua}" fill="#CFC3AF" fill-rule="evenodd"/><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${dados.local}" stroke="#FBF8F2" stroke-width="2.6"/><path d="${dados.terciaria}" stroke="#FBF8F2" stroke-width="4"/><path d="${dados.principal}" stroke="#FBF8F2" stroke-width="6.5"/><path d="${dados.rota}" stroke="#17110E" stroke-width="8"/><path d="${dados.rota}" stroke="#F0641E" stroke-width="4.5"/></g>${dados.lugares.map((l) => pin(l.xy, cores[l.st])).join('')}${pin(dados.posto, '#12B76A')}${pin(dados.eu, '#17110E')}</svg>`;
    await sharp(Buffer.from(previa)).jpeg({ quality: 82 }).toFile('.tmp/hf/previa-tela.jpg');
  }
}

// ---------- 7. Cidade em arame: prédios reais do OSM em perspectiva ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };

function camera({ pos, alvo, fov, W, H }) {
  const f = norm(sub(alvo, pos));
  const r = norm(cross(f, [0, 0, 1]));
  const u = cross(r, f);
  const foco = (H / 2) / Math.tan((fov * Math.PI) / 360);
  return (p) => {
    const v = sub(p, pos);
    const z = dot(v, f);
    if (z < 60) return null;
    return [W / 2 + (dot(v, r) / z) * foco, H / 2 - (dot(v, u) / z) * foco, z];
  };
}

async function cenaArame() {
  const W = 1600;
  const H = 1000;
  const cfg = {
    pos: [5600, -5600, 1750],
    alvo: [-900, 650, 0],
    fov: 30,
    W,
    H,
  };
  const C = camera(cfg);
  const proj3 = (c, z = 0) => { const m = metros(c); return C([m[0], m[1], z]); };
  const perto = 5200;
  const longe = 16000;
  const nevoa = (z) => Math.max(0, Math.min(1, 1 - (z - perto) / (longe - perto)));

  // Sequências projetadas, quebradas onde saem do campo de visão.
  const linha = (coords, z = 0) => {
    const trechos = [];
    let atual = [];
    for (const c of coords) {
      const p = proj3(c, z);
      if (p && p[0] > -300 && p[0] < W + 300 && p[1] > -300 && p[1] < H + 300) atual.push(p);
      else if (atual.length) { trechos.push(atual); atual = []; }
    }
    if (atual.length) trechos.push(atual);
    return trechos;
  };

  // Ruas em faixas de profundidade, para a névoa apagar o fundo.
  const FAIXAS = 7;
  const porFaixa = Array.from({ length: FAIXAS }, () => ({ local: '', via: '' }));
  for (const f of ruas.features) {
    const tipo = f.properties.c === 'local' ? 'local' : 'via';
    for (const l of linhasDe(f)) {
      for (const t of linha(l)) {
        if (t.length < 2) continue;
        const n = nevoa(t[0][2]);
        const i = Math.min(FAIXAS - 1, Math.floor((1 - n) * FAIXAS));
        porFaixa[i][tipo] += caminho(t);
      }
    }
  }
  let chao = '';
  porFaixa.forEach((b, i) => {
    const k = 1 - i / FAIXAS;
    chao += `<path d="${b.local}" stroke="${LINHO}" stroke-opacity="${(0.05 + 0.2 * k).toFixed(3)}" stroke-width=".6"/>`;
    chao += `<path d="${b.via}" stroke="${LINHO}" stroke-opacity="${(0.1 + 0.42 * k).toFixed(3)}" stroke-width="${(0.7 + 0.5 * k).toFixed(2)}"/>`;
  });

  const aguaD = agua.features.flatMap((f) => aneisDe(f)).flatMap((a) => linha(a)).filter((t) => t.length > 2).map(caminho).join('');
  const costaD = costa.features.flatMap(linhasDe).flatMap((l) => linha(l)).map(caminho).join('');

  // Prédios do fundo para a frente; o preenchimento Noite esconde as linhas de trás.
  const lista = [];
  for (const f of predios.features) {
    const anel = aneisDe(f)[0];
    if (!anel || anel.length < 4) continue;
    const andares = f.properties.a || 1.6;
    const altura = andares * 3.3 * 1.35;
    const mundo = anel.map(metros);
    let area2 = 0;
    for (let i = 0; i < mundo.length - 1; i++) area2 += mundo[i][0] * mundo[i + 1][1] - mundo[i + 1][0] * mundo[i][1];
    const sentido = Math.sign(area2) || 1;
    const base = anel.map((c) => proj3(c, 0));
    const topo = anel.map((c) => proj3(c, altura));
    if (base.some((p) => !p) || topo.some((p) => !p)) continue;
    const zMed = base.reduce((s, p) => s + p[2], 0) / base.length;
    const fora = base.every((p) => p[0] < -40 || p[0] > W + 40 || p[1] < -40 || p[1] > H + 40);
    if (fora) continue;
    // Só paredes voltadas para a câmera: a normal para fora aponta para ela.
    const frente = [];
    for (let i = 0; i < mundo.length - 1; i++) {
      const [ax, ay] = mundo[i];
      const [bx, by] = mundo[i + 1];
      const nx = (by - ay) * sentido;
      const ny = -(bx - ax) * sentido;
      frente.push(nx * (cfg.pos[0] - ax) + ny * (cfg.pos[1] - ay) > 0);
    }
    lista.push({ base, topo, z: zMed, andares, frente });
  }
  lista.sort((a, b) => b.z - a.z);
  let predioSvg = '';
  for (const b of lista) {
    const n = nevoa(b.z);
    const op = (0.12 + 0.62 * n * (b.andares > 3 ? 1 : 0.72)).toFixed(3);
    const sw = (0.45 + 0.4 * n).toFixed(2);
    let d = '';
    for (let i = 0; i < b.base.length - 1; i++) {
      if (!b.frente[i]) continue;
      d += `M${r1(b.base[i][0])} ${r1(b.base[i][1])}L${r1(b.base[i + 1][0])} ${r1(b.base[i + 1][1])}L${r1(b.topo[i + 1][0])} ${r1(b.topo[i + 1][1])}L${r1(b.topo[i][0])} ${r1(b.topo[i][1])}Z`;
    }
    const teto = `${caminho(b.topo)}Z`;
    predioSvg += `<path d="${d}${teto}" fill="${NOITE}" stroke="${LINHO}" stroke-opacity="${op}" stroke-width="${sw}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2}" height="${H * 2}" viewBox="0 0 ${W} ${H}" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="${W}" height="${H}" fill="${NOITE}"/>${chao}<path d="${aguaD}" stroke="${LINHO}" stroke-opacity=".34" stroke-width=".8"/><path d="${costaD}" stroke="${LINHO}" stroke-opacity=".5" stroke-width="1"/>${predioSvg}</svg>`;
  await rasterizar(svg, 'cidade-arame.webp', 2200, { q: 58 });
  await rasterizar(svg, 'cidade-arame-sm.webp', 1100, { q: 58 });

  // Contorno do município projetado: vira path para o DrawSVG.
  const contorno = limite.features.flatMap((f) => aneisDe(f)).sort((a, b) => b.length - a.length)[0];
  // Margem larga: o contorno sai do quadro e volta sem quebrar a linha.
  const trechosLimite = [];
  {
    let atual = [];
    for (const c of contorno) {
      const p = proj3(c);
      if (p && p[0] > -2600 && p[0] < W + 2600 && p[1] > -900 && p[1] < H + 2200) atual.push(p);
      else if (atual.length) { trechosLimite.push(atual); atual = []; }
    }
    if (atual.length) trechosLimite.push(atual);
  }
  const limiteD = trechosLimite.filter((t) => t.length > 1).sort((a, b) => b.length - a.length).map(caminho);

  const rotulos = {
    centro: [-10.9115, -37.0525],
    rio: [-10.9255, -37.0335],
    atalaia: [-10.9845, -37.0455],
    poxim: [-10.973, -37.078],
  };
  const ancoras = Object.fromEntries(Object.entries(rotulos).map(([k, [lat, lon]]) => {
    const p = proj3([lon, lat]);
    return [k, p ? [Math.round((p[0] / W) * 1000) / 10, Math.round((p[1] / H) * 1000) / 10] : null];
  }));
  const dados = { viewBox: `0 0 ${W} ${H}`, limite: limiteD, ancoras, predios: lista.length };
  fs.writeFileSync(path.join(OUT_JSON, 'arame.json'), JSON.stringify(dados));
  console.log(`arame: ${lista.length} prédios, limite em ${limiteD.length} trecho(s), ${(limiteD.join('').length / 1024).toFixed(1)} KB`, ancoras);

  if (process.env.PREVIA) {
    const sobre = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">${limiteD.map((d) => `<path d="${d}" stroke="#F0641E" stroke-width="2"/>`).join('')}</svg>`;
    const base = await sharp(path.join(OUT_IMG, 'cidade-arame.webp')).resize({ width: W }).toBuffer();
    await sharp(base).composite([{ input: Buffer.from(sobre) }]).jpeg({ quality: 80 }).toFile('.tmp/hf/previa-arame.jpg');
  }
}

// ---------- 8. Curva do rio para a textura de marca ----------
function cenaRio() {
  const linhas = rios.features.filter((f) => f.properties.n === 'Rio Sergipe').flatMap(linhasDe);
  const rio = cadeias(linhas).sort((a, b) => b.length - a.length)[0];
  // Gira 90 graus para o rio correr de um lado ao outro das faixas largas.
  const m = dp(rio, 120).map(metros).map(([x, y]) => [y, -x]);
  const xs = m.map((p) => p[0]);
  const ys = m.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const W = 1600;
  const H = 900;
  const s = W / (x1 - x0);
  const meio = (y0 + y1) / 2;
  const pts = m.map(([x, y]) => [(x - x0) * s, H / 2 + (y - meio) * s * 0.9]);
  fs.writeFileSync(path.join(OUT_JSON, 'rio.json'), JSON.stringify({ viewBox: `0 0 ${W} ${H}`, d: caminho(pts) }));
  console.log(`rio: ${pts.length} pontos`);
}

await cenaProblema();
await cenaTela();
await cenaArame();
cenaRio();
