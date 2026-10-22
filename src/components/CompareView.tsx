import React, { useState } from 'react';
import { GitCompare, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PayRecord } from '../types';
import { formatMoney, comparePayRecords } from '../utils/calculator';

interface CompareViewProps {
  records: PayRecord[];
  isDark: boolean;
  onGoToCalc: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  records,
  isDark,
  onGoToCalc,
}) => {
  const [selectedAId, setSelectedAId] = useState<string>(
    records.length > 1 ? records[1].id : records[0]?.id || ''
  );
  const [selectedBId, setSelectedBId] = useState<string>(records[0]?.id || '');

  if (!records || records.length < 2) {
    return (
      <div
        className={`p-10 rounded-2xl border text-center transition-colors shadow-sm ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center text-2xl mb-3">
          📊
        </div>
        <h3 className="text-base font-bold mb-1">ต้องการอย่างน้อย 2 งวดเพื่อเปรียบเทียบ</h3>
        <p className="text-xs text-slate-400 mb-5 max-w-sm mx-auto">
          ปัจจุบันมีข้อมูลบันทึกอยู่ {records.length} งวด กรุณาบันทึกงวดเพิ่มเติมเพื่อวิเคราะห์เปรียบเทียบความแตกต่าง
        </p>
        <button
          onClick={onGoToCalc}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
        >
          ไปที่หน้าคำนวณงวดใหม่
        </button>
      </div>
    );
  }

  const recordA = records.find((r) => r.id === selectedAId) || records[0];
  const recordB = records.find((r) => r.id === selectedBId) || records[1];

  const diff = comparePayRecords(recordA, recordB);
  const maxNet = Math.max(recordA.net, recordB.net, 1);

  return (
    <div
      className={`p-5 rounded-2xl border transition-colors shadow-sm ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <GitCompare size={20} className="text-blue-400" />
        <h2 className="text-base font-bold">เปรียบเทียบผลตอบแทน 2 งวด</h2>
      </div>
      <p className="text-xs text-slate-400 mb-5">
        เลือกงวดที่ต้องการเปรียบเทียบเพื่อตรวจสอบว่ารายได้สุทธิเพิ่มขึ้นหรือลดลงจากปัจจัยใด
      </p>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">งวด A (งวดเปรียบเทียบ)</label>
          <select
            value={selectedAId}
            onChange={(e) => setSelectedAId(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                งวด {r.period.label} (จ่าย {r.period.payLabel}) — {formatMoney(r.net)} ฿
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">งวด B (งวดปัจจุบัน/เปรียบเทียบ)</label>
          <select
            value={selectedBId}
            onChange={(e) => setSelectedBId(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                งวด {r.period.label} (จ่าย {r.period.payLabel}) — {formatMoney(r.net)} ฿
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div
          className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300">งวด A: {recordA.period.label}</span>
            <span className="font-mono font-bold text-slate-100">{formatMoney(recordA.net)} ฿</span>
          </div>
          <div className="w-full bg-slate-700/40 h-2.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, (recordA.net / maxNet) * 100)}%` }}
            />
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300">งวด B: {recordB.period.label}</span>
            <span className="font-mono font-bold text-emerald-400">{formatMoney(recordB.net)} ฿</span>
          </div>
          <div className="w-full bg-slate-700/40 h-2.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, (recordB.net / maxNet) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/60 mb-5">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}>
              <th className="py-2.5 px-3 font-semibold">รายการเปรียบเทียบ</th>
              <th className="py-2.5 px-3 font-semibold text-right">งวด A</th>
              <th className="py-2.5 px-3 font-semibold text-right">งวด B</th>
              <th className="py-2.5 px-3 font-semibold text-right">ส่วนต่าง (B - A)</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
            <tr>
              <td className="py-2.5 px-3 font-medium">วันทำงานปกติ</td>
              <td className="py-2.5 px-3 text-right font-mono">{recordA.stats.work} วัน</td>
              <td className="py-2.5 px-3 text-right font-mono">{recordB.stats.work} วัน</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold">
                {renderCountDiff(diff.workDaysDiff)}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-3 font-medium">วันนักขัตฤกษ์ (ทำงาน)</td>
              <td className="py-2.5 px-3 text-right font-mono">{recordA.stats.pubW} วัน</td>
              <td className="py-2.5 px-3 text-right font-mono">{recordB.stats.pubW} วัน</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold">
                {renderCountDiff(diff.pubWDiff)}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-3 font-medium">ขาดงาน (ตัดค่าจ้าง)</td>
              <td className="py-2.5 px-3 text-right font-mono">{recordA.stats.absent} วัน</td>
              <td className="py-2.5 px-3 text-right font-mono">{recordB.stats.absent} วัน</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold">
                {renderCountDiff(diff.absDiff, true)}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-3 font-medium">หน่วยวันที่ได้รับค่าจ้าง</td>
              <td className="py-2.5 px-3 text-right font-mono">{recordA.stats.wageUnits} หน่วย</td>
              <td className="py-2.5 px-3 text-right font-mono">{recordB.stats.wageUnits} หน่วย</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold">
                {renderCountDiff(Number((recordB.stats.wageUnits - recordA.stats.wageUnits).toFixed(2)))}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-3 font-medium">ค่าแรงรายวัน</td>
              <td className="py-2.5 px-3 text-right font-mono">{formatMoney(recordA.wage)} ฿</td>
              <td className="py-2.5 px-3 text-right font-mono">{formatMoney(recordB.wage)} ฿</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold">
                {renderMoneyDiff(diff.wageDiff)}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-3 font-medium">รายได้เพิ่มเติม</td>
              <td className="py-2.5 px-3 text-right font-mono">{formatMoney(recordA.extraSum)} ฿</td>
              <td className="py-2.5 px-3 text-right font-mono">{formatMoney(recordB.extraSum)} ฿</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold">
                {renderMoneyDiff(recordB.extraSum - recordA.extraSum)}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-3 font-medium">รวมรายได้ (Gross)</td>
              <td className="py-2.5 px-3 text-right font-mono">{formatMoney(recordA.gross)} ฿</td>
              <td className="py-2.5 px-3 text-right font-mono">{formatMoney(recordB.gross)} ฿</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold">
                {renderMoneyDiff(diff.grossDiff)}
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-3 font-medium">รวมเงินหัก (Deduction)</td>
              <td className="py-2.5 px-3 text-right font-mono">-{formatMoney(recordA.ded)} ฿</td>
              <td className="py-2.5 px-3 text-right font-mono">-{formatMoney(recordB.ded)} ฿</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold">
                {renderMoneyDiff(diff.dedDiff, true)}
              </td>
            </tr>

            <tr className={isDark ? 'bg-slate-900/80 font-bold' : 'bg-slate-100 font-bold'}>
              <td className="py-3 px-3 text-sm">💰 เงินได้สุทธิ (Net Take-home)</td>
              <td className="py-3 px-3 text-right font-mono text-sm">{formatMoney(recordA.net)} ฿</td>
              <td className="py-3 px-3 text-right font-mono text-sm text-emerald-400">
                {formatMoney(recordB.net)} ฿
              </td>
              <td className="py-3 px-3 text-right font-mono text-sm">
                {renderMoneyDiff(diff.netDiff)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Analysis Insight Note */}
      <div
        className={`p-4 rounded-xl border text-xs leading-relaxed ${
          diff.netDiff > 0
            ? isDark
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : diff.netDiff < 0
            ? isDark
              ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            : isDark
            ? 'bg-slate-900/60 border-slate-700 text-slate-300'
            : 'bg-slate-100 border-slate-300 text-slate-700'
        }`}
      >
        {diff.netDiff > 0 ? (
          <div className="flex items-start gap-2">
            <TrendingUp size={18} className="shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <strong>📈 งวด B ได้รับเงินมากกว่างวด A จำนวน {formatMoney(diff.netDiff)} บาท</strong>
              <div className="mt-1 opacity-90">
                {diff.pubWDiff > 0 && `มีวันทำงานนักขัตฤกษ์เพิ่มขึ้น ${diff.pubWDiff} วัน · `}
                {diff.workDaysDiff > 0 && `มีวันทำงานปกติเพิ่มขึ้น ${diff.workDaysDiff} วัน · `}
                {recordB.extraSum > recordA.extraSum &&
                  `มีรายได้เพิ่มเติมเพิ่มขึ้น ${formatMoney(recordB.extraSum - recordA.extraSum)} บาท`}
              </div>
            </div>
          </div>
        ) : diff.netDiff < 0 ? (
          <div className="flex items-start gap-2">
            <TrendingDown size={18} className="shrink-0 mt-0.5 text-rose-400" />
            <div>
              <strong>📉 งวด B ได้รับเงินน้อยกว่างวด A จำนวน {formatMoney(Math.abs(diff.netDiff))} บาท</strong>
              <div className="mt-1 opacity-90">
                {diff.absDiff > 0 && `มีวันขาดงานเพิ่มขึ้น ${diff.absDiff} วัน · `}
                {diff.workDaysDiff < 0 && `มีวันทำงานปกติลดลง ${Math.abs(diff.workDaysDiff)} วัน · `}
                {recordB.extraSum < recordA.extraSum &&
                  `รายได้เพิ่มเติมลดลง ${formatMoney(recordA.extraSum - recordB.extraSum)} บาท`}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Minus size={16} />
            <span>ทั้งสองงวดได้รับเงินได้สุทธิเท่ากันพอดี ({formatMoney(recordA.net)} บาท)</span>
          </div>
        )}
      </div>
    </div>
  );
};

function renderMoneyDiff(val: number, inverse = false) {
  if (Math.abs(val) < 0.01) {
    return <span className="text-slate-400">เท่าเดิม</span>;
  }
  const isPositive = val > 0;
  const isGood = inverse ? !isPositive : isPositive;

  return (
    <span className={isGood ? 'text-emerald-400' : 'text-rose-400'}>
      {isPositive ? '+' : '-'}
      {formatMoney(Math.abs(val))} ฿
    </span>
  );
}

function renderCountDiff(val: number, inverse = false) {
  if (val === 0) {
    return <span className="text-slate-400">เท่าเดิม</span>;
  }
  const isPositive = val > 0;
  const isGood = inverse ? !isPositive : isPositive;

  return (
    <span className={isGood ? 'text-emerald-400' : 'text-rose-400'}>
      {isPositive ? '+' : '-'}
      {Math.abs(val)}
    </span>
  );
}
