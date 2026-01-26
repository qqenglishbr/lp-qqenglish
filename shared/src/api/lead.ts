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
  // Meta/Facebook
  fbp?: string;
  fbc?: string;
  // TikTok
  ttclid?: string;
  // Page info
  landing_page_url?: string;
  referrer?: string;
}

interface MetaEvent {
  event_name: string;
  event_time: number;
  action_source: string;
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: {
    content_name?: string;
    content_category?: string;
    utm_source?: string;
    utm_campaign?: string;
  };
  event_source_url?: string;
}

// Simple hash function for Meta CAPI (SHA256)
async function hashForMeta(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
  // Minimum digits vary by country, but 7 is a reasonable minimum for international
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

    // Get environment variables
    const n8nWebhookUrl = import.meta.env.N8N_WEBHOOK_URL;
    const metaPixelId = import.meta.env.META_PIXEL_ID;
    const metaAccessToken = import.meta.env.META_ACCESS_TOKEN;

    const promises: Promise<any>[] = [];

    // 1. Send to N8N Webhook
    if (n8nWebhookUrl) {
      const n8nPromise = fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload),
      }).catch(err => {
        console.error('N8N Webhook error:', err);
      });

      promises.push(n8nPromise);
    }

    // 2. Send to Meta Conversions API
    if (metaPixelId && metaAccessToken) {
      const firstName = data.name.split(' ')[0];

      const metaEvent: MetaEvent = {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          em: [await hashForMeta(data.email)],
          ph: [await hashForMeta(fullPhoneNumber)],
          fn: [await hashForMeta(firstName)],
          client_ip_address: clientAddress || undefined,
          client_user_agent: userAgent || undefined,
        },
        custom_data: {
          content_name: 'QQEnglish Lead Form',
          content_category: 'Education',
          utm_source: data.utm_source || undefined,
          utm_medium: data.utm_medium || undefined,
          utm_campaign: data.utm_campaign || undefined,
          utm_content: data.utm_content || undefined,
          utm_term: data.utm_term || undefined,
        },
        event_source_url: data.landing_page_url || undefined,
      };

      // Use fbp/fbc from form data (more reliable) or fall back to cookies
      const cookieHeader = request.headers.get('cookie') || '';
      const fbpMatch = cookieHeader.match(/_fbp=([^;]+)/);
      const fbcMatch = cookieHeader.match(/_fbc=([^;]+)/);

      // Prefer form data over cookies (form data comes from client-side JS)
      metaEvent.user_data.fbp = data.fbp || (fbpMatch ? fbpMatch[1] : undefined);
      metaEvent.user_data.fbc = data.fbc || (fbcMatch ? fbcMatch[1] : undefined);

      const metaPromise = fetch(
        `https://graph.facebook.com/v18.0/${metaPixelId}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [metaEvent],
            access_token: metaAccessToken,
          }),
        }
      ).catch(err => {
        console.error('Meta CAPI error:', err);
      });

      promises.push(metaPromise);
    }

    // Wait for all requests (but don't fail if one fails)
    await Promise.allSettled(promises);

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
