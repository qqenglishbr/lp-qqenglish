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
    port: 4323,
    host: true
  },
  vite: {
    define: {
      'process.env.GTM_ID': JSON.stringify(process.env.GTM_ID || 'GTM-XXXXXX'),
      'process.env.GA4_ID': JSON.stringify(process.env.GA4_ID || 'G-XXXXXXXXXX'),
      'process.env.META_PIXEL_ID': JSON.stringify(process.env.META_PIXEL_ID || ''),
      'process.env.N8N_WEBHOOK_URL': JSON.stringify(process.env.N8N_WEBHOOK_URL || ''),
      'process.env.META_ACCESS_TOKEN': JSON.stringify(process.env.META_ACCESS_TOKEN || '')
    }
  }
});
