import React from 'react';
import { Eye, Trash2, Calendar, FileText, ArrowUpRight } from 'lucide-react';
import { PayRecord } from '../types';
import { formatMoney, TH_MONTHS } from '../utils/calculator';

interface HistoryViewProps {
  records: PayRecord[];
  onOpenRecord: (record: PayRecord) => void;
  onDeleteRecord: (id: string) => void;
  onGoToCalc: () => void;
  isDark: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onOpenRecord,
  onDeleteRecord,
  onGoToCalc,
  isDark,
}) => {
  if (!records || records.length === 0) {
    return (
      <div
        className={`p-10 rounded-2xl border text-center transition-colors shadow-sm ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center text-2xl mb-3">
          📭
        </div>
        <h3 className="text-base font-bold mb-1">ยังไม่มีประวัติที่บันทึกไว้</h3>
        <p className="text-xs text-slate-400 mb-5 max-w-sm mx-auto">
          เมื่อคุณคำนวณงวดเสร็จแล้ว สามารถกดปุ่ม &quot;บันทึกงวดนี้เก็บไว้&quot; เพื่อดูสถิติย้อนหลังและกราฟเปรียบเทียบได้
        </p>
        <button
          onClick={onGoToCalc}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-1.5"
        >
          <span>ไปที่หน้าคำนวณงวดใหม่</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    );
  }

  // Group by Payment Month Key (payMonthKey e.g. 2026-10)
  const grouped: Record<string, PayRecord[]> = {};
  records.forEach((r) => {
    const k = r.period.payMonthKey;
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(r);
  });

  const sortedMonths = Object.keys(grouped).sort().reverse();

  return (
    <div className="space-y-6">
      {sortedMonths.map((mKey) => {
        const [y, m] = mKey.split('-').map(Number);
        const list = grouped[mKey];
        const totalNet = list.reduce((sum, r) => sum + r.net, 0);
        const totalGross = list.reduce((sum, r) => sum + r.gross, 0);
        const totalDed = list.reduce((sum, r) => sum + r.ded, 0);

        return (
          <div
            key={mKey}
            className={`p-5 rounded-2xl border transition-colors shadow-sm ${
              isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
            }`}
          >
            {/* Month Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-700/50 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-400" />
                  <span>
                    เดือนที่เงินออก: {TH_MONTHS[m - 1]} {y + 543}
                  </span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  จำนวน {list.length} งวด · รายได้รวม {formatMoney(totalGross)} ฿ · หักรวม {formatMoney(totalDed)} ฿
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">รับสุทธิรวมเดือนนี้</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {formatMoney(totalNet)} ฿
                </span>
              </div>
            </div>

            {/* List of records in this month */}
            <div className="space-y-2.5">
              {list.map((r) => (
                <div
                  key={r.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isDark
                      ? 'bg-slate-900/70 border-slate-700/60 hover:border-slate-600'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Thumbnail / Icon & Details */}
                  <div className="flex items-center gap-3">
                    {r.imgUrl ? (
                      <img
                        src={r.imgUrl}
                        alt="Work Schedule"
                        className="w-14 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-12 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                    )}

                    <div>
                      <div className="font-bold text-sm text-slate-200">
                        งวด {r.period.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>จ่าย {r.period.payLabel}</span>
                        <span>· ได้ค่าจ้าง {r.stats.paidDays} วัน</span>
                        {r.stats.pubW > 0 && (
                          <span className="text-amber-400">· นักขัตฤกษ์ {r.stats.pubW} วัน</span>
                        )}
                        {r.stats.absent > 0 && (
                          <span className="text-rose-400">· ขาด {r.stats.absent} วัน</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount and Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-bold font-mono text-emerald-400">
                        {formatMoney(r.net)} ฿
                      </div>
                      <div className="text-[11px] text-slate-400">
                        หัก -{formatMoney(r.ded)} ฿
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenRecord(r)}
                        className={`p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 text-blue-400 ${
                          isDark
                            ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                        title="ดูรายละเอียดหรือคำนวณซ้ำ"
                      >
                        <Eye size={14} />
                        <span className="text-[11px]">เปิดดู</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`ต้องการลบประวัติงวด ${r.period.label} ใช่หรือไม่?`)) {
                            onDeleteRecord(r.id);
                          }
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="ลบงวดนี้"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
