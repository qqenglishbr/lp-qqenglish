# CLAUDE.md

Este arquivo fornece orientações para o Claude Code ao trabalhar com este repositório.

## Visão Geral do Projeto

Monorepo contendo as Landing Pages de alta performance da QQEnglish, construídas com Astro e deployadas no Cloudflare Pages.

## Estrutura do Monorepo

```
/lp-qqenglish/
├── guides/                    # Guias de desenvolvimento (CONSULTAR ANTES DE IMPLEMENTAR)
│   └── performance-optimization-guide.md
├── shared/                    # CÓDIGO COMPARTILHADO (usado por todas as LPs)
│   └── src/
│       ├── components/        # Header, Footer, CookieConsent, ValidationForm, ScheduleForm
│       ├── layouts/           # Layout.astro base
│       ├── pages/             # Páginas comuns (validacao, agendamento, sucesso)
│       └── api/               # API compartilhada (lead.ts)
├── callan/                    # LP Método Callan (PRODUÇÃO)
│   └── src/
│       ├── components/        # Componentes ESPECÍFICOS do Callan
│       └── pages/             # index.astro + imports do shared
├── kids/                      # LP QQEnglish Kids (EM DESENVOLVIMENTO)
│   └── src/
│       ├── components/        # Componentes ESPECÍFICOS do Kids
│       └── pages/
├── business/                  # LP QQEnglish Business (EM DESENVOLVIMENTO)
│   └── src/
│       ├── components/        # Componentes ESPECÍFICOS do Business
│       └── pages/
├── promo/                     # LP Pós-FTL (leads que já fizeram FTL → checkout)
│   └── src/
│       ├── components/        # Componentes ESPECÍFICOS do Promo
│       └── pages/
├── recovery/                  # LP FTL Recovery (leads que cadastraram mas não fizeram FTL)
│   └── src/
│       ├── components/        # Componentes ESPECÍFICOS do Recovery
│       └── pages/
├── adults/                    # LP Inglês para Adultos (adults.qqenglish.com.br)
│   └── src/
│       ├── components/        # Componentes ESPECÍFICOS do Adults
│       └── pages/
├── intensivo/                 # LP Curso de Inglês Rápido (intensivo.qqenglish.com.br)
│   └── src/
│       ├── components/        # Componentes ESPECÍFICOS do Intensivo
│       └── pages/
├── package.json               # Package.json raiz do monorepo
└── CLAUDE.md
```

## Código Compartilhado (shared/)

O diretório `shared/` contém código reutilizado por todas as LPs:

### Componentes Compartilhados
- `Header.astro` - Cabeçalho com logo e CTA
- `Footer.astro` - Rodapé com links e redes sociais
- `CookieConsent.astro` - Banner de consentimento de cookies
- `ValidationForm.astro` - Formulário de validação de WhatsApp
- `ScheduleForm.astro` - Formulário de agendamento

### Layout Compartilhado
- `Layout.astro` - Layout base com GTM, Meta Pixel, fonts e estilos globais

### Páginas Compartilhadas
- `validacao.astro` - Página de validação de WhatsApp
- `agendamento.astro` - Página de agendamento de aula
- `sucesso.astro` - Página de confirmação

### Como Importar do Shared
```astro
---
// Em qualquer LP, use caminhos relativos para o shared:
import Layout from '../../../shared/src/layouts/Layout.astro';
import Header from '../../../shared/src/components/Header.astro';
import Footer from '../../../shared/src/components/Footer.astro';
---
```

## Guias de Desenvolvimento

**IMPORTANTE:** Antes de implementar funcionalidades, consulte os guias em `/guides/`:

- **[performance-optimization-guide.md](guides/performance-optimization-guide.md)** - Técnicas de otimização de performance

## Comandos

### Desenvolvimento
```bash
npm run dev:callan        # Inicia servidor dev Callan (http://localhost:4321)
npm run dev:kids          # Inicia servidor dev Kids
npm run dev:business      # Inicia servidor dev Business
npm run dev:promo         # Inicia servidor dev Promo
npm run dev:recovery      # Inicia servidor dev Recovery
npm run dev:adults        # Inicia servidor dev Adults (http://localhost:4326)
npm run dev:intensivo     # Inicia servidor dev Intensivo (http://localhost:4328)
```

### Build
```bash
npm run build:callan      # Build do projeto Callan
npm run build:kids        # Build do projeto Kids
npm run build:business    # Build do projeto Business
npm run build:promo       # Build do projeto Promo
npm run build:recovery    # Build do projeto Recovery
npm run build:adults      # Build do projeto Adults
npm run build:intensivo   # Build do projeto Intensivo
npm run build:all         # Build de todos os projetos
```

### Deploy (Cloudflare Pages)
```bash
npx wrangler login        # Login no Cloudflare (uma vez)
npm run deploy:callan     # Deploy LP Callan
npm run deploy:kids       # Deploy LP Kids
npm run deploy:business   # Deploy LP Business
npm run deploy:promo      # Deploy LP Promo
npm run deploy:recovery   # Deploy LP Recovery
npm run deploy:adults     # Deploy LP Adults
npm run deploy:intensivo  # Deploy LP Intensivo
```

## Arquitetura

**Stack**: Astro 4.x + Cloudflare Pages adapter (SSR mode)

### Fluxo da API de Leads
O endpoint `/api/lead`:
1. Valida formato de telefone brasileiro (10-11 dígitos) e email
2. Envia dados para webhook N8N (processamento CRM)
3. Envia evento de conversão para Meta CAPI (dados hasheados)
4. Retorna `lead_id` para tracking no frontend

### Arquitetura de Tracking
- **dataLayer events**: `page_data`, `scroll_depth`, `form_start`, `form_submit`, `conversion`
- UTM parameters capturados no carregamento e armazenados em `sessionStorage`
- Meta Pixel client-side + Conversions API server-side para redundância

## URLs de Produção

| LP | URL | Status | Descrição |
|----|-----|--------|-----------|
| Callan | https://callan.qqenglish.com.br | ✅ Produção | LP principal Método Callan |
| Kids | https://kids.qqenglish.com.br | 🚧 Desenvolvimento | LP para público infantil |
| Business | https://business.qqenglish.com.br | ✅ Produção | LP para empresas |
| Promo | https://promo.qqenglish.com.br | 🚧 Desenvolvimento | Pós-FTL (direto ao checkout) |
| Recovery | https://recovery.qqenglish.com.br | ✅ Produção | FTL Recovery (leads que não completaram) |
| Adults | https://adults.qqenglish.com.br | 🚧 Desenvolvimento | Inglês para Adultos (campanhas Ads) |
| Intensivo | https://intensivo.qqenglish.com.br | 🚧 Desenvolvimento | Curso de Inglês Rápido (keyword Ads) |

## Notas de Desenvolvimento

- **Código compartilhado vai em `shared/`** - Alterações refletem em todas as LPs
- **Código específico vai em `{lp}/src/components/`** - Componentes únicos de cada LP
- Cloudflare adapter só carrega em produção (`NODE_ENV=production`)
- **Sempre aplicar otimizações de performance conforme o guia**
- **Usar WebP para todas as imagens**
- **Implementar YouTube lazy loading (facade pattern) para vídeos**
- **Adicionar width/height em todas as imagens para evitar CLS**

## Metas de Performance

| Métrica | Desktop | Mobile |
|---------|---------|--------|
| Performance Score | > 90 | > 70 |
| LCP | < 2.5s | < 4s |
| CLS | 0 | 0 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
