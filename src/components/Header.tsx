import React from 'react';
import { Sun, Moon, Sparkles, User, LogOut, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentTab: 'calc' | 'hist' | 'comp' | 'set';
  onSelectTab: (tab: 'calc' | 'hist' | 'comp' | 'set') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  user,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-800'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('calc')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-lg shadow-md shadow-blue-500/20">
            💰
          </div>
          <div>
            <div className="font-bold text-base leading-tight flex items-center gap-1.5">
              PaySlip Tracker
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 size={10} /> Real-time
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              คำนวณค่าแรงรายวัน &amp; กราฟสรุป
            </div>
          </div>
        </div>

        {/* Right tools: Dark Mode toggle & User Profile */}
        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title={isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด (ถนอมสายตา)'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden md:inline">{isDark ? 'โหมดสว่าง' : 'โหมดมืด'}</span>
          </button>

          {/* User Account Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isDark
                  ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-blue-500/50'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={12} />
                )}
              </div>
              <span className="max-w-[100px] sm:max-w-[140px] truncate">{user.name}</span>
            </button>

            {user.provider !== 'guest' && (
              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                aria-label="ออกจากระบบ"
                className={`p-2 rounded-xl border transition-all text-slate-400 hover:text-red-400 ${
                  isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => onSelectTab('calc')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            currentTab === 'calc'
              ? isDark
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-blue-600 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🧮 คำนวณงวดใหม่
        </button>
        <button
          onClick={() => onSelectTab('hist')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            currentTab === 'hist'
              ? isDark
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-blue-600 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          📚 ประวัติรายเดือน
        </button>
        <button
          onClick={() => onSelectTab('comp')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            currentTab === 'comp'
              ? isDark
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-blue-600 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          📊 เปรียบเทียบงวด
        </button>
        <button
          onClick={() => onSelectTab('set')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            currentTab === 'set'
              ? isDark
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-blue-600 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ⚙️ ตั้งค่า
        </button>
      </div>
    </header>
  );
};
