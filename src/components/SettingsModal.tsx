import React, { useState } from 'react';
import { Settings, Save, KeyRound, Download, Upload, Trash2, Check, Copy } from 'lucide-react';
import { UserSettings } from '../types';
import { generateSyncCode, importSyncCode, loadDatabase } from '../utils/storage';

interface SettingsModalProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onClearRecords: () => void;
  isDark: boolean;
  onRefreshData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClearRecords,
  isDark,
  onRefreshData,
}) => {
  const [form, setForm] = useState<UserSettings>({ ...settings });
  const [syncCodeInput, setSyncCodeInput] = useState<string>('');
  const [copiedSyncCode, setCopiedSyncCode] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleSave = () => {
    onSaveSettings(form);
    setFeedbackMsg({ text: '✅ บันทึกการตั้งค่าเรียบร้อยแล้ว', ok: true });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleGenerateCode = () => {
    const code = generateSyncCode();
    setSyncCodeInput(code);
    navigator.clipboard?.writeText(code);
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 3000);
    setFeedbackMsg({ text: '📋 สร้างและคัดลอกรหัสซิงค์ลงคลิปบอร์ดแล้ว', ok: true });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleImportCode = () => {
    if (!syncCodeInput.trim()) {
      setFeedbackMsg({ text: '⚠️ กรุณาวางรหัสซิงค์ก่อนนำเข้า', ok: false });
      return;
    }
    const res = importSyncCode(syncCodeInput);
    if (res.success) {
      setFeedbackMsg({ text: `✅ นำเข้าข้อมูลสำเร็จ (${res.count} งวด)`, ok: true });
      onRefreshData();
    } else {
      setFeedbackMsg({ text: `❌ ${res.error || 'รหัสไม่ถูกต้อง'}`, ok: false });
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleExportJson = () => {
    const db = loadDatabase();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `payslip-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setFeedbackMsg({ text: '⬇️ ดาวน์โหลดไฟล์สำรองเรียบร้อยแล้ว', ok: true });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.users) throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
        localStorage.setItem('payslip_tracker_v2', JSON.stringify(parsed));
        onRefreshData();
        setFeedbackMsg({ text: '✅ กู้คืนข้อมูลจากไฟล์สำเร็จ', ok: true });
      } catch (err) {
        setFeedbackMsg({ text: '❌ ไฟล์สำรองข้อมูลไม่ถูกต้อง', ok: false });
      }
      setTimeout(() => setFeedbackMsg(null), 3500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackMsg.ok
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}
        >
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 1. Sync Code section */}
      <div
        className={`p-5 rounded-2xl border transition-colors shadow-sm ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <KeyRound size={18} className="text-blue-400" />
          <h2 className="text-base font-bold">ซิงค์และย้ายข้อมูลข้ามอุปกรณ์ (Sync Code)</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          นำรหัสซิงค์นี้ไปวางในเบราว์เซอร์อื่นหรือมือถือ เพื่อโหลดประวัติและการตั้งค่าทั้งหมดได้ทันที
        </p>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={syncCodeInput}
            onChange={(e) => setSyncCodeInput(e.target.value)}
            placeholder="กด 'สร้างรหัสซิงค์' เพื่อคัดลอก หรือวางรหัสซิงค์จากเครื่องอื่นที่นี่..."
            className={`w-full p-3 rounded-xl border text-xs font-mono outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateCode}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                copiedSyncCode
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                  : isDark
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {copiedSyncCode ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedSyncCode ? 'คัดลอกแล้ว!' : 'สร้างรหัสซิงค์และคัดลอก'}</span>
            </button>

            <button
              onClick={handleImportCode}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
            >
              📥 นำเข้ารหัสซิงค์ลงเครื่องนี้
            </button>
          </div>
        </div>
      </div>

      {/* 2. Calculation Parameters */}
      <div
        className={`p-5 rounded-2xl border transition-colors shadow-sm ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Settings size={18} className="text-blue-400" />
          <h2 className="text-base font-bold">ตั้งค่าอัตราการคำนวณเงินเดือน</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          ค่าเหล่านี้จะถูกผูกกับบัญชีของคุณและใช้คำนวณอัตโนมัติในทุกงวด
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ค่าแรงต่อวัน (บาท)</label>
            <input
              type="number"
              step="1"
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ชั่วโมงทำงานต่อวัน</label>
            <input
              type="number"
              step="0.5"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: parseFloat(e.target.value) || 8 })}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              🎌 ตัวคูณนักขัตฤกษ์ (ทำงาน)
            </label>
            <input
              type="number"
              step="0.5"
              value={form.holMult}
              onChange={(e) => setForm({ ...form, holMult: parseFloat(e.target.value) || 2 })}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ประกันสังคม (%)</label>
            <input
              type="number"
              step="0.5"
              value={form.sso}
              onChange={(e) => setForm({ ...form, sso: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              เพดานประกันสังคมต่องวด (บาท)
            </label>
            <input
              type="number"
              step="10"
              value={form.ssoCap}
              onChange={(e) => setForm({ ...form, ssoCap: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              ฐานการคิดประกันสังคม
            </label>
            <select
              value={form.ssoBase}
              onChange={(e) => setForm({ ...form, ssoBase: e.target.value as 'wage' | 'all' })}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="wage">ค่าแรงรายวันเท่านั้น</option>
              <option value="all">ค่าแรง + รายได้เพิ่มเติมทั้งหมด</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              ภาษีหัก ณ ที่จ่ายต่องวด (บาท)
            </label>
            <input
              type="number"
              step="1"
              value={form.tax}
              onChange={(e) => setForm({ ...form, tax: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ชื่อรายการหักอื่นๆ</label>
            <input
              type="text"
              value={form.othName}
              onChange={(e) => setForm({ ...form, othName: e.target.value })}
              placeholder="เช่น ค่าชุดฟอร์ม"
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ยอดเงินหักอื่นๆ (บาท)</label>
            <input
              type="number"
              step="1"
              value={form.oth}
              onChange={(e) => setForm({ ...form, oth: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              ⚡ ปุ่มลัดรายได้เพิ่มเติม — ชื่อ
            </label>
            <input
              type="text"
              value={form.qName}
              onChange={(e) => setForm({ ...form, qName: e.target.value })}
              placeholder="Incentive Audit"
              className={`w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              ⚡ ปุ่มลัดรายได้เพิ่มเติม — จำนวนเงิน (บาท)
            </label>
            <input
              type="number"
              step="10"
              value={form.qAmt}
              onChange={(e) => setForm({ ...form, qAmt: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Save size={15} />
          <span>บันทึกการตั้งค่า</span>
        </button>
      </div>

      {/* 3. Backup & Reset */}
      <div
        className={`p-5 rounded-2xl border transition-colors shadow-sm ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <h2 className="text-base font-bold mb-1">สำรองข้อมูลและจัดการประวัติ</h2>
        <p className="text-xs text-slate-400 mb-4">
          ดาวน์โหลดไฟล์สำรองเก็บไว้ในเครื่อง หรือล้างประวัติทั้งหมด
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJson}
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Download size={14} />
            <span>ดาวน์โหลดไฟล์สำรอง (.json)</span>
          </button>

          <label
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Upload size={14} />
            <span>กู้คืนข้อมูลจากไฟล์</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('คุณต้องการลบประวัติที่บันทึกไว้ทั้งหมดใช่หรือไม่? ไม่สามารถกู้คืนได้')) {
                onClearRecords();
                setFeedbackMsg({ text: '🗑️ ล้างประวัติทั้งหมดแล้ว', ok: true });
                setTimeout(() => setFeedbackMsg(null), 3000);
              }
            }}
            className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>ล้างประวัติทั้งหมด</span>
          </button>
        </div>
      </div>
    </div>
  );
};
