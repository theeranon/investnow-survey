import { SurveyResponse, toSurveyRow } from '../types/survey';

/**
 * Netlify Forms write path.
 *
 * Netlify detects the hidden static form in index.html at deploy time and
 * accepts url-encoded POSTs to any path on the site, so submissions are stored
 * server-side with no respondent sign-in and no third-party credentials.
 */

export const FORM_NAME = 'survey';

/** Field names, in the same order as SURVEY_COLUMNS. Kept in sync with index.html. */
export const FORM_FIELDS = [
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
] as const;

export async function submitToNetlifyForms(response: SurveyResponse): Promise<void> {
  const row = toSurveyRow(response);

  const body = new URLSearchParams();
  body.append('form-name', FORM_NAME);
  FORM_FIELDS.forEach((field, index) => {
    body.append(field, row[index] ?? '');
  });

  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Netlify Forms ตอบกลับสถานะ ${res.status}`);
  }
}
