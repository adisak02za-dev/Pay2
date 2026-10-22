import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { PeriodForm } from './components/PeriodForm';
import { DayTable } from './components/DayTable';
import { ExtraIncomeForm } from './components/ExtraIncomeForm';
import { CalculationSummary } from './components/CalculationSummary';
import { RealTimeCharts } from './components/RealTimeCharts';
import { HistoryView } from './components/HistoryView';
import { CompareView } from './components/CompareView';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';
import {
  DayItem,
  ExtraIncomeItem,
  PayRecord,
  PeriodInfo,
  UserProfile,
  UserSettings,
} from './types';
import {
  calculatePayroll,
  DEFAULT_SETTINGS,
  generateInitialDays,
  generatePeriodInfo,
} from './utils/calculator';
import {
  deletePayRecord,
  getCurrentUser,
  loadDatabase,
  saveDatabase,
  savePayRecord,
  setCurrentUser,
  updateUserSettings,
} from './utils/storage';

export default function App() {
  const [db, setDb] = useState(() => loadDatabase());
  const [isDark, setIsDark] = useState<boolean>(() => {
    const loaded = loadDatabase();
    return loaded.theme !== 'light';
  });

  const currentUserData = useMemo(() => getCurrentUser(db), [db]);
  const user = currentUserData.profile;
  const settings = currentUserData.settings;
  const records = currentUserData.records;

  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;
  const defaultMonthStr = `${defaultYear}-${String(defaultMonth).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonthStr);
  const [selectedHalf, setSelectedHalf] = useState<1 | 2>(now.getDate() <= 15 ? 1 : 2);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodInfo>(() => {
    const [y, m] = defaultMonthStr.split('-').map(Number);
    return generatePeriodInfo(y, m, now.getDate() <= 15 ? 1 : 2);
  });

  const [days, setDays] = useState<DayItem[]>(() => generateInitialDays(currentPeriod));
  const [extras, setExtras] = useState<ExtraIncomeItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'calc' | 'hist' | 'comp' | 'set'>('calc');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-900 text-slate-100 font-sans antialiased min-h-screen';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-800 font-sans antialiased min-h-screen';
    }
    const currentDb = loadDatabase();
    currentDb.theme = isDark ? 'dark' : 'light';
    saveDatabase(currentDb);
  }, [isDark]);

  // โหลดจาก Supabase ตอนเปิดเว็บ
  useEffect(() => {
    const loadFromSupabase = async () => {
      const { data } = await supabase.from('payslips').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const dbNow = loadDatabase();
        const uid = dbNow.currentUserId || 'guest';
        const supaRecords = data.map((d: any) => d.slip_data as PayRecord).filter(Boolean);
        const merged = [...supaRecords, ...dbNow.users[uid].records].filter((v,i,a)=>a.findIndex(x=>x.key===v.key)===i);
        dbNow.users[uid].records = merged;
        saveDatabase(dbNow);
        setDb({ ...dbNow });
      }
    };
    loadFromSupabase();
  }, []);

  useEffect(() => {
    const handleDbChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setDb(customEvent.detail);
      }
    };
    window.addEventListener('pst_db_changed', handleDbChange);
    return () => window.removeEventListener('pst_db_changed', handleDbChange);
  }, []);

  const currentCalculation = useMemo<PayRecord>(() => {
    return calculatePayroll(currentPeriod, days, settings, extras, imagePreview);
  }, [currentPeriod, days, settings, extras, imagePreview]);

  const isSaved = useMemo(() => {
    return records.some((r) => r.key === currentCalculation.key && r.net === currentCalculation.net);
  }, [records, currentCalculation]);

  const handleGenerateDays = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const pInfo = generatePeriodInfo(y, m, selectedHalf);
    setCurrentPeriod(pInfo);
    setDays(generateInitialDays(pInfo));
    setExtras([]);
    setImagePreview(null);
    showToast(`🗓️ สร้างตารางงวด ${pInfo.label} แล้ว`);
  };

  const handleUpdateDay = (index: number, updates: Partial<DayItem>) => {
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleQuickPreset = (preset: 'all_work' | 'tue_holiday' | 'sun_holiday' | 'sat_sun_holiday') => {
    setDays((prev) =>
      prev.map((d) => {
        if (preset === 'all_work') return { ...d, type: 'work' };
        if (preset === 'tue_holiday' && d.dow === 2) return { ...d, type: 'holiday', unpaidHours: 0 };
        if (preset === 'sun_holiday' && d.dow === 0) return { ...d, type: 'holiday', unpaidHours: 0 };
        if (preset === 'sat_sun_holiday' && (d.dow === 0 || d.dow === 6)) return { ...d, type: 'holiday', unpaidHours: 0 };
        return d;
      })
    );
    showToast('⚡ ปรับแต่งตารางวันเรียบร้อย');
  };

  const handleAddExtra = () => {
    setExtras((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), name: '', amt: 0 }]);
  };

  const handleQuickAddExtra = () => {
    if (settings.qAmt <= 0) return;
    setExtras((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), name: settings.qName || 'Incentive', amt: settings.qAmt }]);
    showToast(`⚡ เพิ่ม ${settings.qName} +${settings.qAmt} ฿ เรียบร้อย`);
  };

  const handleUpdateExtra = (id: string, updates: Partial<ExtraIncomeItem>) => {
    setExtras((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleRemoveExtra = (id: string) => {
    setExtras((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveCurrentRecord = async () => {
    savePayRecord(currentCalculation);
    const updatedDb = loadDatabase();
    setDb(updatedDb);
    showToast(`💾 บันทึกงวด ${currentCalculation.period.label} เรียบร้อยแล้ว`);
    try {
      await supabase.from('payslips').upsert({
        key: currentCalculation.key,
        net_pay: currentCalculation.net,
        period_label: currentCalculation.period.label,
        slip_data: currentCalculation,
      }, { onConflict: 'key' });
    } catch (e) { console.error(e); }
  };

  const handleOpenRecord = (record: PayRecord) => {
    setCurrentPeriod(record.period);
    setSelectedMonth(`${record.period.y}-${String(record.period.m).padStart(2, '0')}`);
    setSelectedHalf(record.period.half);
    setDays(record.days);
    setExtras(record.extras || []);
    setImagePreview(record.imgUrl || null);
    setCurrentTab('calc');
    showToast(`📂 เปิดข้อมูลย้อนหลังงวด ${record.period.label}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecord = async (id: string) => {
    deletePayRecord(id);
    const updatedDb = loadDatabase();
    setDb(updatedDb);
    showToast('🗑️ ลบประวัติเรียบร้อย');
    try { await supabase.from('payslips').delete().eq('key', id); } catch {}
  };

  const handleClearAllRecords = async () => {
    const updatedDb = loadDatabase();
    const uid = updatedDb.currentUserId || 'guest';
    if (updatedDb.users[uid]) {
      updatedDb.users[uid].records = [];
      saveDatabase(updatedDb);
      setDb(updatedDb);
    }
    showToast('🗑️ ล้างประวัติทั้งหมดแล้ว');
    try { await supabase.from('payslips').delete().neq('key', '___never___'); } catch {}
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    updateUserSettings(newSettings);
    const updatedDb = loadDatabase();
    setDb(updatedDb);
    showToast('✅ บันทึกการตั้งค่าแล้ว');
  };

  const handleRefreshData = () => {
    const updatedDb = loadDatabase();
    setDb(updatedDb);
    showToast('🔄 อัปเดตข้อมูลเรียบร้อยแล้ว');
  };

  const handleUserLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    const updatedDb = loadDatabase();
    setDb(updatedDb);
    showToast(`👋 ยินดีต้อนรับ ${profile.name}`);
  };

  const handleUserLogout = () => {
    const guestProfile: UserProfile = { id: 'guest', name: 'ผู้ใช้ทั่วไป (Guest)', provider: 'guest' };
    setCurrentUser(guestProfile);
    const updatedDb = loadDatabase();
    setDb(updatedDb);
    showToast('👋 ออกจากระบบเรียบร้อย');
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold shadow-2xl shadow-black animate-slideUp">
          {toastMessage}
        </div>
      )}
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleUserLogout} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 space-y-6">
        {currentTab === 'calc' && (
          <div className="space-y-6 animate-fadeIn">
            <PeriodForm selectedMonth={selectedMonth} selectedHalf={selectedHalf} onChangeMonth={setSelectedMonth} onChangeHalf={setSelectedHalf} onGenerateDays={handleGenerateDays} imagePreview={imagePreview} onSetImage={setImagePreview} isDark={isDark} currentPeriod={currentPeriod} />
            <DayTable days={days} settings={settings} onUpdateDay={handleUpdateDay} onQuickPreset={handleQuickPreset} isDark={isDark} />
            <ExtraIncomeForm extras={extras} settings={settings} onAddExtra={handleAddExtra} onQuickAdd={handleQuickAddExtra} onUpdateExtra={handleUpdateExtra} onRemoveExtra={handleRemoveExtra} onCalculate={() => { showToast('⚡ คำนวณยอดเงินและอัปเดตกราฟแบบ Real-time เรียบร้อย'); const el = document.getElementById('calculation-summary-card'); el?.scrollIntoView({ behavior: 'smooth' }); }} isDark={isDark} />
            <RealTimeCharts currentRecord={currentCalculation} historyRecords={records} isDark={isDark} />
            <CalculationSummary record={currentCalculation} onSaveRecord={handleSaveCurrentRecord} isDark={isDark} isSaved={isSaved} />
          </div>
        )}
        {currentTab === 'hist' && (<div className="animate-fadeIn"><HistoryView records={records} onOpenRecord={handleOpenRecord} onDeleteRecord={handleDeleteRecord} onGoToCalc={() => setCurrentTab('calc')} isDark={isDark} /></div>)}
        {currentTab === 'comp' && (<div className="animate-fadeIn"><CompareView records={records} isDark={isDark} onGoToCalc={() => setCurrentTab('calc')} /></div>)}
        {currentTab === 'set' && (<div className="animate-fadeIn"><SettingsModal settings={settings} onSaveSettings={handleSaveSettings} onClearRecords={handleClearAllRecords} isDark={isDark} onRefreshData={handleRefreshData} /></div>)}
      </main>
      <footer className={`border-t py-4 text-center text-xs text-slate-500 mt-10 transition-colors ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>PaySlip Tracker © {new Date().getFullYear()} · ระบบคำนวณค่าแรงรายวัน กราฟสรุป Real-time และ Dark Mode</footer>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} currentUser={user} onLogin={handleUserLogin} isDark={isDark} />
    </div>
  );
}
