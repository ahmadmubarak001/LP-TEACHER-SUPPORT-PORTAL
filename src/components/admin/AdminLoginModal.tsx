import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login, toggleDemoAdmin, isLoading } = useAuth();
  const { lang, t } = useLanguage();

  const [email, setEmail] = useState('admin.scert@kerala.gov.in');
  const [password, setPassword] = useState('Admin@Kerala2026');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await login(email, password);
    if (result.success) {
      onLoginSuccess();
      onClose();
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemo = () => {
    toggleDemoAdmin();
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admin-login-title" className="text-sm font-bold">
                {t('adminLogin')}
              </h3>
              <p className="text-[11px] text-slate-400">Restricted Administrator Area</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close admin login modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              {lang === 'ml'
                ? 'പൊതു ഉപയോക്താക്കൾക്ക് രജിസ്ട്രേഷൻ അനുമതിയില്ല. അഡ്മിൻ അക്കൗണ്ടുകൾ ഡാറ്റാബേസ് തലത്തിൽ മാത്രമാണ് അനുവദിക്കുന്നത്.'
                : 'Public admin registration is strictly disabled. Administrator credentials are restricted to verified educational curriculum officers.'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Email / ഉദ്യോഗസ്ഥ ഇമെയിൽ
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.scert@kerala.gov.in"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password / പാസ്‌വേഡ്
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isLoading ? 'Verifying...' : 'Sign In as Administrator'}</span>
            </button>
          </form>

          {/* Quick Demo Access for immediate testing */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={handleQuickDemo}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick Demo: Sign In as SCERT Admin</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Simulates verified administrator session to inspect all features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
