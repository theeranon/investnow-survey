import { FC, useState, useEffect } from 'react';
import {
  LUXURY_EXPECTATIONS,
  LUXURY_ASSETS,
  LUXURY_APPS,
  LUXURY_DRINKS,
} from '../data/surveyQuestions';
import { SortableList } from './SortableList';
import { SurveyResponse } from '../types/survey';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';

interface SurveyFormProps {
  onSubmit: (response: SurveyResponse) => void;
  isSubmitting: boolean;
}

export const SurveyForm: FC<SurveyFormProps> = ({ onSubmit, isSubmitting }) => {
  // Form responses
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [selectedExpectations, setSelectedExpectations] = useState<string[]>([]);
  const [rankedExpectations, setRankedExpectations] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [customAsset, setCustomAsset] = useState('');
  const [assetReason, setAssetReason] = useState('');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [customApp, setCustomApp] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]);
  const [customDrink, setCustomDrink] = useState('');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic ranking sync with Question 1
  useEffect(() => {
    setRankedExpectations((prevRanked) => {
      const retained = prevRanked.filter((item) => selectedExpectations.includes(item));
      const newlyAdded = selectedExpectations.filter((item) => !retained.includes(item));
      return [...retained, ...newlyAdded];
    });
  }, [selectedExpectations]);

  const toggleExpectation = (title: string) => {
    setSelectedExpectations((prev) =>
      prev.includes(title) ? prev.filter((i) => i !== title) : [...prev, title]
    );
    if (errors.q1) setErrors((prev) => ({ ...prev, q1: '' }));
  };

  const toggleAsset = (title: string) => {
    setSelectedAssets((prev) =>
      prev.includes(title) ? prev.filter((i) => i !== title) : [...prev, title]
    );
    if (errors.q3) setErrors((prev) => ({ ...prev, q3: '' }));
  };

  const toggleApp = (appName: string) => {
    setSelectedApps((prev) =>
      prev.includes(appName) ? prev.filter((i) => i !== appName) : [...prev, appName]
    );
    if (errors.q5) setErrors((prev) => ({ ...prev, q5: '' }));
  };

  const exclusiveDrinks = LUXURY_DRINKS.filter((d) => d.exclusive).map((d) => d.title);

  const toggleDrink = (title: string) => {
    if (exclusiveDrinks.includes(title)) {
      setSelectedDrinks((prev) => (prev.includes(title) ? [] : [title]));
    } else {
      setSelectedDrinks((prev) => {
        const filtered = prev.filter((d) => !exclusiveDrinks.includes(d));
        return filtered.includes(title) ? filtered.filter((i) => i !== title) : [...filtered, title];
      });
    }
    if (errors.q7) setErrors((prev) => ({ ...prev, q7: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (selectedExpectations.length === 0) {
      newErrors.q1 = 'กรุณาเลือกความคาดหวังอย่างน้อย 1 ข้อ';
    }
    if (selectedExpectations.length > 0 && rankedExpectations.length === 0) {
      newErrors.q2 = 'กรุณาจัดอันดับความสำคัญ';
    }
    if (selectedAssets.length === 0 && !customAsset.trim()) {
      newErrors.q3 = 'กรุณาเลือกหรือระบุสินทรัพย์ที่สนใจ';
    }
    if (selectedApps.length === 0 && !customApp.trim()) {
      newErrors.q5 = 'กรุณาเลือกหรือระบุ App ที่ใช้งาน';
    }
    if (selectedDrinks.length === 0 && !customDrink.trim()) {
      newErrors.q7 = 'กรุณาเลือกเครื่องดื่มที่ชอบ';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    const failedKeys = Object.keys(newErrors);
    if (failedKeys.length > 0) {
      // Card ids are prefixed, and the freshly computed errors are used because
      // the `errors` state has not re-rendered yet at this point.
      const el = document.getElementById(`card-${failedKeys[0]}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const response: SurveyResponse = {
      id: `resp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      name: name.trim(),
      contact: contact.trim(),
      expectations: selectedExpectations,
      expectationsRanking: rankedExpectations,
      assets: selectedAssets,
      customAsset: customAsset.trim() || undefined,
      assetReason: assetReason.trim(),
      apps: selectedApps,
      customApp: customApp.trim() || undefined,
      supportMessage: supportMessage.trim(),
      drinks: selectedDrinks,
      customDrink: customDrink.trim() || undefined,
    };

    onSubmit(response);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 pb-28">
      {/* Header Card */}
      <div className="border border-neutral-800 bg-[#0b1424] rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          InvestNow&trade; Circle
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          แบบสำรวจเป้าหมายและสไตล์การลงทุน
        </p>

        {/* Clean, Tasteful Inputs (No loud containers) */}
        <div className="mt-6 pt-6 border-t border-neutral-800/80 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              ชื่อ นามสกุล หรือชื่อเล่น
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ระบุชื่อ นามสกุล หรือชื่อเล่น"
              className="w-full px-4 py-3 text-base bg-[#070e1c] border border-neutral-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 rounded-xl text-white placeholder:text-neutral-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              เบอร์โทรศัพท์ หรือ LINE ID
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="ระบุเบอร์โทรศัพท์ หรือ LINE ID"
              className="w-full px-4 py-3 text-base bg-[#070e1c] border border-neutral-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 rounded-xl text-white placeholder:text-neutral-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* QUESTION 1 */}
      <div
        id="card-q1"
        className={`border rounded-2xl bg-[#0b1424] p-5 sm:p-7 space-y-4 ${
          errors.q1 ? 'border-rose-500' : 'border-neutral-800'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              1. คาดหวังอะไรบ้างจากการลงทุน
            </h2>
            <span className="text-xs sm:text-sm text-neutral-400 block mt-0.5">
              (เลือกได้มากกว่า 1 ข้อ)
            </span>
          </div>

          <span className="text-xs sm:text-sm font-mono text-[#d4af37] tabular-nums font-medium shrink-0 bg-[#070e1c] px-2.5 py-1 rounded-lg border border-neutral-800">
            เลือก {selectedExpectations.length}
          </span>
        </div>

        {errors.q1 && (
          <div className="text-sm text-rose-300 bg-rose-950/60 border border-rose-800 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errors.q1}</span>
          </div>
        )}

        {/* Vertical Rows with Clean Checkbox on Left */}
        <div className="flex flex-col space-y-2">
          {LUXURY_EXPECTATIONS.map((exp) => {
            const isChecked = selectedExpectations.includes(exp.title);
            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => toggleExpectation(exp.title)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-colors flex items-start gap-3.5 cursor-pointer ${
                  isChecked
                    ? 'border-emerald-500/70 bg-[#0e2238]'
                    : 'border-neutral-800/80 bg-[#070e1c] hover:border-neutral-700 hover:bg-[#091527]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-neutral-600 bg-neutral-900'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-base sm:text-lg leading-snug font-medium ${
                      isChecked ? 'text-white' : 'text-neutral-200'
                    }`}
                  >
                    {exp.title}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed">
                    {exp.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* QUESTION 2 */}
      <div
        id="card-q2"
        className={`border rounded-2xl bg-[#0b1424] p-5 sm:p-7 space-y-4 ${
          errors.q2 ? 'border-rose-500' : 'border-neutral-800'
        }`}
      >
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            2. เรื่องไหนสำคัญกับคุณมากที่สุด
          </h2>
          <span className="text-xs sm:text-sm text-[#d4af37] block mt-0.5 font-medium">
            อันดับ 1 คือสิ่งที่สำคัญที่สุดสำหรับคุณ
          </span>
        </div>

        {errors.q2 && (
          <div className="text-sm text-rose-300 bg-rose-950/60 border border-rose-800 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errors.q2}</span>
          </div>
        )}

        <SortableList
          items={rankedExpectations}
          onChange={(newRanked) => setRankedExpectations(newRanked)}
        />
      </div>

      {/* QUESTION 3 */}
      <div
        id="card-q3"
        className={`border rounded-2xl bg-[#0b1424] p-5 sm:p-7 space-y-4 ${
          errors.q3 ? 'border-rose-500' : 'border-neutral-800'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              3. สินทรัพย์ไหนที่สนใจ หรืออยากให้มีในพอร์ต
            </h2>
            <span className="text-xs sm:text-sm text-neutral-400 block mt-0.5">
              (เลือกได้มากกว่า 1 ข้อ)
            </span>
          </div>

          <span className="text-xs sm:text-sm font-mono text-[#d4af37] tabular-nums font-medium shrink-0 bg-[#070e1c] px-2.5 py-1 rounded-lg border border-neutral-800">
            เลือก {selectedAssets.length}
          </span>
        </div>

        {errors.q3 && (
          <div className="text-sm text-rose-300 bg-rose-950/60 border border-rose-800 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errors.q3}</span>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          {LUXURY_ASSETS.map((asset) => {
            const isChecked = selectedAssets.includes(asset.title);
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => toggleAsset(asset.title)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-colors flex items-center gap-3.5 cursor-pointer ${
                  isChecked
                    ? 'border-emerald-500/70 bg-[#0e2238]'
                    : 'border-neutral-800/80 bg-[#070e1c] hover:border-neutral-700 hover:bg-[#091527]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-neutral-600 bg-neutral-900'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <span
                  className={`text-base sm:text-lg leading-snug font-medium ${
                    isChecked ? 'text-white' : 'text-neutral-200'
                  }`}
                >
                  {asset.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clean Input Field */}
        <div className="mt-4 pt-4 border-t border-neutral-800/80">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            สินทรัพย์อื่นๆ ที่สนใจ
          </label>
          <input
            type="text"
            value={customAsset}
            onChange={(e) => setCustomAsset(e.target.value)}
            placeholder="ระบุสินทรัพย์อื่นๆ"
            className="w-full px-4 py-3 text-base bg-[#070e1c] border border-neutral-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 rounded-xl text-white placeholder:text-neutral-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* QUESTION 4 */}
      <div className="border border-neutral-800 bg-[#0b1424] rounded-2xl p-5 sm:p-7 space-y-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            4. ทำไมถึงสนใจกลุ่มสินทรัพย์เหล่านี้
          </h2>
          <span className="text-xs sm:text-sm text-neutral-400 block mt-0.5">
            เล่าให้เราฟังสั้นๆ ได้เลย
          </span>
        </div>

        <textarea
          rows={3}
          value={assetReason}
          onChange={(e) => setAssetReason(e.target.value)}
          placeholder="เล่าเหตุผลหรือมุมมองของคุณสั้นๆ"
          className="w-full px-4 py-3 text-base bg-[#070e1c] border border-neutral-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 rounded-xl text-white placeholder:text-neutral-500 outline-none resize-y transition-all leading-relaxed"
        />
      </div>

      {/* QUESTION 5 */}
      <div
        id="card-q5"
        className={`border rounded-2xl bg-[#0b1424] p-5 sm:p-7 space-y-4 ${
          errors.q5 ? 'border-rose-500' : 'border-neutral-800'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              5. ปัจจุบันใช้แอปอะไรลงทุน
            </h2>
            <span className="text-xs sm:text-sm text-neutral-400 block mt-0.5">
              (เลือกได้มากกว่า 1 ข้อ)
            </span>
          </div>

          <span className="text-xs sm:text-sm font-mono text-[#d4af37] tabular-nums font-medium shrink-0 bg-[#070e1c] px-2.5 py-1 rounded-lg border border-neutral-800">
            เลือก {selectedApps.length}
          </span>
        </div>

        {errors.q5 && (
          <div className="text-sm text-rose-300 bg-rose-950/60 border border-rose-800 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errors.q5}</span>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          {LUXURY_APPS.map((app) => {
            const isChecked = selectedApps.includes(app);
            return (
              <button
                key={app}
                type="button"
                onClick={() => toggleApp(app)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-colors flex items-center gap-3.5 cursor-pointer ${
                  isChecked
                    ? 'border-emerald-500/70 bg-[#0e2238]'
                    : 'border-neutral-800/80 bg-[#070e1c] hover:border-neutral-700 hover:bg-[#091527]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-neutral-600 bg-neutral-900'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <span
                  className={`text-base sm:text-lg font-medium ${
                    isChecked ? 'text-white' : 'text-neutral-200'
                  }`}
                >
                  {app}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800/80">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            แอปหรือสถาบันการเงินอื่นๆ
          </label>
          <input
            type="text"
            value={customApp}
            onChange={(e) => setCustomApp(e.target.value)}
            placeholder="ระบุแอปหรือสถาบันการเงินอื่นๆ"
            className="w-full px-4 py-3 text-base bg-[#070e1c] border border-neutral-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 rounded-xl text-white placeholder:text-neutral-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* QUESTION 6 */}
      <div className="border border-neutral-800 bg-[#0b1424] rounded-2xl p-5 sm:p-7 space-y-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            6. มีอะไรอยากบอกเราไหม อยากให้ซัพพอร์ตเรื่องอะไร
          </h2>
        </div>

        <textarea
          rows={3}
          value={supportMessage}
          onChange={(e) => setSupportMessage(e.target.value)}
          placeholder="เขียนถึงเราได้เลย"
          className="w-full px-4 py-3 text-base bg-[#070e1c] border border-neutral-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 rounded-xl text-white placeholder:text-neutral-500 outline-none resize-y transition-all leading-relaxed"
        />
      </div>

      {/* QUESTION 7 */}
      <div
        id="card-q7"
        className={`border rounded-2xl bg-[#0b1424] p-5 sm:p-7 space-y-4 ${
          errors.q7 ? 'border-rose-500' : 'border-neutral-800'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              7. ปกติดื่มอะไรในงานมีตติ้งหรืองานสังสรรค์
            </h2>
            <span className="text-xs sm:text-sm text-neutral-400 block mt-0.5">
              (เลือกได้มากกว่า 1 ข้อ)
            </span>
          </div>

          <span className="text-xs sm:text-sm font-mono text-[#d4af37] tabular-nums font-medium shrink-0 bg-[#070e1c] px-2.5 py-1 rounded-lg border border-neutral-800">
            เลือก {selectedDrinks.length}
          </span>
        </div>

        {errors.q7 && (
          <div className="text-sm text-rose-300 bg-rose-950/60 border border-rose-800 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errors.q7}</span>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          {LUXURY_DRINKS.map((drink) => {
            const isChecked = selectedDrinks.includes(drink.title);
            return (
              <button
                key={drink.id}
                type="button"
                onClick={() => toggleDrink(drink.title)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-colors flex items-start gap-3.5 cursor-pointer ${
                  isChecked
                    ? 'border-emerald-500/70 bg-[#0e2238]'
                    : 'border-neutral-800/80 bg-[#070e1c] hover:border-neutral-700 hover:bg-[#091527]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-neutral-600 bg-neutral-900'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-base sm:text-lg leading-snug font-medium ${
                      isChecked ? 'text-white' : 'text-neutral-200'
                    }`}
                  >
                    {drink.title}
                  </div>
                  {drink.subtitle && (
                    <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                      {drink.subtitle}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800/80">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            เครื่องดื่มอื่นๆ ที่ชอบ
          </label>
          <input
            type="text"
            value={customDrink}
            onChange={(e) => setCustomDrink(e.target.value)}
            placeholder="ระบุเครื่องดื่มอื่นๆ"
            className="w-full px-4 py-3 text-base bg-[#070e1c] border border-neutral-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 rounded-xl text-white placeholder:text-neutral-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-8 py-3.5 rounded-xl font-bold text-base bg-[#d4af37] hover:bg-[#e6c875] text-neutral-950 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <span>กำลังส่งข้อมูล</span>
          ) : (
            <>
              <span>ส่งแบบสำรวจ</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
