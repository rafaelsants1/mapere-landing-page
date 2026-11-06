# Mapere · lista de espera

Landing em Astro + GSAP + Lenis. Textos em `src/data/copy.ts`, tokens em `src/styles/tokens.css`, cenas em `src/scripts/motion/`.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # verifica tipos e gera dist/
npm run preview
```

## Dados e mídia gerados

| Comando | O que faz | Precisa de |
|---|---|---|
| `npm run map` | Reprojeta os mapas a partir de `data/osm/` | cache do OSM (baixa do Overpass se faltar) |
| `npm run map:refresh` | Baixa de novo do Overpass | rede |
| `npm run frames` | Extrai os quadros da abertura | ffmpeg |
| `npm run og` | Gera `public/og.jpg` | nada |
| `npm run fonts` | Gera as fontes woff2 | Python com `fonttools` e `brotli` |

Os arquivos gerados já estão no projeto: o build funciona sem rodar nada disso.

## Lista de espera

`PUBLIC_WAITLIST_PROVIDER` escolhe o provedor (ver `.env.example`). `local` só funciona em desenvolvimento: em produção a página avisa que a lista não está aberta e nada é salvo. Para ativar de verdade, rode `docs/supabase.sql` no Supabase e preencha as variáveis.

Mais detalhes de marca em `DESIGN.md`, e de origem das imagens em `CREDITOS.md`.
