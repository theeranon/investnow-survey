import { SurveyResponse, SURVEY_COLUMNS, toSurveyRow } from '../types/survey';

const SHEET_NAME = 'การตอบแบบฟอร์ม 1';

/** 'A'..'Z' for the declared column count, so adding a column cannot desync the range. */
const LAST_COLUMN = String.fromCharCode('A'.charCodeAt(0) + SURVEY_COLUMNS.length - 1);

export async function createSurveySpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<{ id: string; url: string }> {
  const title = customTitle || 'แบบสอบถามการลงทุน (การตอบกลับ)';

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: SURVEY_COLUMNS.map((header) => ({
                    userEnteredValue: { stringValue: header },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                    },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create spreadsheet (${res.status})`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { id: spreadsheetId, url: spreadsheetUrl };
}

async function appendValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  rowValues: string[]
): Promise<Response> {
  return fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [rowValues],
      }),
    }
  );
}

export async function appendSurveyRow(
  accessToken: string,
  spreadsheetId: string,
  response: SurveyResponse
): Promise<boolean> {
  const rowValues = toSurveyRow(response);
  const namedRange = `'${SHEET_NAME}'!A:${LAST_COLUMN}`;

  const res = await appendValues(accessToken, spreadsheetId, namedRange, rowValues);
  if (res.ok) return true;

  const primaryError = await res.json().catch(() => ({}));
  const primaryMessage = primaryError.error?.message || `Failed to append row (${res.status})`;

  // A 400 here means the tab name does not exist in this spreadsheet (e.g. the admin
  // linked a sheet they created by hand), so retry against the first tab. Any other
  // status is an auth or permission problem that a retry cannot fix.
  if (res.status !== 400) {
    throw new Error(primaryMessage);
  }

  const fallbackRes = await appendValues(accessToken, spreadsheetId, `A:${LAST_COLUMN}`, rowValues);
  if (!fallbackRes.ok) {
    const fallbackError = await fallbackRes.json().catch(() => ({}));
    throw new Error(fallbackError.error?.message || primaryMessage);
  }

  return true;
}

export async function checkSpreadsheetAccess(
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; url: string }> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('ไม่สามารถเข้าถึง Google Sheet นี้ได้ ตรวจสอบสิทธิ์การเข้าถึงหรือ Spreadsheet ID');
  }

  const data = await res.json();
  return {
    title: data.properties?.title || 'แบบสอบถามการลงทุน (การตอบกลับ)',
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}
