import React, { useRef } from 'react';
import { Calendar, Image as ImageIcon, Trash2, ArrowRight } from 'lucide-react';
import { PeriodInfo } from '../types';

interface PeriodFormProps {
  selectedMonth: string; // YYYY-MM
  selectedHalf: 1 | 2;
  onChangeMonth: (m: string) => void;
  onChangeHalf: (h: 1 | 2) => void;
  onGenerateDays: () => void;
  imagePreview: string | null;
  onSetImage: (img: string | null) => void;
  isDark: boolean;
  currentPeriod: PeriodInfo | null;
}

export const PeriodForm: React.FC<PeriodFormProps> = ({
  selectedMonth,
  selectedHalf,
  onChangeMonth,
  onChangeHalf,
  onGenerateDays,
  imagePreview,
  onSetImage,
  isDark,
  currentPeriod,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress image via canvas
        const maxDimension = 1200;
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          onSetImage(compressed);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1️⃣ Choose Pay Period */}
      <div
        className={`p-5 rounded-2xl border transition-colors shadow-sm ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold">
            1
          </span>
          <h2 className="text-base font-bold">เลือกงวดจ่ายค่าแรง</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          เงินออก <strong className="text-blue-400">ทุกวันที่ 5 และ 20</strong> · ตัดยอดล่วงหน้า 5 วันก่อนวันจ่ายเงิน
          <br className="hidden sm:inline" />
          งวด <strong className="text-slate-300">1–15</strong> จ่ายวันที่ <strong className="text-emerald-400">20 เดือนเดียวกัน</strong> · งวด{' '}
          <strong className="text-slate-300">16–สิ้นเดือน</strong> จ่ายวันที่ <strong className="text-emerald-400">5 เดือนถัดไป</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">เดือน / ปี (ค.ศ.)</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => onChangeMonth(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">งวดการคำนวณ</label>
            <select
              value={selectedHalf}
              onChange={(e) => onChangeHalf(Number(e.target.value) as 1 | 2)}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            >
              <option value={1}>งวดแรก (1–15) → จ่ายวันที่ 20</option>
              <option value={2}>งวดหลัง (16–สิ้นเดือน) → จ่ายวันที่ 5</option>
            </select>
          </div>

          <div>
            <button
              onClick={onGenerateDays}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>สร้างตารางวัน</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {currentPeriod && (
          <div
            className={`mt-4 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
              isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className="text-slate-400">งวดปัจจุบัน: </span>
              <span className="font-semibold text-blue-400">{currentPeriod.label}</span>
            </div>
            <div>
              <span className="text-slate-400">วันจ่ายเงินเดือน: </span>
              <span className="font-semibold text-emerald-400">{currentPeriod.payLabel}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2️⃣ Work Schedule Photo */}
      <div
        className={`p-5 rounded-2xl border transition-colors shadow-sm ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold">
              2
            </span>
            <h2 className="text-base font-bold">แนบรูปถ่ายตารางเวลาทำงาน</h2>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
            ไม่บังคับ
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          เก็บรูปภาพตารางทำงานไว้เทียบเคียงคู่กับงวดนี้ · ระบบจะย่อขนาดให้อัตโนมัติ
        </p>

        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-72 flex items-center justify-center bg-black/40">
            <img src={imagePreview} alt="Work Schedule" className="max-h-72 object-contain" />
            <button
              onClick={() => onSetImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors shadow-lg"
              title="ลบรูปภาพ"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDark
                ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/40'
                : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/40'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-2">
              <ImageIcon size={20} />
            </div>
            <div className="text-xs font-semibold mb-1">คลิกเพื่อเลือกรูป หรือลากไฟล์มาวางที่นี่</div>
            <div className="text-[11px] text-slate-400">รองรับไฟล์ JPG, PNG ถ่ายให้เห็นคอลัมน์การเข้างานชัดเจน</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
