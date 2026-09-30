/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Apps Script Web App URL that appends survey rows for every visitor. */
  readonly VITE_SHEET_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
