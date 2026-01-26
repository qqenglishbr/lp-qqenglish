# Guia de Otimização de Performance - Landing Pages

Este guia documenta as técnicas de otimização aplicadas na landing page QQEnglish, resultando em:
- **Desktop: 91** (Performance Score)
- **Mobile: 71** (Performance Score)
- **CLS: 0** (Cumulative Layout Shift)
- **Best Practices: 100**
- **SEO: 100**

---

## 1. Otimização de Imagens

### 1.1 Usar formato WebP

WebP oferece compressão superior ao PNG/JPEG com qualidade visual equivalente.

**Conversão com cwebp:**
```bash
# Converter PNG para WebP com qualidade 85%
cwebp -q 85 imagem.png -o imagem.webp

# Converter múltiplas imagens
for f in *.png; do cwebp -q 85 "$f" -o "${f%.png}.webp"; done
```

**Economia típica:**
| Formato | Tamanho | Economia |
|---------|---------|----------|
| PNG | 364KB | - |
| WebP | ~50KB | ~86% |

### 1.2 Remover imagens duplicadas

Se existem versões PNG e WebP da mesma imagem, remova os PNGs após atualizar as referências no código.

### 1.3 Atributos obrigatórios para evitar CLS

**Sempre incluir `width` e `height`:**
```html
<!-- CORRETO -->
<img src="/images/hero.webp" alt="Hero" width="650" height="650" />

<!-- INCORRETO - causa Layout Shift -->
<img src="/images/hero.webp" alt="Hero" />
```

### 1.4 Lazy loading para imagens below-the-fold

```html
<!-- Imagem crítica (above-the-fold) - NÃO usar lazy -->
<img src="/images/hero.webp" fetchpriority="high" />

<!-- Imagens abaixo da dobra - usar lazy -->
<img src="/images/section.webp" loading="lazy" width="400" height="300" />
```

### 1.5 Preload da imagem LCP

No `<head>`:
```html
<link rel="preload" href="/images/hero-teacher.webp" as="image" type="image/webp" fetchpriority="high" />
```

---

## 2. YouTube Lazy Loading (Facade Pattern)

O iframe do YouTube carrega ~1MB de scripts. Use o padrão facade para carregar apenas quando o usuário clicar.

### 2.1 HTML

```html
<div class="video-container youtube-lazy" data-video-id="VIDEO_ID">
  <img
    src="https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg"
    alt="Título do vídeo"
    class="youtube-thumbnail"
    loading="lazy"
    width="480"
    height="360"
  />
  <button class="youtube-play-button" aria-label="Reproduzir vídeo">
    <svg viewBox="0 0 68 48" width="68" height="48">
      <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
      <path d="M 45,24 27,14 27,34" fill="#fff"></path>
    </svg>
  </button>
</div>
```

### 2.2 CSS

```css
.youtube-lazy {
  position: relative;
  cursor: pointer;
}

.youtube-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.youtube-play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 1;
}

.youtube-play-button:hover {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}
```

### 2.3 JavaScript

```javascript
document.querySelectorAll('.youtube-lazy').forEach(container => {
  container.addEventListener('click', function() {
    const videoId = this.getAttribute('data-video-id');
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'true');
    this.innerHTML = '';
    this.appendChild(iframe);
  });
});
```

**Economia:** ~1MB por visita (scripts só carregam quando usuário clica)

---

## 3. Resource Hints (Preconnect e DNS-Prefetch)

### 3.1 Ordem de prioridade

```html
<head>
  <!-- 1. Preconnect para recursos críticos -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- 2. Preconnect para scripts de terceiros -->
  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin />
  <link rel="preconnect" href="https://connect.facebook.net" crossorigin />

  <!-- 3. DNS-prefetch para recursos menos críticos -->
  <link rel="dns-prefetch" href="https://www.google-analytics.com" />

  <!-- 4. Preconnect para recursos lazy (YouTube thumbnails) -->
  <link rel="preconnect" href="https://i.ytimg.com" crossorigin />
</head>
```

### 3.2 Quando usar cada um

| Resource Hint | Quando usar |
|---------------|-------------|
| `preconnect` | Recursos que serão carregados com certeza |
| `dns-prefetch` | Recursos que podem ser carregados |
| `preload` | Recursos críticos (LCP image, fonts) |
| `prefetch` | Recursos de páginas futuras |

---

## 4. Carregamento de Fonts

### 4.1 Google Fonts otimizado

```html
<!-- Preload com fallback assíncrono -->
<link
  rel="preload"
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
</noscript>
```

### 4.2 Font-display: swap

Sempre usar `&display=swap` na URL do Google Fonts para evitar FOIT (Flash of Invisible Text).

---

## 5. Scripts de Terceiros

### 5.1 Defer GTM com requestIdleCallback

```javascript
function loadGTM() {
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer', 'GTM-XXXXXX');
}

// Carregar quando o browser estiver idle
if (window.requestIdleCallback) {
  requestIdleCallback(loadGTM);
} else {
  setTimeout(loadGTM, 1);
}
```

### 5.2 Impacto de scripts de terceiros

| Script | Tamanho típico | Impacto |
|--------|----------------|---------|
| GTM | ~80KB | Médio |
| Facebook Pixel | ~100KB | Alto |
| Google Analytics | ~50KB | Médio |
| YouTube iframe | ~1MB | Muito alto |

**Nota:** Scripts de terceiros são a principal causa de scores mobile baixos. Não há como eliminá-los sem perder funcionalidade de tracking.

---

## 6. Cache Headers (Cloudflare Pages)

Criar arquivo `public/_headers`:

```
# Images - Cache for 1 year
/images/*
  Cache-Control: public, max-age=31536000, immutable

# Fonts - Cache for 1 year
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# Static assets - Cache for 1 year
*.js
  Cache-Control: public, max-age=31536000, immutable
*.css
  Cache-Control: public, max-age=31536000, immutable

# HTML pages - Cache for 1 hour, revalidate
/*.html
  Cache-Control: public, max-age=3600, must-revalidate

# Root page
/
  Cache-Control: public, max-age=3600, must-revalidate

# Security Headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

---

## 7. Checklist de Otimização

### Imagens
- [ ] Converter todas as imagens para WebP
- [ ] Remover versões PNG duplicadas
- [ ] Adicionar `width` e `height` em todas as `<img>`
- [ ] Usar `loading="lazy"` em imagens below-the-fold
- [ ] Usar `fetchpriority="high"` na imagem LCP
- [ ] Preload da imagem LCP no `<head>`

### Vídeos
- [ ] Implementar YouTube facade pattern
- [ ] Usar thumbnails do YouTube como placeholder
- [ ] Carregar iframe apenas no clique

### Fonts
- [ ] Preload de Google Fonts
- [ ] Usar `display=swap`
- [ ] Preconnect para fonts.googleapis.com e fonts.gstatic.com

### Scripts
- [ ] Defer scripts não críticos
- [ ] Usar requestIdleCallback para GTM
- [ ] Preconnect para domínios de terceiros

### Cache
- [ ] Configurar cache headers para assets estáticos (1 ano)
- [ ] Configurar cache curto para HTML (1 hora)

---

## 8. Ferramentas de Teste

### PageSpeed Insights
```
https://pagespeed.web.dev/analysis?url=https://seu-site.com
```

### Lighthouse CLI
```bash
npx lighthouse https://seu-site.com --view
```

### WebPageTest
```
https://www.webpagetest.org/
```

---

## 9. Métricas Alvo

| Métrica | Bom | Precisa Melhorar | Ruim |
|---------|-----|------------------|------|
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| FID/TBT | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP | < 1.8s | 1.8s - 3s | > 3s |

---

## 10. Resultados Obtidos

### Antes das otimizações
- Performance Desktop: ~70
- Performance Mobile: ~50
- CLS: > 0.1

### Após as otimizações
- Performance Desktop: **91** (+21)
- Performance Mobile: **71** (+21)
- CLS: **0** (perfeito)
- Best Practices: **100**
- SEO: **100**

### Economia total
- ~700KB de imagens PNG removidas
- ~1MB de scripts YouTube (carregamento sob demanda)
- ~20KB de imagens convertidas para WebP
- CLS eliminado completamente

---

*Guia criado em Janeiro 2026 para o projeto QQEnglish Landing Page*
