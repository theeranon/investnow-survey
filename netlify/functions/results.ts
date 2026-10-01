import { getStore } from '@netlify/blobs';

/**
 * Backs the hidden results page at /results.html.
 *
 * Reads the copies written by submission-created, which needs no credentials.
 * When NETLIFY_API_TOKEN is set it reads the Forms API instead, which also
 * covers submissions made before this function existed.
 */

const STORE_NAME = 'survey-responses';
const DEFAULT_FORM_ID = '6abcdbfebb5aab0008f7aa04';

type Row = Record<string, string>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

async function readFromApi(token: string): Promise<Row[]> {
  const formId = process.env.SURVEY_FORM_ID || DEFAULT_FORM_ID;
  const res = await fetch(
    `https://api.netlify.com/api/v1/forms/${formId}/submissions?per_page=1000`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Forms API ${res.status}`);

  const submissions = await res.json();
  return (Array.isArray(submissions) ? submissions : []).map(
    (s: { created_at: string; data?: Row }) => ({ created_at: s.created_at, ...(s.data || {}) })
  );
}

async function readFromStore(): Promise<Row[]> {
  const store = getStore(STORE_NAME);
  const { blobs } = await store.list();
  const rows = await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })));
  return rows.filter(Boolean) as Row[];
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const expected = process.env.RESULTS_PASSPHRASE;
  if (!expected) return json({ error: 'ยังไม่ได้ตั้งรหัสผ่านสำหรับหน้านี้' }, 503);

  let passphrase = '';
  try {
    passphrase = String((await req.json())?.passphrase ?? '');
  } catch {
    return json({ error: 'bad request' }, 400);
  }
  if (passphrase !== expected) return json({ error: 'รหัสผ่านไม่ถูกต้อง' }, 401);

  const token = process.env.NETLIFY_API_TOKEN;

  try {
    const rows = token ? await readFromApi(token) : await readFromStore();
    rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return json({ rows, source: token ? 'api' : 'store' });
  } catch (err) {
    console.error('Failed to read responses:', err);
    return json({ error: 'อ่านข้อมูลไม่สำเร็จ' }, 502);
  }
};
