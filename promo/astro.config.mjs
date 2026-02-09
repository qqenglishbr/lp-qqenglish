import { defineConfig } from 'astro/config';

// Detecta se está em desenvolvimento ou produção
const isDev = process.env.NODE_ENV !== 'production';

// Só importa o adapter Cloudflare em produção
const cloudflareAdapter = isDev ? undefined : (await import('@astrojs/cloudflare')).default;

export default defineConfig({
  output: 'server',
  adapter: isDev ? undefined : cloudflareAdapter({
    platformProxy: {
      enabled: true
    }
  }),
  server: {
    port: 4325,
    host: true
  },
  vite: {
    define: {
      'process.env.GTM_ID': JSON.stringify(process.env.GTM_ID || 'GTM-XXXXXX')
    }
  }
});
