# InvestNow™ Circle

แบบสำรวจเป้าหมายและสไตล์การลงทุน — React + Vite + Tailwind, deploy เป็น static site บน Netlify

เว็บจริง: https://investnow-circle.netlify.app

## คำตอบเก็บที่ไหน

คำตอบทุกชุดเข้า **Netlify Forms** ในฟอร์มชื่อ `survey` ผู้ตอบไม่ต้องล็อกอิน
และไม่มี credential ของบริการภายนอกอยู่ในหน้าเว็บเลย ดูข้อมูล export CSV
และตั้งอีเมลแจ้งเตือนได้ที่ Netlify → **Forms**

ฟอร์ม static ที่ Netlify ใช้ detect อยู่ใน `index.html` (ซ่อนจากผู้ใช้) ชื่อฟิลด์ต้องตรงกับ
`FORM_FIELDS` ใน `src/services/netlifyForms.ts` เสมอ

## หน้าดูคำตอบ (ลับ)

`/results.html` เป็นหน้าสำหรับทีมงาน ไม่มีลิงก์จากหน้าแบบสำรวจและตั้ง `noindex` ไว้
เปิดด้วยรหัสผ่าน แล้วดูคำตอบทั้งหมดเป็นตาราง พร้อมปุ่มดาวน์โหลด CSV

https://investnow-circle.netlify.app/results.html

Netlify API token อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น หน้าเว็บส่งแค่รหัสผ่านไปให้
`netlify/functions/results.ts` ตรวจ แล้วฟังก์ชันเป็นคนไปอ่านคำตอบมาให้

ต้องตั้ง environment variable 2 ตัวบน Netlify

| Key | ค่า |
|---|---|
| `RESULTS_PASSPHRASE` | รหัสผ่านสำหรับเปิดหน้านี้ |
| `NETLIFY_API_TOKEN` | personal access token จาก Netlify (User settings → Applications) |

## ส่งต่อเข้า Google Sheet (ทางเลือก)

`netlify/functions/submission-created.ts` ทำงานอัตโนมัติทุกครั้งที่มีคนส่งฟอร์ม
แล้วเขียนแถวลง Google Sheet ให้ เบราว์เซอร์ไม่ได้คุยกับ Google เลย การยืนยันตัวตน
เป็นแบบ server to server ด้วย service account จึงไม่ติดนโยบายของ Google Workspace
ที่ห้าม publish Apps Script web app สู่สาธารณะ

ถ้าไม่ตั้ง environment variable ฟังก์ชันจะข้ามไปเฉยๆ คำตอบยังอยู่ครบใน Netlify Forms

วิธีเปิดใช้งาน

1. Google Cloud Console → สร้าง **service account** → **Keys → Add key → JSON**
2. เปิด **Google Sheets API** ในโปรเจกต์นั้น
3. แชร์ Google Sheet ปลายทางให้อีเมลของ service account เป็น **Editor**
4. Netlify → **Environment variables** ใส่ 3 ตัว

   | Key | ค่า |
   |---|---|
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` จากไฟล์ JSON |
   | `GOOGLE_PRIVATE_KEY` | `private_key` จากไฟล์ JSON ทั้งก้อน |
   | `GOOGLE_SHEET_ID` | รหัสใน URL ของ Sheet |

5. สั่ง redeploy

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # tsc --noEmit
npm run build    # -> dist/
```

## Deploy

`netlify.toml` กำหนด build command, publish directory, functions directory และ SPA redirect ไว้แล้ว
repo ต่อกับ Netlify อยู่ ทุก push ที่ `main` จะ deploy อัตโนมัติ
