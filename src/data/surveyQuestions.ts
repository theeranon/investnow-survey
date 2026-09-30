export interface LuxuryOption {
  id: string;
  title: string;
  subtitle?: string;
}

export const LUXURY_EXPECTATIONS: LuxuryOption[] = [
  {
    id: 'exp_capital_preservation',
    title: 'รักษาเงินต้น ปลอดภัย ไม่เสี่ยงขาดทุน',
    subtitle: 'เน้นความมั่นคง เงินต้นอยู่ครบ สบายใจ ไม่กังวลเวลาตลาดลง',
  },
  {
    id: 'exp_passive_income',
    title: 'ได้เงินปันผลสม่ำเสมอ มีกระแสเงินสดใช้',
    subtitle: 'รับปันผลหรือดอกเบี้ยเรื่อยๆ นำไปใช้จ่ายได้โดยไม่ต้องขายสินทรัพย์',
  },
  {
    id: 'exp_long_term_growth',
    title: 'พอร์ตเติบโตระยะยาว ชนะเงินเฟ้อ',
    subtitle: 'เงินไม่ด้อยค่า สะสมกำไรทบต้น มูลค่าพอร์ตโตขึ้นทุกปี',
  },
  {
    id: 'exp_high_growth',
    title: 'ทำกำไรเติบโตก้าวกระโดด',
    subtitle: 'เน้นผลตอบแทนสูง จับจังหวะโอกาส รับความผันผวนได้',
  },
  {
    id: 'exp_lifestyle_freedom',
    title: 'มีอิสระในการใช้ชีวิต ไม่ต้องเฝ้าจอ',
    subtitle: 'พอร์ตสร้างผลตอบแทนเองอัตโนมัติ มีเวลาไปทำสิ่งที่ชอบ',
  },
  {
    id: 'exp_wealth_transfer',
    title: 'วางแผนส่งต่อให้ครอบครัว / มรดก',
    subtitle: 'บริหารจัดการความมั่งคั่งเพื่อส่งมอบให้ลูกหลานในระยะยาว',
  },
];

export const LUXURY_ASSETS: LuxuryOption[] = [
  {
    id: 'asset_thai_stocks',
    title: 'หุ้นไทย (SET / mai)',
  },
  {
    id: 'asset_us_stocks',
    title: 'หุ้นสหรัฐฯ (US Stocks / Tech)',
  },
  {
    id: 'asset_china_hk',
    title: 'หุ้นจีนและฮ่องกง (China / HK)',
  },
  {
    id: 'asset_gold',
    title: 'ทองคำ (Gold)',
  },
  {
    id: 'asset_us_treasury',
    title: 'พันธบัตร / ตราสารหนี้ (Bonds)',
  },
  {
    id: 'asset_index_funds',
    title: 'กองทุนดัชนี / กองทุนรวม (ETF & Mutual Funds)',
  },
  {
    id: 'asset_btc_crypto',
    title: 'บิตคอยน์ / คริปโท (Bitcoin & Crypto)',
  },
  {
    id: 'asset_fixed_deposit',
    title: 'เงินฝากประจำ / สภาพคล่องสูง',
  },
  {
    id: 'asset_insurance',
    title: 'ประกันสะสมทรัพย์ / Unit Linked',
  },
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
    subtitle: 'ชอบน้ำเปล่า, กาแฟ, ชา, น้ำผลไม้ หรือม็อกเทล',
  },
  {
    id: 'drink_beer',
    title: 'เบียร์',
    subtitle: 'เบียร์ทั่วไป, เบียร์สิงห์, คราฟต์เบียร์',
  },
  {
    id: 'drink_wine',
    title: 'ไวน์ / แชมเปญ',
    subtitle: 'ไวน์แดง, ไวน์ขาว หรือสปาร์คกลิ้ง',
  },
  {
    id: 'drink_whisky',
    title: 'วิสกี้ / บรั่นดี',
    subtitle: 'วิสกี้ผสมโซดา, บรั่นดีไทย (รีเจนซี่), ซิงเกิลมอลต์',
  },
  {
    id: 'drink_cocktail',
    title: 'ค็อกเทล / ดริ้งค์เบาๆ',
    subtitle: 'จินโทนิค, โมฮิโต้, เมนูค็อกเทลสดชื่น',
  },
  {
    id: 'drink_anything',
    title: 'ดื่มได้ทุกอย่าง สบายๆ เข้าสังคมได้หมด',
  },
];
