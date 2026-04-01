const WA_API_URL = 'https://graph.facebook.com/v19.0';

function getConfig() {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!token || !phoneNumberId) {
    throw new Error('WhatsApp API not configured');
  }
  return { token, phoneNumberId, webhookVerifyToken };
}

interface SendTemplateResult {
  messaging_product: string;
  contacts: Array<{ wa_id: string }>;
  messages: Array<{ id: string }>;
}

/**
 * Send a review request message via WhatsApp template.
 */
export async function sendReviewRequest(params: {
  phone: string;
  customerName: string;
  businessName: string;
  reviewLink: string;
  templateName?: string;
  languageCode?: string;
}): Promise<{ messageId: string }> {
  const { token, phoneNumberId } = getConfig();
  const templateName = params.templateName || 'review_request';
  const languageCode = params.languageCode || 'en';

  const res = await fetch(`${WA_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: params.phone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: params.customerName },
              { type: 'text', text: params.businessName },
              { type: 'text', text: params.reviewLink },
            ],
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `WhatsApp send failed (${res.status}): ${JSON.stringify(err)}`
    );
  }

  const data: SendTemplateResult = await res.json();
  return { messageId: data.messages?.[0]?.id ?? '' };
}

/**
 * Verify WhatsApp webhook subscription.
 */
export function verifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null
): string | null {
  const { webhookVerifyToken } = getConfig();
  if (mode === 'subscribe' && token === webhookVerifyToken) {
    return challenge;
  }
  return null;
}

export interface WebhookStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

/**
 * Parse status updates from WhatsApp webhook payload.
 */
export function parseWebhookStatuses(body: unknown): WebhookStatus[] {
  const statuses: WebhookStatus[] = [];
  const payload = body as { entry?: Array<{ changes?: Array<{ value?: { statuses?: Array<{ id: string; status: string; timestamp: string }> } }> }> };

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const s of change.value?.statuses ?? []) {
        statuses.push({
          messageId: s.id,
          status: s.status as WebhookStatus['status'],
          timestamp: s.timestamp,
        });
      }
    }
  }
  return statuses;
}
