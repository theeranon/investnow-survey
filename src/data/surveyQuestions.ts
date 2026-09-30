export interface LuxuryOption {
  id: string;
  title: string;
  subtitle?: string;
  /** Selecting this clears every other choice in the group (e.g. "ไม่ดื่ม"). */
  exclusive?: boolean;
}

export const LUXURY_EXPECTATIONS: LuxuryOption[] = [
  {
    id: 'exp_short_term_profit',
    title: 'ทำกำไรระยะสั้น รวดเร็ว รับความเสี่ยงสูงได้',
    subtitle: 'เน้นจับจังหวะ ทำรอบ รับความผันผวนเพื่อผลตอบแทนที่สูงกว่า',
  },
  {
    id: 'exp_steady_growth',
    title: 'ลงทุนต่อเนื่องระยะยาว ผลตอบแทนมั่นคง',
    subtitle: 'ทยอยลงทุนไปเรื่อยๆ ให้พอร์ตโตอย่างสม่ำเสมอ',
  },
  {
    id: 'exp_income_no_risk',
    title: 'กินดอกเบี้ย/ปันผลไปเรื่อยๆ ไม่เสี่ยงเลย',
    subtitle: 'ขอกระแสเงินสดสม่ำเสมอ โดยไม่ต้องรับความเสี่ยงขาดทุน',
  },
  {
    id: 'exp_personal_portfolio',
    title: 'ค้นหาสูตรทำกำไร และจัดพอร์ตที่เหมาะกับตัวเอง',
    subtitle: 'Personal Portfolio Balance — รู้ว่าอะไรใช่สำหรับเรา ไม่ใช่ลอกคนอื่น',
  },
  {
    id: 'exp_community',
    title: 'มี Community ที่ปรึกษา และคนช่วยคิด',
    subtitle: 'มีเพื่อนร่วมทาง มีคนแลกเปลี่ยนมุมมอง ไม่ต้องตัดสินใจคนเดียว',
  },
  {
    id: 'exp_fun_together',
    title: 'ได้เจอกัน เล่นน้ำ ลงทะเล สนุกด้วยกัน',
    subtitle: 'กิจกรรมและทริปของกลุ่ม ไม่ใช่แค่เรื่องลงทุนอย่างเดียว',
  },
];

export const LUXURY_ASSETS: LuxuryOption[] = [
  { id: 'asset_us_stocks', title: 'หุ้นสหรัฐฯ (US Stocks)' },
  { id: 'asset_us_treasury', title: 'พันธบัตรรัฐบาลสหรัฐฯ (US Treasury)' },
  { id: 'asset_index_funds', title: 'Index Funds (SET50 / NASDAQ)' },
  { id: 'asset_etf_qqq', title: 'ETF (QQQ)' },
  { id: 'asset_btc', title: 'Bitcoin (BTC)' },
  { id: 'asset_crypto', title: 'Crypto (เหรียญอื่นนอกจาก BTC)' },
  { id: 'asset_gold', title: 'ทองคำ (Gold)' },
  { id: 'asset_precious_metal', title: 'โลหะมีค่าอื่นๆ (เงิน, แพลทินัม ฯลฯ)' },
  { id: 'asset_thai_stocks', title: 'หุ้นไทย (SET / mai)' },
  { id: 'asset_thai_funds', title: 'กองทุนรวมไทย' },
  { id: 'asset_fixed_deposit', title: 'เงินฝากประจำ' },
  { id: 'asset_insurance', title: 'ประกันออมทรัพย์ / Unit Linked' },
];

export const LUXURY_APPS = [
  'Webull',
  'Dime!',
  'InnovestX',
  'Binance',
];

export const LUXURY_DRINKS: LuxuryOption[] = [
  {
    id: 'drink_none',
    title: 'ไม่ดื่มแอลกอฮอล์',
    exclusive: true,
  },
  { id: 'drink_beer', title: 'เบียร์' },
  { id: 'drink_wine', title: 'ไวน์' },
  { id: 'drink_regency', title: 'Regency' },
  { id: 'drink_whisky', title: 'Whisky / Cognac' },
];
