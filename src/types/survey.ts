export interface SurveyResponse {
  id: string;
  timestamp: string;
  // Respondent identity
  name: string;
  contact: string;
  // Question 1: Expectations (multi-select)
  expectations: string[];
  // Question 2: Ranked Expectations (sorted subset of Q1)
  expectationsRanking: string[];
  // Question 3: Target Assets (multi-select + custom)
  assets: string[];
  customAsset?: string;
  // Question 4: Reason for asset selection (free text)
  assetReason: string;
  // Question 5: Investment apps used (multi-select + custom)
  apps: string[];
  customApp?: string;
  // Question 6: Message / Support requested (free text)
  supportMessage: string;
  // Question 7: Alcohol preference (multi-select + custom)
  drinks: string[];
  customDrink?: string;
}

/** Column order shared by the Sheet writer, the Apps Script webhook and the CSV export. */
export const SURVEY_COLUMNS = [
  'ประทับเวลา',
  'ชื่อ–นามสกุล / ชื่อเล่น',
  'เบอร์โทรศัพท์ / LINE ID',
  '1. คาดหวังอะไรบ้าง',
  '2. เรียงลำดับความคาดหวัง',
  '3. สินทรัพย์ที่สนใจหรืออยากให้มีในพอร์ต',
  '4. ทำไมถึงสนใจกลุ่มสินทรัพย์เหล่านี้',
  '5. ปัจจุบันใช้ App อะไรลงทุน',
  '6. มีอะไรอยากจะบอกไหม อยากให้เราซัพพอร์ตเรื่องอะไร',
  '7. Survey แอลกอฮอล์',
] as const;

const withCustom = (values: string[], custom?: string): string =>
  [...values, ...(custom?.trim() ? [`อื่นๆ: ${custom.trim()}`] : [])].join(', ');

/** Flattens a response into the row order declared by SURVEY_COLUMNS. */
export function toSurveyRow(response: SurveyResponse): string[] {
  const ranked =
    response.expectationsRanking && response.expectationsRanking.length > 0
      ? response.expectationsRanking.map((item, idx) => `${idx + 1}. ${item}`).join(' > ')
      : response.expectations.join(', ');

  return [
    new Date(response.timestamp).toLocaleString('th-TH'),
    response.name || '',
    response.contact || '',
    response.expectations.join(', '),
    ranked,
    withCustom(response.assets, response.customAsset),
    response.assetReason || '',
    withCustom(response.apps, response.customApp),
    response.supportMessage || '',
    withCustom(response.drinks, response.customDrink),
  ];
}
