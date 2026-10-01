import crypto from 'node:crypto';

/**
 * Mirrors every Netlify Forms submission into a Google Sheet.
 *
 * Netlify calls this automatically on the `submission-created` event, so the
 * browser never talks to Google. Authentication is a service-account JWT
 * exchanged for an access token (server to server), which is unaffected by the
 * Workspace policy that blocks publishing Apps Script web apps publicly.
 *
 * Required env vars (Netlify > Environment variables):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID
 * The spreadsheet must be shared with GOOGLE_SERVICE_ACCOUNT_EMAIL as Editor.
 */

const SHEET_TAB = 'การตอบแบบฟอร์ม 1';

/** Column order of the sheet, matching the form field names below. */
const HEADERS = [
  'ประทับเวลา',
  'ชื่อ',
  'เบอร์โทรศัพท์ หรือ LINE ID',
  '1. คาดหวังอะไรบ้างจากการลงทุน',
  '2. เรื่องไหนสำคัญมากที่สุด',
  '3. สินทรัพย์ที่สนใจ',
  '4. ทำไมถึงสนใจสินทรัพย์เหล่านี้',
  '5. แอปที่ใช้ลงทุน',
  '6. อยากให้ซัพพอร์ตเรื่องอะไร',
  '7. เครื่องดื่ม',
];

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

const base64url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/** Signs a service-account JWT and trades it for an OAuth access token. */
async function getAccessToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const unsigned = `${base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64url(
    JSON.stringify(claim)
  )}`;

  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(privateKey);
  const assertion = `${unsigned}.${base64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Token request failed (${res.status}): ${body.error_description || body.error}`);
  }
  return body.access_token;
}

async function appendRow(token: string, sheetId: string, values: string[]): Promise<void> {
  const range = `'${SHEET_TAB}'!A:J`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [values] }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets append failed (${res.status}): ${body}`);
  }
}

/** Creates the tab with a frozen header row the first time a row is written. */
async function ensureSheetTab(token: string, sheetId: string): Promise<void> {
  const meta = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!meta.ok) return;

  const data = await meta.json();
  const titles: string[] = (data.sheets || []).map(
    (s: { properties?: { title?: string } }) => s.properties?.title
  );
  if (titles.includes(SHEET_TAB)) return;

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          addSheet: {
            properties: { title: SHEET_TAB, gridProperties: { frozenRowCount: 1 } },
          },
        },
      ],
    }),
  });
  await appendRow(token, sheetId, HEADERS);
}

export default async (req: Request): Promise<Response> => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Netlify stores the key with literal \n sequences, so restore real newlines.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    // The submission is already safe in Netlify Forms, so a missing Sheet
    // config is logged rather than failed; the mirror is an extra, not the store.
    console.log('Google Sheet sync skipped: credentials not configured');
    return new Response('skipped', { status: 200 });
  }

  try {
    const event = await req.json();
    const data = event?.payload?.data ?? {};
    const values = FIELDS.map((field) => String(data[field] ?? ''));

    const token = await getAccessToken(email, privateKey);
    await ensureSheetTab(token, sheetId);
    await appendRow(token, sheetId, values);

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Google Sheet sync failed:', err);
    return new Response('error', { status: 500 });
  }
};
