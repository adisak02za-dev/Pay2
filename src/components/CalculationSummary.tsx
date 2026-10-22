import React from 'react';
import { Save, Printer, CheckCircle, AlertTriangle, Gift } from 'lucide-react';
import { PayRecord } from '../types';
import { formatMoney } from '../utils/calculator';

interface CalculationSummaryProps {
  record: PayRecord;
  onSaveRecord: () => void;
  isDark: boolean;
  isSaved?: boolean;
}

export const CalculationSummary: React.FC<CalculationSummaryProps> = ({
  record,
  onSaveRecord,
  isDark,
  isSaved = false,
}) => {
  const { period, settings, stats, wage, extras, extraSum, gross, sso, tax, oth, othName, ded, net, lostAbs, pubBonus } =
    record;

  return (
    <div
      id="calculation-summary-card"
      className={`p-5 rounded-2xl border transition-colors shadow-md ${
        isDark ? 'bg-slate-800/90 border-slate-700/80' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-700/50">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>💸</span> สรุปผลคำนวณ — งวด {period.label}
          </h2>
          <div className="text-xs text-slate-400 mt-0.5">
            วันจ่ายเงิน: <strong className="text-emerald-400">{period.payLabel}</strong> · อัตราค่าจ้าง{' '}
            <strong className="text-blue-400">{formatMoney(settings.rate)} ฿/วัน</strong> ({formatMoney(settings.rate / settings.hours)} ฿/ชม.)
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={onSaveRecord}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isSaved
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isSaved ? <CheckCircle size={15} /> : <Save size={15} />}
            <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกเก็บไว้'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Printer size={15} />
            <span className="hidden sm:inline">พิมพ์ / PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div
          className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-[11px] text-slate-400 mb-1">วันที่ได้ค่าจ้าง</div>
          <div className="text-xl font-bold font-mono text-blue-400">
            {stats.paidDays} <span className="text-xs font-normal text-slate-400">วัน</span>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-[11px] text-slate-400 mb-1">รวมรายได้ (Gross)</div>
          <div className="text-xl font-bold font-mono text-slate-200">{formatMoney(gross)}</div>
        </div>

        <div
          className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-[11px] text-slate-400 mb-1">รวมเงินหัก (Deduction)</div>
          <div className="text-xl font-bold font-mono text-rose-400">-{formatMoney(ded)}</div>
        </div>

        <div
          className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <div className="text-[11px] text-emerald-400 mb-1 font-medium">💰 เงินได้สุทธิ (Net)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{formatMoney(net)}</div>
        </div>
      </div>

      {/* Detailed rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Income Details */}
        <div className="rounded-xl border border-slate-700/60 overflow-hidden text-xs">
          <div
            className={`px-3 py-2 font-semibold flex items-center justify-between ${
              isDark ? 'bg-slate-900/80 text-emerald-400' : 'bg-slate-100 text-emerald-700'
            }`}
          >
            <span>🟢 รายได้ (Income)</span>
            <span>จำนวนเงิน (บาท)</span>
          </div>

          <div className="divide-y divide-slate-800/50">
            <div className="p-3 flex items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-200">ค่าแรงรายวัน</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  คิดเป็น {stats.wageUnits} หน่วยวัน × {formatMoney(settings.rate)} ฿
                  {stats.pubW > 0 && ` (รวมนักขัตฤกษ์ ${stats.pubW} วัน × ${settings.holMult} เท่า)`}
                  {record.unpaidCut > 0 && ` − หัก ${stats.unpaidHours} ชม. (-${formatMoney(record.unpaidCut)} ฿)`}
                </p>
              </div>
              <span className="font-mono font-bold text-slate-200 text-sm">{formatMoney(wage)}</span>
            </div>

            {extras.map((e) => (
              <div key={e.id} className="p-3 flex items-center justify-between gap-3">
                <span className="text-slate-300">{e.name}</span>
                <span className="font-mono font-semibold text-slate-200">{formatMoney(e.amt)}</span>
              </div>
            ))}

            <div
              className={`p-3 flex items-center justify-between font-bold text-sm ${
                isDark ? 'bg-slate-900/40 text-slate-100' : 'bg-slate-50 text-slate-800'
              }`}
            >
              <span>รวมรายได้ทั้งสิ้น</span>
              <span className="font-mono">{formatMoney(gross)}</span>
            </div>
          </div>
        </div>

        {/* Deductions Details */}
        <div className="rounded-xl border border-slate-700/60 overflow-hidden text-xs">
          <div
            className={`px-3 py-2 font-semibold flex items-center justify-between ${
              isDark ? 'bg-slate-900/80 text-rose-400' : 'bg-slate-100 text-rose-700'
            }`}
          >
            <span>🔴 รายการหัก (Deduction)</span>
            <span>จำนวนเงิน (บาท)</span>
          </div>

          <div className="divide-y divide-slate-800/50">
            <div className="p-3 flex items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-200">ประกันสังคม ({settings.sso}%)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ฐานคิด ปกส.: <strong className="text-emerald-400 font-mono">{formatMoney(record.ssoBaseAmount ?? (settings.ssoBase === 'all' ? gross : wage))} ฿</strong>
                  {settings.ssoCap > 0 && ` · เพดาน ${settings.ssoCap} ฿`}
                </p>
                {(record.pubWage || 0) > 0 ? (
                  <p className="text-[10px] text-amber-400/90 mt-0.5">
                    * ยกเว้นค่าแรงวันนักขัตฤกษ์ ({formatMoney(record.pubWage)} ฿) ไม่นำมาคิดประกันสังคม
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    * วันนักขัตฤกษ์ไม่นำมาคิดประกันสังคม
                  </p>
                )}
              </div>
              <span className="font-mono font-bold text-rose-400 text-sm">-{formatMoney(sso)}</span>
            </div>

            <div className="p-3 flex items-center justify-between gap-3">
              <span className="text-slate-300">ภาษีหัก ณ ที่จ่าย</span>
              <span className="font-mono font-semibold text-rose-400">-{formatMoney(tax)}</span>
            </div>

            {oth > 0 && (
              <div className="p-3 flex items-center justify-between gap-3">
                <span className="text-slate-300">{othName || 'หักอื่นๆ'}</span>
                <span className="font-mono font-semibold text-rose-400">-{formatMoney(oth)}</span>
              </div>
            )}

            <div
              className={`p-3 flex items-center justify-between font-bold text-sm ${
                isDark ? 'bg-slate-900/40 text-rose-400' : 'bg-slate-50 text-rose-700'
              }`}
            >
              <span>รวมเงินหักทั้งสิ้น</span>
              <span className="font-mono">-{formatMoney(ded)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Days Statistics Breakdown */}
      <div className="rounded-xl border border-slate-700/60 p-3.5 mb-4 text-xs">
        <h4 className="font-semibold mb-2 text-slate-300">📋 สรุปรายละเอียดวันทำงาน</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
          <div>
            วันทำงานปกติ: <strong className="text-slate-200">{stats.work} วัน</strong>
          </div>
          <div>
            นักขัตฤกษ์ (ทำงาน): <strong className="text-amber-400">{stats.pubW} วัน</strong>
          </div>
          <div>
            วันหยุดสัปดาห์: <strong className="text-slate-300">{stats.holiday} วัน (0 หน่วยวัน/0 ฿)</strong>
          </div>
          <div>
            ลาป่วย/ลากิจ/พักร้อน:{' '}
            <strong className="text-slate-200">{stats.sick + stats.personal + stats.annual} วัน</strong>
          </div>
          <div>
            ขาดงาน: <strong className="text-rose-400">{stats.absent} วัน</strong>
          </div>
          <div>
            ชม. ไม่ได้ค่าจ้าง: <strong className="text-orange-400">{stats.unpaidHours} ชม.</strong>
          </div>
          <div className="col-span-2">
            หน่วยวันที่ได้รับค่าจ้างทั้งหมด: <strong className="text-emerald-400">{stats.wageUnits} หน่วยวัน</strong>
          </div>
        </div>
      </div>

      {/* Bonus / Absence highlights */}
      {pubBonus > 0 && (
        <div
          className={`p-3 rounded-xl border mb-3 flex items-start gap-2.5 text-xs ${
            isDark
              ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <Gift size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>โบนัสพิเศษวันนักขัตฤกษ์: +{formatMoney(pubBonus)} บาท</strong>
            <p className="text-[11px] opacity-80 mt-0.5">
              ทำงานในวันหยุดนักขัตฤกษ์ {stats.pubW} วัน ได้รับอัตรา {settings.holMult} เท่า (ส่วนต่างโบนัส {settings.holMult - 1} เท่า)
            </p>
          </div>
        </div>
      )}

      {lostAbs > 0 && (
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
            isDark
              ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong>สูญเสียรายได้จากการขาดงาน: -{formatMoney(lostAbs)} บาท</strong>
            <p className="text-[11px] opacity-80 mt-0.5">
              ขาดงานไป {stats.absent} วัน × อัตรา {formatMoney(settings.rate)} ฿/วัน
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
