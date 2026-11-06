import { defineConfig } from 'astro/config';

// mapere.com.br ainda não foi comprado: serve só como URL canônica.
export default defineConfig({
  site: 'https://mapere.com.br',
  compressHTML: true,
  devToolbar: { enabled: false },
  build: {
    inlineStylesheets: 'always',
  },
  image: {
    service: { entrypoint: 'astro/assets/services/noop' },
  },
});
