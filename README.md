# QQEnglish Landing Page

Landing page de alta performance para captura de leads, construída com Astro e otimizada para Cloudflare Pages.

## Stack

- **Framework**: Astro 4.x
- **Hosting**: Cloudflare Pages
- **Tracking**: GTM + GA4 + Meta Pixel + Conversions API
- **Webhook**: N8N

## Performance

- Zero JavaScript framework (HTML/CSS puro por padrão)
- Score Lighthouse esperado: 95+
- TTFB < 100ms (edge global)
- FCP < 1.5s

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

Variáveis necessárias:
- `GTM_ID` - ID do Google Tag Manager
- `GA4_ID` - ID do Google Analytics 4
- `META_PIXEL_ID` - ID do Meta Pixel
- `META_ACCESS_TOKEN` - Token para Conversions API
- `N8N_WEBHOOK_URL` - URL do webhook no N8N

### 3. Desenvolvimento local

```bash
npm run dev
```

Acesse: http://localhost:4321

### 4. Build

```bash
npm run build
```

## Deploy no Cloudflare Pages

### Via Dashboard

1. Conecte seu repositório Git no Cloudflare Pages
2. Configure:
   - Build command: `npm run build`
   - Build output: `dist`
3. Adicione as variáveis de ambiente em Settings > Environment Variables

### Via Wrangler CLI

```bash
# Login
npx wrangler login

# Deploy
npx wrangler pages deploy dist
```

### Configurar Secrets

```bash
npx wrangler pages secret put META_PIXEL_ID
npx wrangler pages secret put META_ACCESS_TOKEN
npx wrangler pages secret put N8N_WEBHOOK_URL
```

## Estrutura do Projeto

```
lp-qqenglish/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Hero.astro         # Hero + formulário de lead
│   │   ├── Benefits.astro     # Seção de benefícios
│   │   ├── Testimonials.astro # Depoimentos
│   │   ├── FAQ.astro          # Perguntas frequentes
│   │   └── FinalCTA.astro     # CTA final + footer
│   ├── layouts/
│   │   └── Layout.astro       # Layout base + tracking
│   ├── pages/
│   │   ├── index.astro        # Página principal
│   │   └── api/
│   │       └── lead.ts        # API para receber leads
│   └── env.d.ts               # Tipos TypeScript
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── wrangler.toml
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

## Workflow N8N Sugerido

1. Recebe webhook com dados do lead
2. Valida e formata dados
3. Salva no MySQL (tabela wp_leads ou CPT no WordPress)
4. Envia notificação (Telegram/Slack/Email)
5. Adiciona ao CRM (opcional)

## Customização

### Alterar cores

Edite as CSS variables em `src/layouts/Layout.astro`:

```css
:root {
  --color-primary: #0066FF;
  --color-secondary: #00D4AA;
  --color-dark: #0A1628;
}
```

### Alterar textos

Edite os props no `src/pages/index.astro` ou diretamente nos componentes.

### Adicionar novas seções

1. Crie um novo componente em `src/components/`
2. Importe e adicione em `src/pages/index.astro`

## Licença

Proprietário - QQEnglish Brasil
