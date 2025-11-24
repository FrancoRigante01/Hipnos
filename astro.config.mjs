import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    define: {
      'import.meta.env.PUBLIC_DEEPGRAM_API_KEY': JSON.stringify(process.env.PUBLIC_DEEPGRAM_API_KEY || '')
    }
  }
});
