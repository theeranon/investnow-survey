import { FC, useState } from 'react';
import { User } from 'firebase/auth';
import { SurveyResponse } from '../types/survey';
import { createSurveySpreadsheet, checkSpreadsheetAccess, appendSurveyRow } from '../services/googleSheets';
import {
  ExternalLink,
  PlusCircle,
  Download,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminSettingsProps {
  onBack: () => void;
  user: User | null;
  accessToken: string | null;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  onSetSpreadsheet: (id: string, url: string) => void;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  isConnectingGoogle: boolean;
  responses: SurveyResponse[];
  onClearResponses: () => void;
}

export const AdminSettings: FC<AdminSettingsProps> = ({
  onBack,
  user,
  accessToken,
  spreadsheetId,
  spreadsheetUrl,
  onSetSpreadsheet,
  onConnectGoogle,
  onDisconnectGoogle,
  isConnectingGoogle,
  responses,
  onClearResponses,
}) => {
  const [sheetTitle, setSheetTitle] = useState('Investor Survey Responses (การตอบกลับ)');
  const [customIdInput, setCustomIdInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateSheet = async () => {
    if (!accessToken) return;
    setIsCreating(true);
    setMessage(null);
    try {
      const res = await createSurveySpreadsheet(accessToken, sheetTitle);
      onSetSpreadsheet(res.id, res.url);
      setMessage({ type: 'success', text: 'สร้าง Google Sheet สำเร็จแล้ว และพร้อมบันทึกคำตอบอัตโนมัติ' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'ไม่สามารถสร้าง Google Sheet ได้' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExisting = async () => {
    if (!accessToken || !customIdInput.trim()) return;
    setIsValidating(true);
    setMessage(null);

    let cleanId = customIdInput.trim();
    const urlMatch = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      cleanId = urlMatch[1];
    }

    try {
      const info = await checkSpreadsheetAccess(accessToken, cleanId);
      onSetSpreadsheet(cleanId, info.url);
      setMessage({ type: 'success', text: `เชื่อมต่อกับ "${info.title}" เรียบร้อยแล้ว` });
      setCustomIdInput('');
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'ไม่สามารถเข้าถึง Google Sheet นี้ได้' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSyncAll = async () => {
    if (!accessToken || !spreadsheetId || responses.length === 0) return;
    setIsSyncingAll(true);
    setMessage(null);
    try {
      let count = 0;
      for (const r of responses) {
        await appendSurveyRow(accessToken, spreadsheetId, r);
        count++;
      }
      setMessage({ type: 'success', text: `ซิงค์คำตอบ ${count} รายการลง Google Sheet สำเร็จแล้ว` });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล' });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const exportCSV = () => {
    if (responses.length === 0) return;
    const headers = [
      'Timestamp',
      '1. Expectations',
      '2. Ranked Expectations',
      '3. Assets',
      '4. Asset Reason',
      '5. Apps',
      '6. Support Message',
      '7. Drinks',
    ];
    const rows = responses.map((r) => [
      `"${new Date(r.timestamp).toLocaleString('th-TH')}"`,
      `"${r.expectations.join('; ')}"`,
      `"${(r.expectationsRanking || []).join(' > ')}"`,
      `"${[...r.assets, ...(r.customAsset ? [`อื่นๆ: ${r.customAsset}`] : [])].join('; ')}"`,
      `"${(r.assetReason || '').replace(/"/g, '""')}"`,
      `"${[...r.apps, ...(r.customApp ? [`อื่นๆ: ${r.customApp}`] : [])].join('; ')}"`,
      `"${(r.supportMessage || '').replace(/"/g, '""')}"`,
      `"${[...r.drinks, ...(r.customDrink ? [`อื่นๆ: ${r.customDrink}`] : [])].join('; ')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `survey_responses_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28 pt-4 px-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#d4af37] hover:text-[#f3e5ab] transition-colors py-1.5 px-3 rounded-lg hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังแบบสำรวจ</span>
        </button>

        <span className="text-xs bg-neutral-800 text-neutral-300 border border-neutral-700 px-3 py-1 rounded-md font-mono">
          Admin Settings
        </span>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
              : 'bg-rose-950/60 text-rose-300 border border-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Google Sheets Integration Card */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0b1424] p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                เชื่อมต่อ Google Sheets
              </h3>
              <p className="text-xs text-neutral-400">
                บันทึกคำตอบลง Google Sheet อัตโนมัติ
              </p>
            </div>
          </div>

          {user ? (
            <button
              onClick={onDisconnectGoogle}
              className="text-xs text-neutral-400 hover:text-rose-400 transition-colors"
            >
              ออกจากระบบ Google
            </button>
          ) : (
            <button
              onClick={onConnectGoogle}
              disabled={isConnectingGoogle}
              className="px-4 py-2 text-xs font-semibold bg-[#d4af37] text-neutral-950 rounded-lg hover:bg-[#e6c875] transition-all disabled:opacity-50"
            >
              {isConnectingGoogle ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
            </button>
          )}
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="text-xs text-neutral-300">
              บัญชี Google: <span className="font-semibold text-white">{user.email || user.displayName}</span>
            </div>

            {spreadsheetId ? (
              <div className="p-4 rounded-xl bg-[#070e1c] border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    เชื่อมต่อ Google Sheet แล้ว
                  </span>
                  {spreadsheetUrl && (
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#d4af37] hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>เปิดใน Google Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-xs font-mono text-neutral-400 break-all bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                  Sheet ID: {spreadsheetId}
                </div>

                {responses.length > 0 && (
                  <button
                    onClick={handleSyncAll}
                    disabled={isSyncingAll}
                    className="w-full mt-2 py-2 px-3 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSyncingAll ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-[#d4af37]" />
                    )}
                    <span>ซิงค์ข้อมูลย้อนหลัง ({responses.length} รายการ) ลงใน Sheet</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg text-xs bg-amber-950/40 text-amber-300 border border-amber-800/60">
                ยังไม่ได้กำหนด Google Sheet โปรดสร้างใหม่หรือวาง ID ด้านล่าง
              </div>
            )}

            {/* Create new sheet */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <label className="text-xs font-medium text-neutral-300 block">
                สร้าง Google Sheet แผ่นใหม่
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  placeholder="ชื่อแบบสอบถามใน Google Sheet"
                  className="flex-1 px-3 py-2 text-xs bg-[#070e1c] border border-neutral-700 focus:border-[#d4af37] rounded-lg text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateSheet}
                  disabled={isCreating}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>สร้าง Sheet</span>
                </button>
              </div>
            </div>

            {/* Connect existing sheet */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <label className="text-xs font-medium text-neutral-300 block">
                หรือเชื่อมต่อกับ Google Sheet เดิมที่มีอยู่
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customIdInput}
                  onChange={(e) => setCustomIdInput(e.target.value)}
                  placeholder="วาง Spreadsheet ID หรือ URL"
                  className="flex-1 px-3 py-2 text-xs bg-[#070e1c] border border-neutral-700 focus:border-[#d4af37] rounded-lg text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleConnectExisting}
                  disabled={isValidating || !customIdInput.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isValidating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'เชื่อมโยง'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-400">
            โปรดเข้าสู่ระบบด้วย Google เพื่อเปิดใช้งานการซิงค์ข้อมูลกับ Google Sheets
          </p>
        )}
      </div>

      {/* 2. Responses & Data Management */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0b1424] p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">
              ข้อมูลการตอบกลับ (Responses)
            </h3>
            <p className="text-xs text-neutral-400">
              จำนวนข้อมูลทั้งหมด: <span className="font-bold text-[#d4af37] font-mono tabular-nums">{responses.length}</span> รายการ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={responses.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>ส่งออก CSV</span>
            </button>

            {responses.length > 0 && (
              <button
                onClick={onClearResponses}
                className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg transition-colors"
                title="ล้างข้อมูลการตอบกลับทั้งหมด"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Responses Table Preview */}
        {responses.length > 0 ? (
          <div className="overflow-x-auto border border-neutral-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#070e1c] text-[#d4af37] border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">เวลา</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">เป้าหมายอันดับ 1</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">สินทรัพย์ที่เลือก</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">App</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">เครื่องดื่ม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-[#0b1424]">
                {responses.slice(0, 10).map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-neutral-400 font-mono whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleDateString('th-TH', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-white max-w-xs truncate font-medium">
                      {r.expectationsRanking[0] || r.expectations[0] || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300 max-w-xs truncate">
                      {r.assets.slice(0, 2).join(', ')}
                      {r.assets.length > 2 ? ` (+${r.assets.length - 2})` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300 whitespace-nowrap">
                      {r.apps.join(', ') || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300 whitespace-nowrap">
                      {r.drinks.join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 py-6 text-center font-light">
            ยังไม่มีข้อมูลคำตอบที่ส่งเข้ามา
          </p>
        )}
      </div>
    </div>
  );
};
