// api/webhook.js

const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN;

export default async function handler(req, res) {

  // ── GET: Meta verification handshake ──────────────────────────
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp] Webhook verified');
      return res.status(200).send(challenge); // Must echo challenge exactly
    }

    console.warn('[WhatsApp] Verification failed — token mismatch');
    return res.status(403).json({ error: 'Forbidden' });
  }

  // ── POST: Incoming events from Meta ───────────────────────────
  if (req.method === 'POST') {
    const body = req.body;

    // Safety check — confirm it's a WhatsApp event
    if (body.object !== 'whatsapp_business_account') {
      return res.status(404).json({ error: 'Not a WhatsApp event' });
    }

    try {
      const entries = body.entry ?? [];

      for (const entry of entries) {
        const changes = entry.changes ?? [];

        for (const change of changes) {
          const value = change.value;

          // ── Incoming messages ──
          const messages = value?.messages ?? [];
          for (const msg of messages) {
            console.log('[WhatsApp] Incoming message:', JSON.stringify(msg));
            // TODO: handle customer replies here
          }

          // ── Status updates (sent, delivered, read, failed) ──
          const statuses = value?.statuses ?? [];
          for (const status of statuses) {
            console.log('[WhatsApp] Status update:', JSON.stringify(status));
            // TODO: update your DB based on delivery receipts
          }
        }
      }
    } catch (err) {
      console.error('[WhatsApp] Error processing event:', err);
      // Still return 200 — if you return 4xx/5xx Meta will keep retrying
    }

    // Always respond 200 quickly so Meta doesn't retry
    return res.status(200).json({ status: 'ok' });
  }

  // Any other method
  return res.status(405).json({ error: 'Method not allowed' });
}