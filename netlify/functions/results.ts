/**
 * Backs the hidden results page at /results.html.
 *
 * The Netlify API token never reaches the browser: the page posts a passphrase,
 * this function checks it and fetches the submissions server-side.
 *
 * Env vars (Netlify > Environment variables):
 *   RESULTS_PASSPHRASE  passphrase for the page
 *   NETLIFY_API_TOKEN   personal access token, used to read submissions
 *   SURVEY_FORM_ID      optional, defaults to the existing "survey" form
 */

const DEFAULT_FORM_ID = '6abcdbfebb5aab0008f7aa04';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405);
  }

  const expected = process.env.RESULTS_PASSPHRASE;
  const token = process.env.NETLIFY_API_TOKEN;
  const formId = process.env.SURVEY_FORM_ID || DEFAULT_FORM_ID;

  if (!expected || !token) {
    return json({ error: 'ยังไม่ได้ตั้งค่าหน้านี้ ตั้ง RESULTS_PASSPHRASE และ NETLIFY_API_TOKEN ก่อน' }, 503);
  }

  let passphrase = '';
  try {
    passphrase = String((await req.json())?.passphrase ?? '');
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  if (passphrase !== expected) {
    return json({ error: 'รหัสผ่านไม่ถูกต้อง' }, 401);
  }

  const res = await fetch(
    `https://api.netlify.com/api/v1/forms/${formId}/submissions?per_page=1000`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    return json({ error: `อ่านข้อมูลไม่สำเร็จ (${res.status})` }, 502);
  }

  const submissions = await res.json();
  const rows = (Array.isArray(submissions) ? submissions : []).map(
    (s: { created_at: string; data?: Record<string, string> }) => ({
      created_at: s.created_at,
      ...(s.data || {}),
    })
  );

  return json({ rows });
};
