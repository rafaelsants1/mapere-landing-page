// Kit da série de vídeos do Mapere. Monta as peças comuns e a linha do tempo; a cena de
// cada vídeo só desenha o que é dela. Veio do vídeo 03.
//
// Na cena (social/NN-.../_fonte/cena.html), depois de gsap, dados.js e legenda.js:
//   <script src="../../_motor/kit/kit.js"></script>
//   <script>
//     Kit.iniciar({
//       fundo: 'fundo.png',                  // opcional: imagem 9:16 gerada por IA
//       nomesDosCapitulos: true,             // nome do capítulo abaixo da barra
//       montar(k) { ... k.tl, k.m (marcas), k.e (estado), helpers ... },
//       desenhar(t, k) { ... },              // opcional: o que depende só do tempo
//     });
//   </script>
//
// O kit cuida de: título (sai no 1º capítulo), barra de capítulos (acende no capítulo
// atual), legenda palavra por palavra (a última linha vira a chamada sob o logo),
// mapa (k.mapa), fecho (k.fecho) e o contrato com o motor (data-pronto, __ir, __marcas).
(function () {
  const raiz = new URL('../../../', document.currentScript.src).href;
  const NS = 'http://www.w3.org/2000/svg';

  async function iniciar(cfg) {
    const LEG = window.LEGENDA;
    const M = window.MAPA;
    const ICONES = window.ICONES;
    const marcas = LEG.marcas;

    gsap.registerPlugin(CustomEase);
    CustomEase.create('entrada', '.2,.7,.2,1');
    gsap.defaults({ lazy: false, overwrite: false });
    gsap.config({ force3D: false });

    const $ = (s) => document.querySelector(s);
    const svg = (tag, attrs, pai) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (pai) pai.appendChild(n);
      return n;
    };
    const html = (tag, classe, pai, texto) => {
      const n = document.createElement(tag);
      if (classe) n.className = classe;
      if (texto != null) n.textContent = texto;
      if (pai) pai.appendChild(n);
      return n;
    };
    const limita = (v, a, b) => Math.max(a, Math.min(b, v));
    const rampa = (a, b, v) => limita((v - a) / (b - a), 0, 1);
    const lerp = (a, b, u) => a + (b - a) * u;
    const icone = (nome, pai, x, y, tamanho, traco) => {
      const g = svg('g', { transform: `translate(${x} ${y}) scale(${tamanho / 24})` }, pai);
      svg('path', { d: ICONES[nome], class: 'icone', 'stroke-width': traco }, g);
      return g;
    };
    const chip = (pai, st, texto, nota, grande) => {
      const c = html('span', grande ? 'chip grande' : 'chip', pai);
      c.dataset.st = st;
      c.dataset.essencial = `rótulo ${texto}`;
      svg('path', { d: ICONES[st] }, svg('svg', { viewBox: '0 0 24 24' }, c));
      html('b', '', c, texto);
      if (nota) {
        html('span', '', c, '·');
        html('span', 'nota', c, nota);
      }
      return c;
    };
    // Caminho por pontos: posição numa fração u do comprimento.
    const caminho = (pts, u) => {
      const seg = [];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        seg.push(d);
        total += d;
      }
      let alvo = u * total;
      for (let i = 0; i < seg.length; i++) {
        if (alvo <= seg[i] || i === seg.length - 1) {
          const k = seg[i] ? limita(alvo / seg[i], 0, 1) : 0;
          return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
        }
        alvo -= seg[i];
      }
      return pts[pts.length - 1];
    };

    // ---------- Camadas comuns ----------
    const palco = $('#palco');
    const primeiro = palco.firstChild;
    const antes = (n) => palco.insertBefore(n, primeiro);
    if (cfg.fundo) {
      const f = html('div', '', null);
      f.id = 'fundo';
      const foto = html('div', 'foto', f);
      foto.style.backgroundImage = `url('${cfg.fundo}')`;
      html('div', 'veu', f);
      antes(f);
    }
    const mundo = html('div', '', null);
    mundo.id = 'mundo';
    mundo.innerHTML = `<div id="cidade">${['agua', 'ruas-1', 'ruas-2', 'ruas-3'].map((c) => `<img src="${raiz}public/mapa/cidade-${c}.webp" alt="">`).join('')}<svg id="arterias" viewBox="${M.viewBox}" fill="none"></svg></div>`;
    antes(mundo);
    const veuBase = html('div', '', null);
    veuBase.id = 'veu-base';
    antes(veuBase);
    const pontos = html('div', 'camada', null);
    pontos.id = 'pontos';
    antes(pontos);
    const rotulos = html('div', 'camada', null);
    rotulos.id = 'rotulos';
    antes(rotulos);

    const camAceso = html('div', 'camada', palco);
    camAceso.id = 'camada-aceso';
    camAceso.innerHTML = '<div id="aceso"><span class="halo"></span><span class="miolo"></span></div>';
    const titulo = html('h1', 'titulo', palco);
    titulo.id = 'titulo';
    titulo.dataset.essencial = 'título';
    for (const l of LEG.titulo || []) html('span', 'lin', titulo, l);
    const capDiv = html('div', '', palco);
    capDiv.id = 'capitulos';
    const nCap = LEG.capitulos.length;
    const X0 = 110, X1 = 900, VAO = 16;
    const largBarra = (X1 - X0 - VAO * (nCap - 1)) / nCap;
    const barras = LEG.capitulos.map((c, i) => {
      const b = html('span', 'barra', capDiv);
      b.style.left = `${X0 + i * (largBarra + VAO)}px`;
      b.style.width = `${largBarra}px`;
      return b;
    });
    const nomes = LEG.capitulos.map((c, i) => {
      const n = html('p', 'cap-nome', capDiv, `${i + 1}. ${c.nome}`);
      n.dataset.essencial = `capítulo ${i + 1}`;
      return n;
    });
    const legDiv = html('div', '', palco);
    legDiv.id = 'legenda';
    const rodape = html('p', '', palco, cfg.rodape || 'Mapa com dados do OpenStreetMap. Postos ilustrativos.');
    rodape.id = 'rodape';
    const marca = html('div', '', palco);
    marca.id = 'marca';
    marca.innerHTML = '<svg id="logo" aria-label="Mapere." data-essencial="logo"></svg><p id="cta" data-essencial="chamada"></p>';

    // ---------- Logo ----------
    const logo = $('#logo');
    logo.setAttribute('viewBox', window.LOGO.viewBox);
    const letras = window.LOGO.letras.map((d) => svg('path', { d, fill: '#F3EDE2' }, logo));
    const logoPonto = svg('path', { d: window.LOGO.ponto, fill: '#F0641E' }, logo);

    // ---------- Legenda palavra por palavra ----------
    const ULT = LEG.ultimaLinha;
    const blocos = LEG.blocos.map((b, i) => {
      const pai = b.linha === ULT ? $('#cta') : html('div', 'bloco', legDiv);
      if (b.linha !== ULT) pai.dataset.essencial = 'legenda';
      const palavras = b.palavras.map((p, j) => {
        if (j) pai.appendChild(document.createTextNode(' '));
        return { ...p, no: html('span', 'futura', pai, p.tela) };
      });
      const ini = palavras[0].ini - 0.04;
      const prox = LEG.blocos[i + 1];
      const ultimaFim = palavras[palavras.length - 1].fim;
      let sai = prox ? prox.palavras[0].ini - 0.04 : Infinity;
      if (prox && sai - ultimaFim > 0.9) sai = ultimaFim + 0.55;
      if (b.linha === ULT) sai = Infinity;
      return { linha: b.linha, no: pai, palavras, ini, sai };
    });

    // ---------- Linha do tempo e helpers de animação ----------
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    const e = { zoom: 1, aceso: 0, voo: 0 };
    const entra = (alvo, quando, extra = {}) => tl.to(alvo, { autoAlpha: 1, scale: 1, duration: 0.32, ease: 'entrada', ...extra }, quando);
    const sai = (alvo, quando, extra = {}) => tl.to(alvo, { autoAlpha: 0, duration: 0.3, ease: 'power2.in', ...extra }, quando);
    // Etiqueta com fio: caixa em [x, y], fio de `de` até `ate` (em px do palco).
    const fiosSvg = svg('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none' }, null);
    palco.insertBefore(fiosSvg, camAceso);
    const etiqueta = (texto, caixa, de, ate, pai) => {
      const no = html('span', 'etiqueta', pai || palco, texto);
      no.dataset.essencial = `etiqueta ${texto}`;
      no.style.left = `${caixa[0]}px`;
      no.style.top = `${caixa[1]}px`;
      const fio = de ? svg('path', { class: 'fio', pathLength: 1, d: `M${de[0]} ${de[1]}L${ate[0]} ${ate[1]}` }, fiosSvg) : null;
      gsap.set(no, { autoAlpha: 0, scale: 0.6 });
      if (fio) gsap.set(fio, { strokeDashoffset: 1 });
      return {
        no,
        fio,
        mostra(quando) {
          if (fio) tl.to(fio, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, quando);
          entra(no, quando + (fio ? 0.12 : 0));
          return this;
        },
        some(quando) {
          sai(fio ? [no, fio] : no, quando, { duration: 0.2 });
          return this;
        },
      };
    };

    // ---------- Mapa ----------
    const maxQ = Math.max(...M.arterias.map((a) => a.q));
    const arterias = M.arterias.map((a) => ({ ...a, no: svg('path', { d: a.d, pathLength: 1 }, $('#arterias')) }));
    const ANCORA = { x: 540, y: 900 };
    const cam = { x: M.inicio[0], y: M.inicio[1], s: 1.3 };
    const origem = { dir: '0% 50%', esq: '100% 50%', cima: '50% 100%', baixo: '50% 0%' };
    const encaixe = { dir: { yPercent: -50 }, esq: { xPercent: -100, yPercent: -50 }, cima: { xPercent: -50, yPercent: -100 }, baixo: { xPercent: -50 } };
    const postos = [];
    const mapa = {
      // Põe o ponto do mapa `xy` (coordenadas do mapa) no lugar `naTela` do palco, com escala s.
      enquadrar(xy, naTela, s) {
        Object.assign(cam, { x: xy[0] - (naTela.x - ANCORA.x) / s, y: xy[1] - (naTela.y - ANCORA.y) / s, s });
      },
      // Um posto: ponto no mapa e rótulos (um por estado). estados: [{ st, texto, nota }]
      posto(xy, lado, estados) {
        const p = { xy, lado, tela: [0, 0], rotulosEstado: [] };
        p.ponto = html('div', 'ponto', pontos);
        p.anel = html('span', 'anel', p.ponto);
        p.cheio = html('span', 'cheio', p.ponto);
        for (const est of estados) {
          const r = html('div', `rotulo lado-${est.lado || lado}`, rotulos);
          const caixa = html('div', 'caixa', r);
          html('span', 'haste', caixa);
          chip(caixa, est.st, est.texto, est.nota);
          gsap.set(caixa, { ...encaixe[est.lado || lado], transformOrigin: origem[est.lado || lado], autoAlpha: 0, scale: 0.6 });
          p.rotulosEstado.push({ r, caixa });
        }
        gsap.set(p.cheio, { scale: 0, autoAlpha: 0 });
        gsap.set(p.ponto, { autoAlpha: 0 });
        postos.push(p);
        return p;
      },
      abre(p, quando, estado = 0) {
        tl.to(p.ponto, { autoAlpha: 1, duration: 0.2 }, quando);
        tl.to(p.rotulosEstado[estado].caixa, { autoAlpha: 1, scale: 1, duration: 0.36, ease: 'entrada' }, quando);
        tl.to(p.cheio, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'entrada' }, quando);
      },
      troca(p, de, para, quando) {
        tl.to(p.rotulosEstado[de].caixa, { autoAlpha: 0, scale: 0.8, duration: 0.2, ease: 'power2.in' }, quando);
        tl.to(p.rotulosEstado[para].caixa, { autoAlpha: 1, scale: 1, duration: 0.36, ease: 'entrada' }, quando + 0.15);
      },
      mostrar(quando) {
        tl.to(['#mundo', '#veu-base', '#pontos', '#rotulos', '#rodape'], { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, quando);
        arterias.forEach((a) => tl.fromTo(a.no, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.out' }, quando + 0.9 * (a.q / maxQ)));
      },
      avancar(quando, ate, zoom = 1.05) {
        tl.to(e, { zoom, duration: Math.max(1, ate - quando), ease: 'sine.inOut' }, quando);
      },
    };

    // ---------- Fecho: o ponto aceso de um posto vira o ponto final de "Mapere." ----------
    let fonteAceso = null;
    const fecho = {
      // Acende o ponto do posto p no instante `quando`.
      acende(p, quando) {
        fonteAceso = p;
        e.pulsoDesde = quando;
        tl.to(p.anel, { autoAlpha: 0, duration: 0.15 }, quando);
        tl.to(p.cheio, { autoAlpha: 0, duration: 0.15 }, quando + 0.2);
        tl.to(e, { aceso: 1, duration: 0.4, ease: 'entrada' }, quando);
      },
      // O mapa apaga, o ponto voa e as letras do logo entram.
      logo(quando) {
        tl.to(['#pontos', '#rotulos', '#rodape'], { autoAlpha: 0, duration: 0.45, ease: 'power2.inOut' }, quando);
        tl.to('#cidade', { opacity: 0.16, duration: 0.6, ease: 'power2.inOut' }, quando);
        tl.to(e, { voo: 1, duration: 0.85, ease: 'power2.inOut' }, quando + 0.05);
        tl.fromTo(letras, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'entrada', stagger: 0.045 }, quando + 0.3);
        tl.fromTo(logoPonto, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, quando + 0.9);
        tl.fromTo('#aceso', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01 }, quando + 0.9);
      },
    };

    // ---------- Estado inicial ----------
    gsap.set(['#mundo', '#veu-base', '#pontos', '#rotulos', '#rodape'], { autoAlpha: 0 });
    gsap.set(barras, { autoAlpha: 0 });
    gsap.set(nomes, { autoAlpha: 0, y: 24 });
    gsap.set(letras, { autoAlpha: 0 });
    gsap.set(logoPonto, { autoAlpha: 0 });

    const capitulos = {
      barras,
      nomes,
      // As barras aparecem (a cena pode fazer a própria transição antes).
      mostrar(quando) {
        tl.to(barras, { autoAlpha: 1, duration: 0.25, stagger: 0.05 }, quando);
      },
      sai(quando) {
        sai('#capitulos', quando, { duration: 0.35 });
      },
    };

    const k = {
      tl, m: marcas, e, LEG, M, ICONES, $, svg, html, icone, chip, entra, sai, etiqueta,
      caminho, lerp, rampa, limita, mapa, fecho, capitulos, titulo, rodape,
    };

    // A cena monta o que é dela.
    cfg.montar(k);

    // Padrões do kit, se a cena não mudou: título sai e barras entram no 1º capítulo.
    const cap1 = LEG.capitulos[0]?.ini;
    if (cap1 != null) {
      if (!k.tituloJaSai) sai(titulo, cap1 - 0.32, { y: -16, duration: 0.25 });
      if (!k.barrasJaEntram) capitulos.mostrar(cap1 - 0.1);
      if (cfg.nomesDosCapitulos !== false) {
        LEG.capitulos.forEach((c, i) => {
          if (i > 0) tl.to(nomes[i - 1], { autoAlpha: 0, y: -18, duration: 0.2, ease: 'power2.in' }, c.ini - 0.2);
          tl.to(nomes[i], { autoAlpha: 1, y: 0, duration: 0.35, ease: 'entrada' }, c.ini + 0.1);
        });
      }
    }
    tl.set({}, {}, marcas.fim);

    // ---------- Desenho de um quadro ----------
    const aceso = $('#aceso');
    const halo = aceso.querySelector('.halo');
    const miolo = aceso.querySelector('.miolo');
    let alvoLogo = null;
    function desenhar() {
      const t = tl.time();
      const s = cam.s * e.zoom;
      const tx = ANCORA.x - cam.x * s;
      const ty = ANCORA.y - cam.y * s;
      mundo.style.transform = `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${s.toFixed(4)})`;
      $('#arterias').style.strokeWidth = (1.15 * Math.pow(1.09 / s, 0.55)).toFixed(3);
      for (const p of postos) {
        p.tela = [tx + p.xy[0] * s, ty + p.xy[1] * s];
        const move = `translate(${p.tela[0].toFixed(2)}px,${p.tela[1].toFixed(2)}px)`;
        p.ponto.style.transform = move;
        for (const r of p.rotulosEstado) r.r.style.transform = move;
      }
      // Barra de capítulos: o atual em Brasa, os já vistos em cinza.
      let atual = -1;
      LEG.capitulos.forEach((c, i) => {
        if (t >= c.ini - 0.1) atual = i;
      });
      barras.forEach((b, i) => (b.style.background = i === atual ? '#F0641E' : i < atual ? '#8c857b' : '#45392f'));
      // Ponto aceso.
      if (fonteAceso) {
        const de = fonteAceso.tela;
        const para = alvoLogo || { x: de[0], y: de[1], w: 24, h: 24 };
        const ax = lerp(de[0], para.x, e.voo);
        const ay = lerp(de[1], para.y, e.voo);
        const w = lerp(24, para.w, e.voo);
        const h = lerp(24, para.h, e.voo);
        const pulso = 1 + 0.14 * Math.sin((t - (e.pulsoDesde || 0)) * Math.PI * 1.6);
        const raioHalo = 2.4 * pulso * e.aceso;
        aceso.style.transform = `translate(${ax.toFixed(2)}px,${ay.toFixed(2)}px)`;
        const contorno = 2.5 * e.aceso * (1 - rampa(0, 0.4, e.voo));
        miolo.style.cssText = `left:${(-w / 2) * e.aceso}px;top:${(-h / 2) * e.aceso}px;width:${w * e.aceso}px;height:${h * e.aceso}px;box-shadow:0 0 0 ${contorno.toFixed(2)}px #f3ede2`;
        halo.style.cssText = `left:${-12 * raioHalo}px;top:${-12 * raioHalo}px;width:${24 * raioHalo}px;height:${24 * raioHalo}px;opacity:${(0.28 * (1 - rampa(0, 0.5, e.voo))).toFixed(3)}`;
      }
      // Legenda: a palavra falada acende em Brasa.
      for (const b of blocos) {
        b.no.style.visibility = t >= b.ini && t < b.sai ? 'visible' : 'hidden';
        const ent = rampa(b.ini, b.ini + 0.1, t);
        b.no.style.opacity = ent.toFixed(3);
        b.no.style.transform = `translateY(${((1 - ent) * 10).toFixed(2)}px)`;
        let at = -1;
        b.palavras.forEach((p, j) => {
          if (t >= p.ini - 0.001) at = j;
        });
        const terminou = b.linha === ULT && t > b.palavras[b.palavras.length - 1].fim + 0.12;
        b.palavras.forEach((p, j) => (p.no.className = j > at ? 'futura' : j === at && !terminou ? 'agora' : ''));
      }
      if (cfg.desenhar) cfg.desenhar(t, k);
    }
    tl.eventCallback('onUpdate', desenhar);

    // ---------- Pronto para capturar ----------
    const fontes = ['800 82px "Bricolage Grotesque"', '800 64px "Atkinson Hyperlegible Next"', '500 32px "Atkinson Hyperlegible Mono"'];
    await Promise.all(fontes.map((f) => document.fonts.load(f, 'Mapere 4 status')));
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.decode()));
    if (cfg.fundo) await new Promise((ok, erro) => { const i = new Image(); i.onload = ok; i.onerror = () => erro(new Error('fundo não carregou')); i.src = cfg.fundo; });
    window.__fontes = fontes.map((f) => ({ fonte: f, ok: document.fonts.check(f, 'Mapere 4 status') }));
    const r = logoPonto.getBoundingClientRect();
    alvoLogo = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };

    // Uma passada pela linha do tempo: daí em diante o quadro N depende só de N.
    tl.progress(1).progress(0);
    desenhar();
    window.__duracao = marcas.fim;
    window.__marcas = marcas;
    window.__ir = (segundos) => {
      tl.time(limita(segundos, 0, marcas.fim));
      desenhar();
    };
    document.body.dataset.pronto = window.__fontes.every((f) => f.ok) ? '1' : 'erro';
  }

  window.Kit = {
    iniciar(cfg) {
      iniciar(cfg).catch((err) => {
        console.error(err);
        document.body.dataset.pronto = 'erro';
        throw err;
      });
    },
  };
})();
