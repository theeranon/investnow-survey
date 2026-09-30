import { SurveyResponse } from '../types/survey';

const SHEET_HEADERS = [
  'ประทับเวลา',
  '1. คาดหวังอะไรบ้าง',
  '2. เรียงลำดับความคาดหวัง',
  '3. สินทรัพย์ที่สนใจหรืออยากให้มีในพอร์ต',
  '4. ทำไมถึงสนใจกลุ่มสินทรัพย์เหล่านี้',
  '5. ปัจจุบันใช้ App อะไรลงทุน',
  '6. มีอะไรอยากจะบอกไหม อยากให้เราซัพพอร์ตเรื่องอะไร',
  '7. Survey แอลกอฮอล์',
];

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
            title: 'การตอบแบบฟอร์ม 1',
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
                  values: SHEET_HEADERS.map((header) => ({
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

export async function appendSurveyRow(
  accessToken: string,
  spreadsheetId: string,
  response: SurveyResponse
): Promise<boolean> {
  const range = "'การตอบแบบฟอร์ม 1'!A:H";

  const rankedStr =
    response.expectationsRanking && response.expectationsRanking.length > 0
      ? response.expectationsRanking.map((item, idx) => `${idx + 1}. ${item}`).join(' > ')
      : response.expectations.join(', ');

  const assetsCombined = [
    ...response.assets,
    ...(response.customAsset ? [`อื่นๆ: ${response.customAsset}`] : []),
  ].join(', ');

  const appsCombined = [
    ...response.apps,
    ...(response.customApp ? [`อื่นๆ: ${response.customApp}`] : []),
  ].join(', ');

  const drinksCombined = [
    ...response.drinks,
    ...(response.customDrink ? [`อื่นๆ: ${response.customDrink}`] : []),
  ].join(', ');

  const rowValues = [
    new Date(response.timestamp).toLocaleString('th-TH'),
    response.expectations.join(', '),
    rankedStr,
    assetsCombined,
    response.assetReason || '',
    appsCombined,
    response.supportMessage || '',
    drinksCombined,
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED`,
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

  if (!res.ok) {
    // If sheet name doesn't match, try sheet 1 without specific title
    const fallbackRange = 'A:H';
    const fallbackRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        fallbackRange
      )}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: fallbackRange,
          majorDimension: 'ROWS',
          values: [rowValues],
        }),
      }
    );
    if (!fallbackRes.ok) {
      const errorData = await fallbackRes.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to append row (${fallbackRes.status})`);
    }
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
