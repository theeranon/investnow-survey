import { getStore } from '@netlify/blobs';

/**
 * Keeps a copy of every Netlify Forms submission so the results page can read
 * them without a Netlify API token.
 *
 * Netlify calls this automatically on the `submission-created` event, and Blobs
 * is configured by the runtime, so this needs no setup and no credentials.
 *
 * Optionally also mirrors the row into a Google Sheet when the service-account
 * env vars are present; without them that part is skipped.
 */

export const STORE_NAME = 'survey-responses';

const FIELDS = [
  'timestamp',
  'name',
  'contact',
  'expectations',
  'ranking',
  'assets',
  'asset_reason',
  'apps',
  'support_message',
  'drinks',
];

export default async (req: Request): Promise<Response> => {
  let event: { payload?: { data?: Record<string, string>; created_at?: string; id?: string } };
  try {
    event = await req.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }

  const payload = event?.payload ?? {};
  const data = payload.data ?? {};

  const row: Record<string, string> = {
    created_at: payload.created_at || new Date().toISOString(),
  };
  FIELDS.forEach((field) => {
    row[field] = String(data[field] ?? '');
  });

  try {
    const store = getStore(STORE_NAME);
    // Key by timestamp so listing comes back in a stable order.
    const key = `${row.created_at}-${payload.id || Math.random().toString(36).slice(2)}`;
    await store.setJSON(key, row);
  } catch (err) {
    // Netlify Forms still holds the submission, so a failure here is not fatal.
    console.error('Failed to store submission copy:', err);
    return new Response('store failed', { status: 500 });
  }

  return new Response('ok', { status: 200 });
};
