import { FC } from 'react';
import { Crown, CheckCircle2, RotateCcw, ExternalLink } from 'lucide-react';

interface SubmissionSuccessProps {
  onReset: () => void;
  spreadsheetUrl: string | null;
}

export const SubmissionSuccess: FC<SubmissionSuccessProps> = ({ onReset, spreadsheetUrl }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-6 sm:pt-12 pb-28 px-3">
      <div className="rounded-2xl border border-neutral-800 bg-[#0b1424] p-8 sm:p-12 text-center shadow-xl">
        {/* Crown Crest */}
        <div className="w-16 h-16 rounded-2xl bg-[#0e1b30] border border-[#d4af37]/60 text-[#d4af37] flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Crown className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            บันทึกคำตอบเรียบร้อยแล้ว
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-md mx-auto font-normal leading-relaxed">
            ขอบคุณสำหรับข้อมูลและการมีส่วนร่วม
          </p>

          {spreadsheetUrl && (
            <div className="pt-3">
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm sm:text-base text-emerald-400 bg-[#044337]/50 border border-emerald-600/50 px-4 py-2 rounded-xl hover:bg-[#044337] transition-all font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>เปิดดูใน Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-center">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#d4af37] hover:text-[#f3e5ab] py-2 px-4 rounded-xl hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ส่งคำตอบอีกครั้ง หรือแก้ไขข้อมูล</span>
          </button>
        </div>
      </div>
    </div>
  );
};
