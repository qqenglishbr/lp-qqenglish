import type { APIRoute } from 'astro';

// Mapping from country_code to code_id
const countryCodeToId: Record<string, string> = {
  '+93': '1', '+355': '2', '+213': '3', '+376': '5', '+244': '6', '+672': '8',
  '+54': '10', '+374': '11', '+297': '12', '+61': '13', '+43': '14', '+994': '15',
  '+973': '17', '+880': '18', '+375': '20', '+32': '21', '+501': '22', '+229': '23',
  '+975': '25', '+591': '26', '+387': '27', '+267': '28', '+55': '29', '+673': '31',
  '+359': '32', '+226': '33', '+257': '34', '+855': '35', '+237': '36', '+238': '38',
  '+236': '40', '+235': '41', '+56': '42', '+86': '43', '+57': '46', '+269': '47',
  '+682': '48', '+506': '49', '+225': '50', '+385': '51', '+357': '52', '+420': '53',
  '+243': '54', '+45': '55', '+253': '56', '+593': '59', '+20': '60', '+503': '61',
  '+224': '62', '+291': '63', '+372': '64', '+251': '65', '+500': '66', '+298': '67',
  '+252': '68', '+691': '69', '+679': '70', '+358': '71', '+33': '72', '+594': '73',
  '+689': '74', '+241': '75', '+220': '76', '+995': '77', '+49': '78', '+233': '79',
  '+350': '80', '+30': '81', '+299': '82', '+502': '84', '+245': '88', '+592': '89',
  '+509': '90', '+504': '91', '+852': '92', '+36': '93', '+354': '94', '+91': '95',
  '+62': '96', '+98': '97', '+964': '98', '+353': '99', '+972': '100', '+39': '101',
  '+81': '103', '+962': '104', '+7': '105', '+254': '106', '+686': '107', '+965': '108',
  '+996': '109', '+856': '110', '+371': '111', '+961': '112', '+266': '113', '+231': '114',
  '+218': '115', '+423': '116', '+370': '117', '+352': '118', '+853': '119', '+389': '120',
  '+261': '121', '+265': '122', '+60': '123', '+960': '124', '+223': '125', '+356': '126',
  '+692': '127', '+596': '128', '+222': '129', '+230': '130', '+52': '132', '+373': '133',
  '+377': '134', '+976': '135', '+382': '136', '+212': '138', '+258': '139', '+95': '140',
  '+264': '141', '+674': '142', '+977': '143', '+31': '144', '+687': '145', '+64': '146',
  '+505': '147', '+227': '148', '+234': '149', '+683': '150', '+850': '152', '+47': '154',
  '+968': '155', '+92': '156', '+680': '157', '+507': '158', '+675': '159', '+595': '160',
  '+51': '161', '+63': '162', '+48': '163', '+351': '164', '+974': '166', '+242': '167',
  '+262': '168', '+40': '169', '+250': '171', '+685': '172', '+378': '173', '+239': '174',
  '+966': '175', '+221': '176', '+381': '177', '+248': '178', '+232': '179', '+65': '180',
  '+421': '182', '+386': '183', '+677': '184', '+27': '185', '+82': '186', '+34': '187',
  '+94': '188', '+290': '189', '+508': '192', '+249': '194', '+597': '195', '+268': '196',
  '+46': '197', '+41': '198', '+963': '199', '+886': '200', '+992': '201', '+255': '202',
  '+66': '203', '+228': '204', '+690': '205', '+676': '206', '+216': '208', '+90': '209',
  '+993': '210', '+688': '212', '+256': '214', '+380': '215', '+971': '216', '+44': '217',
  '+598': '219', '+998': '220', '+678': '221', '+58': '223', '+84': '224', '+681': '225',
  '+967': '226', '+260': '227', '+263': '228', '+1': '218'
};

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

// Remove accents from text (João → Joao, José → Jose)
function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Capitalize name properly (first letter uppercase, rest lowercase)
function capitalizeName(name: string): string {
  return removeAccents(name)
    .toLowerCase()
    .split(/\s+/)
    .map(word => {
      // Keep prepositions/articles lowercase (common in Portuguese names)
      const lowercase = ['da', 'de', 'do', 'das', 'dos', 'e'];
      if (lowercase.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Split full name into firstname and surname
function splitName(fullName: string): { firstname: string; surname: string; fullname: string } {
  const capitalized = capitalizeName(fullName.trim());
  const parts = capitalized.split(/\s+/);
  const firstname = parts[0] || '';
  const surname = parts.slice(1).join(' ') || '';
  return { firstname, surname, fullname: capitalized };
}

// Generate 6-digit WhatsApp validation code (cryptographically secure)
function generateValidationCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
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
    const countryCodeDigits = countryCode.replace('+', '');
    const phoneDigits = data.phone.replace(/\D/g, '');

    // Check if phone already includes country code to avoid duplication
    const phoneWithoutCountry = phoneDigits.startsWith(countryCodeDigits)
      ? phoneDigits.slice(countryCodeDigits.length)
      : phoneDigits;
    const fullPhoneNumber = countryCodeDigits + phoneWithoutCountry;

    const { firstname, surname, fullname } = splitName(data.name);

    const leadPayload = {
      lead_id: leadId,
      firstname,
      surname,
      fullname,
      email: data.email.trim().toLowerCase(),
      phone: phoneWithoutCountry,
      phone_formatted: data.phone,
      phone_full: fullPhoneNumber,
      phone_international: `+${fullPhoneNumber}`,
      country_code: countryCode,
      code_id: countryCodeToId[countryCode] || '',
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
      source: 'landing_page',
      // WhatsApp validation
      validation_code: generateValidationCode()
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
