import React from 'react';
import { Plus, Trash2, Zap, Calculator } from 'lucide-react';
import { ExtraIncomeItem, UserSettings } from '../types';
import { formatMoney } from '../utils/calculator';

interface ExtraIncomeFormProps {
  extras: ExtraIncomeItem[];
  settings: UserSettings;
  onAddExtra: () => void;
  onQuickAdd: () => void;
  onUpdateExtra: (id: string, updates: Partial<ExtraIncomeItem>) => void;
  onRemoveExtra: (id: string) => void;
  onCalculate: () => void;
  isDark: boolean;
}

export const ExtraIncomeForm: React.FC<ExtraIncomeFormProps> = ({
  extras,
  settings,
  onAddExtra,
  onQuickAdd,
  onUpdateExtra,
  onRemoveExtra,
  onCalculate,
  isDark,
}) => {
  return (
    <div
      className={`p-5 rounded-2xl border transition-colors shadow-sm ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold">
            4
          </span>
          <h2 className="text-base font-bold">รายได้เพิ่มเติมประจำงวด</h2>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
          ใส่เฉพาะงวดที่ได้
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        เช่น Incentive Audit, เบี้ยขยัน, ค่ากะ, ค่าเดินทาง — หากงวดไหนไม่มีก็ปล่อยว่างไว้ได้
      </p>

      {/* Extra rows */}
      <div className="space-y-2 mb-3">
        {extras.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center border border-dashed rounded-xl border-slate-700/50">
            ยังไม่มีรายการรายได้เพิ่มเติมในงวดนี้
          </div>
        ) : (
          extras.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ชื่อรายการ เช่น Incentive Audit"
                value={item.name}
                onChange={(e) => onUpdateExtra(item.id, { name: e.target.value })}
                className={`flex-1 px-3 py-2 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
              />
              <div className="relative w-32">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={item.amt || ''}
                  onChange={(e) =>
                    onUpdateExtra(item.id, { amt: parseFloat(e.target.value) || 0 })
                  }
                  className={`w-full px-3 py-2 pr-7 text-right rounded-xl border text-xs font-mono outline-none transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                  }`}
                />
                <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-400">฿</span>
              </div>
              <button
                onClick={() => onRemoveExtra(item.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="ลบรายการนี้"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={onAddExtra}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
            isDark
              ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
              : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Plus size={14} />
          <span>เพิ่มรายการ</span>
        </button>

        {settings.qAmt > 0 && (
          <button
            onClick={onQuickAdd}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 text-amber-400 border-amber-500/30 ${
              isDark ? 'bg-amber-500/10 hover:bg-amber-500/20' : 'bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Zap size={14} className="text-amber-500" />
            <span>
              {settings.qName || 'รายการลัด'} +{formatMoney(settings.qAmt)} ฿
            </span>
          </button>
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={onCalculate}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        <Calculator size={18} />
        <span>คำนวณเงินงวดนี้ &amp; อัปเดตกราฟ Real-time</span>
      </button>
    </div>
  );
};
