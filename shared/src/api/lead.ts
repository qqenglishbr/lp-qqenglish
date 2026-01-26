import type { APIRoute } from 'astro';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  country_code?: string;
  // UTM Parameters
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  // Google Ads Click IDs
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  // Meta/Facebook (captured for N8N/CRM)
  fbp?: string;
  fbc?: string;
  // TikTok
  ttclid?: string;
  // Page info
  landing_page_url?: string;
  referrer?: string;
}

// Generate unique lead ID
function generateLeadId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `lead_${timestamp}_${randomPart}`;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone (international format)
function isValidPhone(phone: string, countryCode?: string): boolean {
  const digits = phone.replace(/\D/g, '');
  const minDigits = countryCode === '+55' ? 10 : 7;
  return digits.length >= minDigits && digits.length <= 15;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const data: LeadData = await request.json();

    // Validation
    if (!data.name || data.name.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nome inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.email || !isValidEmail(data.email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'E-mail inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.phone || !isValidPhone(data.phone, data.country_code)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Telefone inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const leadId = generateLeadId();
    const timestamp = new Date().toISOString();
    const userAgent = request.headers.get('user-agent') || '';

    // Prepare lead payload
    const countryCode = data.country_code || '+55';
    const phoneDigits = data.phone.replace(/\D/g, '');
    const fullPhoneNumber = countryCode.replace('+', '') + phoneDigits;

    const leadPayload = {
      lead_id: leadId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: phoneDigits,
      phone_formatted: data.phone,
      phone_full: fullPhoneNumber,
      phone_international: `+${fullPhoneNumber}`,
      country_code: countryCode,
      // UTM Parameters
      utm_source: data.utm_source || '(direct)',
      utm_medium: data.utm_medium || '(none)',
      utm_campaign: data.utm_campaign || '(not set)',
      utm_content: data.utm_content || '',
      utm_term: data.utm_term || '',
      // Google Ads Click IDs
      gclid: data.gclid || '',
      gbraid: data.gbraid || '',
      wbraid: data.wbraid || '',
      // Meta/Facebook
      fbp: data.fbp || '',
      fbc: data.fbc || '',
      // TikTok
      ttclid: data.ttclid || '',
      // Page info
      landing_page_url: data.landing_page_url || '',
      referrer: data.referrer || '',
      // Request metadata
      ip_address: clientAddress || request.headers.get('cf-connecting-ip') || '',
      user_agent: userAgent,
      created_at: timestamp,
      source: 'landing_page'
    };

    // Send to N8N Webhook
    const n8nWebhookUrl = import.meta.env.N8N_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload),
      }).catch(err => {
        console.error('N8N Webhook error:', err);
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        message: 'Lead registrado com sucesso'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );

  } catch (error) {
    console.error('Lead submission error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Block other methods
export const ALL: APIRoute = () => {
  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
