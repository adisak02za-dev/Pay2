import React, { useState } from 'react';
import { X, User, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (profile: UserProfile) => void;
  isDark: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  isDark,
}) => {
  const [localName, setLocalName] = useState<string>('');
  const [localEmail, setLocalEmail] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    // Generate a Google user identity
    const googleProfile: UserProfile = {
      id: `google-${Date.now()}`,
      name: localName.trim() || 'ผู้ใช้ Google Account',
      email: localEmail.trim() || 'user@gmail.com',
      provider: 'google',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    };
    onLogin(googleProfile);
    onClose();
  };

  const handleLocalLogin = () => {
    if (!localName.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้งาน');
      return;
    }
    const profile: UserProfile = {
      id: `user-${localName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: localName.trim(),
      email: localEmail.trim() || undefined,
      provider: 'local',
    };
    onLogin(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
              <User size={18} />
            </div>
            <h3 className="text-base font-bold">เข้าสู่ระบบผู้ใช้งาน</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          เชื่อมต่อบัญชีเพื่อบันทึกประวัติการคำนวณและตั้งค่าส่วนตัว ข้อมูลจะถูกอัปเดตและซิงค์ทันทีแบบ Real-time
        </p>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs mb-4">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98] mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.15C3.18 21.32 7.23 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.19C.43 8.15 0 9.89 0 11.7s.43 3.55 1.19 5.1l4.08-2.56z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.18 2.68 1.19 6.6l4.08 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          <span>เข้าสู่ระบบด้วย Google Account</span>
        </button>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
          </div>
          <span
            className={`relative px-3 text-[11px] uppercase tracking-wider ${
              isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'
            }`}
          >
            หรือเข้าใช้งานด้วยชื่อบัญชี
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              placeholder="เช่น Somchai Prasert"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">อีเมล (ไม่บังคับ)</label>
            <input
              type="email"
              placeholder="somchai@example.com"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleLocalLogin}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            เข้าใช้งาน
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl border text-xs font-medium ${
              isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
            }`}
          >
            ยกเลิก
          </button>
        </div>

        {currentUser.provider !== 'guest' && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>บัญชีที่ล็อกอินอยู่:</span>
            <span className="font-semibold text-blue-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> {currentUser.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
