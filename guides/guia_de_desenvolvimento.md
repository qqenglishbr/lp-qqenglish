Aqui está o guia de desenvolvimento para a Landing Page (LP) específica do **Método Callan**. Este guia consolida as novas diretrizes estratégicas de 2026, focando em alta conversão para `ftl_completed` (aula concluída) e posicionamento premium.

---

# Guia de Desenvolvimento: Landing Page [Callan Method]

**Objetivo da Página:** Converter tráfego de alta intenção (focado em rapidez/eficiência) em agendamentos de aula experimental, filtrando curiosos que buscam "grátis" e focando em quem tem potencial para os Planos Mensais,.

**Stack Tecnológico:** Astro + Cloudflare (para velocidade máxima),.

---

### 1. Estrutura Visual e Mensagem (Copywriting)

A página deve seguir a estrutura "Promessa Principal + Prova de Autoridade + CTA".

#### **A. Hero Section (Dobra Superior)**
O foco é eficiência e velocidade.
*   **Headline (Título):** "Aprenda 4x mais rápido com o Método Callan original.",.
*   **Sub-headline:** "Escola certificada com professores treinados para sua evolução.".
*   **Visual:** Foto de professor(a) em ambiente de escritório (IT Park), com uniforme e postura formal. **Não** usar fotos que pareçam "home office" casual,.
*   **CTA Principal:** "Agendar Aula Experimental" (Destaque visual).
*   **Elemento de Confiança:** Selo "100% TESOL Certified" visível logo na primeira dobra.

#### **B. Seção de Autoridade e Método**
Reforce por que o método funciona e a seriedade da escola.
*   **Diferenciais:**
    *   "Desde 2009 — Ensino de alta qualidade com infraestrutura confiável".
    *   "Intensive Speaking / Conversation Intensive" (Palavras-chave da campanha).
    *   "Professores Especialistas: 100% certificados TESOL".
*   **Sobre o Callan:** Explicar brevemente que é focado em fala, repetição e correção instantânea, sem tradução.

#### **C. Seção de Planos **
Esta seção deve filtrar o público pelo poder de compra, eliminando a percepção de "curso barato".
*   **Ação Obrigatória:** Remover qualquer menção aos planos "Everyday" ou "Anual",.
*   **Planos Visíveis:** Mostrar apenas os planos **Monthly (Mensais)**:
    *   **Bronze:** R$ 176 / mês,.
    *   **Platina:** R$ 284 / mês,.
    *   **Prata:** R$ 375 / mês,.
    *   **Ouro:** R$ 510 / mês,.

*   **Mensagem de Valor:** Posicionar como um "Investimento na sua carreira", não como um custo.

---

### 2. Otimização do Formulário de Conversão (Lead Gen)

O formulário deve ser desenhado para qualificar o lead e garantir o comparecimento (Show Rate).

*   **Campos Mínimos:** Idade e Objetivo (Goal).
*   **Mensagem de "Filtro":** O formulário ou o texto próximo a ele deve deixar explícito que se trata de um programa pago profissional ("Explicit paid-program messaging"). Isso evita leads que procuram apenas conteúdo gratuito/ONGs.
*   **Micro-compromisso:** Adicionar um checkbox ou etapa antes do agendamento: *"Confirmo que comparecerei à aula"*.

---

### 3. Implementação Técnica de Rastreamento (Tracking)

A otimização das campanhas depende da implementação correta destes eventos no código da página.

#### **Eventos de Conversão (Google Ads & Analytics)**
1.  **`generate_lead`**: Disparado quando o usuário preenche o formulário inicial.
2.  **`whatsapp_verified`**: Disparado quando o usuário verifica o número (se houver essa etapa no fluxo).
3.  **`ftl_scheduled`**: Disparado quando o usuário escolhe o horário e confirma o agendamento.
4.  **`ftl_completed`**: (O mais importante) Deve estar preparado para receber o *postback* via conversão offline ou integração com HubSpot quando o lead de fato assistir à aula,.

#### **Audience Building**
*   Criar listas de remarketing baseadas em quem visitou a LP mas não agendou, para serem usadas nas campanhas de YouTube "Consideration".

---

### 4. Checklist de Design (Style Guide)
*   **Logos:** Usar o logo da QQEnglish com o tagline "Gateway to the World" próximo a ele.
*   **Selos:** TESOL, Callan Method Official Organisation.
*   **Ambiente:** As imagens devem transmitir "Escritório Corporativo" e não "Professor Freelancer em casa" para justificar o valor premium.

### Resumo das Ações Imediatas para o Desenvolvedor:
1.  **Limpar Planos Antigos:** Excluir do código as tabelas de preço do plano Anual e Everyday.
2.  **Atualizar Preços:** Inserir os valores R$ 375 e R$ 510.
3.  **Verificar Tags:** Garantir que o GTM (Google Tag Manager) está disparando os eventos `ftl_scheduled` corretamente.
4.  **Ajustar Copy do Hero:** Focar em "4x mais rápido" e "Original Callan".