import { SurveyResponse, SURVEY_COLUMNS, toSurveyRow } from '../types/survey';

/**
 * Anonymous write path to Google Sheets via an Apps Script Web App.
 *
 * The OAuth path in googleSheets.ts can only run for a signed-in admin, so it
 * cannot capture answers from public respondents. This webhook is deployed once
 * ("execute as me / anyone can access") and appends rows on the owner's behalf,
 * so every visitor's submission reaches the same sheet with no sign-in.
 *
 * Apps Script cannot answer CORS preflight requests, so the body is sent as
 * text/plain — that keeps the POST a "simple request" and avoids the preflight.
 */

const STORAGE_KEY_WEBHOOK = 'executive_survey_webhook_url_v3';

const envWebhookUrl = (import.meta.env.VITE_SHEET_WEBHOOK_URL || '').trim();

/** Admin override in localStorage wins, otherwise the build-time Netlify env var. */
export function getWebhookUrl(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_WEBHOOK);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // localStorage unavailable (private mode) — fall back to the env value.
  }
  return envWebhookUrl;
}

export function getEnvWebhookUrl(): string {
  return envWebhookUrl;
}

export function setWebhookUrl(url: string): void {
  const clean = url.trim();
  try {
    if (clean) {
      localStorage.setItem(STORAGE_KEY_WEBHOOK, clean);
    } else {
      localStorage.removeItem(STORAGE_KEY_WEBHOOK);
    }
  } catch (e) {
    console.error('Failed to persist webhook URL:', e);
  }
}

export function isValidWebhookUrl(url: string): boolean {
  const clean = url.trim();
  if (!clean) return false;
  try {
    const parsed = new URL(clean);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function postToWebhook(url: string, payload: unknown): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    // text/plain keeps this a simple request; Apps Script parses the JSON itself.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Webhook ตอบกลับสถานะ ${res.status}`);
  }

  const text = await res.text();
  let parsed: { ok?: boolean; error?: string } = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    // A non-JSON body usually means the URL points at a Google login page,
    // i.e. the Web App was not deployed with "anyone can access".
    throw new Error(
      'Webhook ไม่ได้ตอบกลับเป็น JSON — ตรวจสอบว่า Deploy Apps Script เป็น Web App แบบ "Anyone" แล้ว'
    );
  }

  if (parsed.ok === false) {
    throw new Error(parsed.error || 'Apps Script ปฏิเสธคำขอ');
  }
}

/** Appends one survey response. Throws on any failure so the caller can report it. */
export async function submitViaWebhook(response: SurveyResponse): Promise<void> {
  const url = getWebhookUrl();
  if (!url) throw new Error('ยังไม่ได้ตั้งค่า Webhook URL');

  await postToWebhook(url, {
    type: 'survey_response',
    headers: SURVEY_COLUMNS,
    row: toSurveyRow(response),
    response,
  });
}

/** Round-trips a ping so the admin can verify the endpoint before going live. */
export async function testWebhook(url: string): Promise<void> {
  await postToWebhook(url, { type: 'ping', headers: SURVEY_COLUMNS });
}
