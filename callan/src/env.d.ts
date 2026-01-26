/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GTM_ID: string;
  readonly GA4_ID: string;
  readonly META_PIXEL_ID: string;
  readonly META_ACCESS_TOKEN: string;
  readonly N8N_WEBHOOK_URL: string;
  readonly SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global types for tracking
declare global {
  interface Window {
    dataLayer: Record<string, any>[];
    gtag: (...args: any[]) => void;
  }

  function fbq(...args: any[]): void;
}

export {};
