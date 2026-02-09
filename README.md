# QQEnglish Landing Pages

Monorepo contendo as Landing Pages de alta performance da QQEnglish, construídas com Astro e deployadas no Cloudflare Pages.

## Stack

- **Framework**: Astro 4.x
- **Hosting**: Cloudflare Pages (SSR mode)
- **Tracking**: GTM + GA4 + Meta Pixel + Conversions API
- **Webhook**: N8N

## Estrutura do Monorepo

```
lp-qqenglish/
├── shared/               # Código compartilhado por todas as LPs
│   └── src/
│       ├── components/   # Header, Footer, CookieConsent, ValidationForm, ScheduleForm
│       ├── layouts/      # Layout.astro base
│       └── pages/        # Páginas comuns (validacao, agendamento, sucesso)
├── callan/               # LP Método Callan
├── kids/                 # LP QQEnglish Kids
├── business/             # LP QQEnglish Business
├── promo/                # LP Pós-FTL (leads → checkout)
├── recovery/             # LP FTL Recovery
└── guides/               # Guias de desenvolvimento
```

## Landing Pages

| LP | Descrição | URL |
|----|-----------|-----|
| **Callan** | LP principal do Método Callan | https://callan.qqenglish.com.br |
| **Kids** | LP para público infantil | https://kids.qqenglish.com.br |
| **Business** | LP para empresas | https://business.qqenglish.com.br |
| **Promo** | Pós-FTL (direto ao checkout) | https://promo.qqenglish.com.br |
| **Recovery** | FTL Recovery (leads que não completaram) | https://recovery.qqenglish.com.br |

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` em cada LP e preencha:

```bash
cp callan/.env.example callan/.env
```

Variáveis necessárias:
- `GTM_ID` - ID do Google Tag Manager
- `GA4_ID` - ID do Google Analytics 4
- `META_PIXEL_ID` - ID do Meta Pixel
- `META_ACCESS_TOKEN` - Token para Conversions API
- `N8N_WEBHOOK_URL` - URL do webhook no N8N

## Comandos

### Desenvolvimento

```bash
npm run dev:callan        # http://localhost:4321
npm run dev:kids
npm run dev:business
npm run dev:promo
npm run dev:recovery
```

### Build

```bash
npm run build:callan
npm run build:kids
npm run build:business
npm run build:promo
npm run build:recovery
npm run build:all         # Build de todos
```

### Deploy (Cloudflare Pages)

```bash
npx wrangler login        # Login no Cloudflare (uma vez)
npm run deploy:callan
npm run deploy:kids
npm run deploy:business
npm run deploy:promo
npm run deploy:recovery
```

### Configurar Secrets no Cloudflare

```bash
npx wrangler pages secret put META_PIXEL_ID
npx wrangler pages secret put META_ACCESS_TOKEN
npx wrangler pages secret put N8N_WEBHOOK_URL
```

## Tracking Events

O dataLayer envia os seguintes eventos:

| Evento | Trigger | Dados |
|--------|---------|-------|
| `page_data` | Page load | utm_*, page_path, page_title |
| `scroll_depth` | Scroll 25/50/75/100% | scroll_percent |
| `form_start` | Primeiro campo focado | form_id, field_name |
| `form_submit` | Submit com sucesso | form_id, lead_id |
| `conversion` | Após form_submit | conversion_type, value |

## API de Leads

**Endpoint**: `POST /api/lead`

**Payload**:
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "brand"
}
```

**Resposta**:
```json
{
  "success": true,
  "lead_id": "lead_abc123_xyz789",
  "message": "Lead registrado com sucesso"
}
```

## Performance

- Zero JavaScript framework (HTML/CSS puro por padrão)
- Score Lighthouse esperado: 90+ desktop / 70+ mobile
- TTFB < 100ms (edge global)
- LCP < 2.5s desktop / < 4s mobile
- CLS = 0

## Customização

### Alterar cores

Edite as CSS variables em `shared/src/layouts/Layout.astro`:

```css
:root {
  --color-primary: #0066FF;
  --color-secondary: #00D4AA;
  --color-dark: #0A1628;
}
```

### Adicionar novas seções

1. Crie um novo componente em `{lp}/src/components/`
2. Importe e adicione em `{lp}/src/pages/index.astro`

## Licença

Proprietário - QQEnglish Brasil
