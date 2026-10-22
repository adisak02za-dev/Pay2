import React from 'react';
import { DayItem, DayTypeKey, UserSettings } from '../types';
import { DAY_TYPES, formatMoney, TH_DAYS } from '../utils/calculator';
import { AlertCircle, CalendarCheck, Info } from 'lucide-react';

interface DayTableProps {
  days: DayItem[];
  settings: UserSettings;
  onUpdateDay: (index: number, updates: Partial<DayItem>) => void;
  onQuickPreset: (preset: 'all_work' | 'tue_holiday' | 'sun_holiday' | 'sat_sun_holiday') => void;
  isDark: boolean;
}

export const DayTable: React.FC<DayTableProps> = ({
  days,
  settings,
  onUpdateDay,
  onQuickPreset,
  isDark,
}) => {
  if (!days || days.length === 0) return null;

  return (
    <div
      className={`p-5 rounded-2xl border transition-colors shadow-sm ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold">
            3
          </span>
          <h2 className="text-base font-bold">บันทึกข้อมูลการทำงานรายวัน</h2>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1 hidden lg:inline">ตั้งค่าด่วน:</span>
          <button
            onClick={() => onQuickPreset('all_work')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
          >
            ทั้งหมด = ทำงาน
          </button>
          <button
            onClick={() => onQuickPreset('tue_holiday')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
          >
            อังคาร = หยุด
          </button>
          <button
            onClick={() => onQuickPreset('sun_holiday')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
          >
            อาทิตย์ = หยุด
          </button>
          <button
            onClick={() => onQuickPreset('sat_sun_holiday')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
          >
            เสาร์-อาทิตย์ = หยุด
          </button>
        </div>
      </div>

      <div
        className={`p-3 rounded-xl border mb-4 text-xs flex items-start gap-2.5 ${
          isDark
            ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
      >
        <Info size={16} className="shrink-0 mt-0.5 text-amber-500" />
        <div className="leading-relaxed">
          <strong>เงื่อนไขการคำนวณ:</strong> วันหยุดประจำสัปดาห์ ={' '}
          <strong className="underline">ไม่ได้ค่าแรง (0 หน่วยวัน / 0.00 บาท)</strong> · วันนักขัตฤกษ์ ={' '}
          <strong className="underline text-emerald-400">ได้ค่าแรงแต่ไม่นำมาคิดประกันสังคม</strong>{' '}
          {settings.holMult > 1 && `(หากมาทำงานวันนักขัตฤกษ์รับ ${settings.holMult} เท่า = ${formatMoney(settings.rate * settings.holMult)} ฿)`}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}>
              <th className="py-2.5 px-3 font-semibold w-24">วันที่</th>
              <th className="py-2.5 px-3 font-semibold w-64">ประเภทของวัน</th>
              <th className="py-2.5 px-3 font-semibold w-36 text-center">ชม. ที่ไม่ได้ค่าจ้าง</th>
              <th className="py-2.5 px-3 font-semibold">ผลการคำนวณวันนั้น</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
            {days.map((day, idx) => {
              const typeCfg = DAY_TYPES[day.type];
              const isWeekend = day.dow === 0 || day.dow === 6;
              const isPub = day.type === 'pubwork' || day.type === 'puboff';
              const isHoliday = day.type === 'holiday';

              return (
                <tr
                  key={day.d}
                  className={`transition-colors ${
                    isPub
                      ? isDark
                        ? 'bg-amber-950/20'
                        : 'bg-amber-50/70'
                      : isHoliday
                      ? isDark
                        ? 'bg-slate-900/40'
                        : 'bg-slate-50'
                      : isDark
                      ? 'hover:bg-slate-700/30'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2 px-3 font-medium whitespace-nowrap">
                    <span className="text-sm font-bold">{day.d}</span>{' '}
                    <span
                      className={`text-[11px] font-normal ${
                        isWeekend ? 'text-rose-400 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {TH_DAYS[day.dow]}
                    </span>
                  </td>

                  <td className="py-2 px-3">
                    <select
                      value={day.type}
                      onChange={(e) =>
                        onUpdateDay(idx, { type: e.target.value as DayTypeKey })
                      }
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none transition-all ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                          : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                      }`}
                    >
                      {Object.entries(DAY_TYPES).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-2 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      disabled={!typeCfg?.pay}
                      value={day.unpaidHours || ''}
                      onChange={(e) =>
                        onUpdateDay(idx, { unpaidHours: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      placeholder="0"
                      className={`w-20 px-2 py-1 text-center rounded-lg border text-xs font-mono outline-none ${
                        !typeCfg?.pay
                          ? 'opacity-40 cursor-not-allowed bg-slate-950/20'
                          : isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                          : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                      }`}
                    />
                  </td>

                  <td className="py-2 px-3">
                    {renderDayStatusBadge(day, settings, isDark)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-2.5">
        {days.map((day, idx) => {
          const typeCfg = DAY_TYPES[day.type];
          const isWeekend = day.dow === 0 || day.dow === 6;

          return (
            <div
              key={day.d}
              className={`p-3 rounded-xl border transition-all ${
                day.type === 'pubwork'
                  ? isDark
                    ? 'bg-amber-950/30 border-amber-800/50'
                    : 'bg-amber-50 border-amber-200'
                  : day.type === 'holiday'
                  ? isDark
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-slate-100/70 border-slate-200'
                  : isDark
                  ? 'bg-slate-900/80 border-slate-700/80'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-blue-400">วันที่ {day.d}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      isWeekend ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-700/30 text-slate-400'
                    }`}
                  >
                    {TH_DAYS[day.dow]}
                  </span>
                </div>
                <div>{renderDayStatusBadge(day, settings, isDark, true)}</div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">ประเภท</label>
                  <select
                    value={day.type}
                    onChange={(e) =>
                      onUpdateDay(idx, { type: e.target.value as DayTypeKey })
                    }
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  >
                    {Object.entries(DAY_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                {typeCfg?.pay ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">ชม. ไม่ได้ค่าจ้าง:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={day.unpaidHours || ''}
                        onChange={(e) =>
                          onUpdateDay(idx, {
                            unpaidHours: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        placeholder="0 ชม."
                        className={`w-20 px-2 py-1 text-center rounded-lg border text-xs font-mono outline-none ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-100'
                            : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                      <span className="text-[11px] text-slate-400">ชม.</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function renderDayStatusBadge(
  day: DayItem,
  settings: UserSettings,
  isDark: boolean,
  compact = false
) {
  const t = day.type;

  if (t === 'holiday') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
        🏖️ {compact ? 'หยุดสัปดาห์ (0 หน่วยวัน)' : 'วันหยุดประจำสัปดาห์ (ไม่ได้ค่าแรง 0 หน่วยวัน)'}
      </span>
    );
  }

  if (t === 'pubwork') {
    const earned = settings.rate * settings.holMult;
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
        🎌 {compact ? `${settings.holMult}x (ไม่คิด ปกส.)` : `นักขัตฤกษ์ ได้ ${settings.holMult} เท่า (${formatMoney(earned)} ฿ - ไม่คิด ปกส.)`}
      </span>
    );
  }

  if (t === 'puboff') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
        🎏 {compact ? 'หยุดขัตฤกษ์ (ไม่คิด ปกส.)' : `นักขัตฤกษ์ ได้ 1 เท่า (${formatMoney(settings.rate)} ฿ - ไม่คิด ปกส.)`}
      </span>
    );
  }

  if (t === 'work') {
    if (day.unpaidHours > 0) {
      const cut = (settings.rate / settings.hours) * day.unpaidHours;
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
          ⚠️ หัก {day.unpaidHours} ชม. (-{formatMoney(cut)} ฿)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        ✅ ได้ค่าจ้างเต็ม ({formatMoney(settings.rate)} ฿)
      </span>
    );
  }

  if (t === 'sick' || t === 'personal' || t === 'annual') {
    const labels = { sick: 'ลาป่วย', personal: 'ลากิจ', annual: 'พักร้อน' };
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
        🟢 {labels[t]} ได้รับค่าจ้าง ({formatMoney(settings.rate)} ฿)
      </span>
    );
  }

  if (t === 'absent') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
        ❌ ขาดงาน (ตัดค่าจ้าง 0.00 ฿)
      </span>
    );
  }

  if (t === 'unpaid') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30">
        ⛔ ลาไม่รับเงิน (0.00 ฿)
      </span>
    );
  }

  return <span className="text-slate-400 text-[11px]">—</span>;
}
