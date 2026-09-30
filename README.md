# InvestNow Survey

แบบสำรวจเป้าหมายและสไตล์การลงทุน — React + Vite + Tailwind, deploy เป็น static site บน Netlify

## การเชื่อมต่อ Google Sheet

แอปนี้เป็น static site ฉะนั้นการเขียนลง Google Sheet ต้องมีฝ่ายใดฝ่ายหนึ่งถือสิทธิ์ มี 2 เส้นทางในโค้ด:

### 1. Apps Script Web App (เส้นทางหลัก — ใช้กับผู้ตอบทุกคน)

ผู้ตอบไม่ต้องล็อกอิน Google เลย คำตอบถูกส่งไปที่ Web App ซึ่งรันด้วยสิทธิ์ของเจ้าของ Sheet

1. เปิด Google Sheet ที่จะเก็บคำตอบ → **Extensions → Apps Script**
2. ลบโค้ดเดิม แล้ววางโค้ดจาก [`apps-script/Code.gs`](apps-script/Code.gs)
3. **Deploy → New deployment → Web app**
4. ตั้ง **Execute as: Me** และ **Who has access: Anyone**
   (ถ้าเลือก *Anyone with Google account* จะใช้ไม่ได้ เพราะผู้ตอบไม่ได้ล็อกอิน)
5. Deploy → อนุญาตสิทธิ์ → copy **Web app URL** (`https://script.google.com/macros/s/.../exec`)
6. นำ URL ไปตั้งเป็น environment variable บน Netlify:
   `VITE_SHEET_WEBHOOK_URL` แล้ว redeploy

> ค่านี้ถูกฝังใน client bundle ตอน build จึงถือเป็นข้อมูลสาธารณะ — endpoint ทำได้แค่ append แถวเท่านั้น
>
> ระหว่างทดสอบ สามารถวาง URL ในหน้า **ตั้งค่า Google Sheets (ผู้ดูแล)** แล้วกด "ทดสอบการเชื่อมต่อ" ได้
> แต่ค่าที่ตั้งจากหน้านั้นเก็บใน localStorage จึงมีผลกับเบราว์เซอร์นั้นเครื่องเดียว

### 2. OAuth ของผู้ดูแล (สำรอง — เฉพาะแท็บของ admin)

หน้า Admin ยังสร้าง / เชื่อม Sheet ด้วยบัญชี Google ของผู้ดูแลได้ และใช้ปุ่ม
"ซิงค์ข้อมูลย้อนหลัง" ดันคำตอบที่ค้างใน localStorage ขึ้น Sheet ได้

ข้อจำกัดที่ต้องรู้: Google คืน access token เฉพาะตอนล็อกอินผ่าน popup และไม่ถูกเก็บลง disk
ฉะนั้น **รีเฟรชหน้า = ต้องกดเชื่อมต่อใหม่** เส้นทางนี้จึงใช้แทนข้อ 1 ไม่ได้

ถ้าใช้เส้นทางนี้ ต้องเพิ่มโดเมนของ Netlify ใน Firebase Console →
**Authentication → Settings → Authorized domains** ไม่งั้นจะเจอ `auth/unauthorized-domain`

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # tsc --noEmit
npm run build    # -> dist/
```

## Deploy (Netlify)

`netlify.toml` กำหนด build command, publish directory และ SPA redirect ไว้แล้ว

- **แนะนำ:** ต่อ repo นี้กับ Netlify site (Site configuration → Build & deploy → Link repository)
  แล้วทุก push ที่ `main` จะ deploy อัตโนมัติ
- **หรือ deploy ด้วย CLI:**
  ```bash
  npx netlify-cli login
  npx netlify-cli deploy --prod --dir=dist
  ```

อย่าลืมตั้ง `VITE_SHEET_WEBHOOK_URL` ก่อน build ไม่งั้น bundle จะไม่มี endpoint ปลายทาง
