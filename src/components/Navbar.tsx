import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Send, 
  ShieldCheck, 
  Globe2, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenRequestModal: () => void;
  onOpenTrackModal: () => void;
  onOpenAdminLogin: () => void;
  currentView: 'portal' | 'admin';
  setCurrentView: (view: 'portal' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRequestModal,
  onOpenTrackModal,
  onOpenAdminLogin,
  currentView,
  setCurrentView,
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const { isAdmin, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs transition-colors">
      {/* Top Banner: Kerala Government / Samagra Shiksha style banner */}
      <div className="bg-emerald-800 text-emerald-50 text-xs px-4 py-1.5 font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="font-gayathri tracking-wide font-bold">
              {lang === 'ml' 
                ? 'പൊതുവിദ്യാഭ്യാസ സംരക്ഷണ യജ്ഞം | കേരള സർക്കാർ' 
                : 'General Education Department | Government of Kerala'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-block text-emerald-200/80">
              {lang === 'ml' ? 'എൽ.പി സ്കൂൾ അധ്യാപക വിഭവ കലവറ' : 'LP School Curriculum & TLM Repository'}
            </span>

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/60 hover:bg-emerald-900 text-white font-semibold transition-all text-[11px] border border-emerald-700/50 cursor-pointer"
              title="Change Language / ഭാഷ മാറ്റുക"
              aria-label="Toggle language between Malayalam and English"
            >
              <Globe2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>{lang === 'ml' ? 'English' : 'മലയാളം'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setCurrentView('portal')}
          className="flex items-center space-x-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setCurrentView('portal')}
          aria-label="LP Teacher Support Portal Home"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 font-gayathri">
                {lang === 'ml' ? 'കേരള എൽ.പി അധ്യാപക സഹായി' : 'LP Teacher Support Portal'}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                LP 1-4
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {lang === 'ml' ? 'പാഠാസൂത്രണം • വർക്ക്ഷീറ്റുകൾ • പഠനോപകരണങ്ങൾ' : 'Lesson Plans • Worksheets • Question Pools • TLM'}
            </p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* Track Request */}
          <button
            onClick={onOpenTrackModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>{t('trackRequest')}</span>
          </button>

          {/* Teacher Request Modal Button */}
          <button
            onClick={onOpenRequestModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-lg shadow-sm shadow-emerald-700/20 transition-all hover:shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{t('requestResource')}</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Admin Navigation */}
          {isAdmin ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView(currentView === 'admin' ? 'portal' : 'admin')}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                <span>{currentView === 'admin' ? (lang === 'ml' ? 'പോർട്ടലിലേക്ക്' : 'View Portal') : t('adminDashboard')}</span>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Logout"
                aria-label="Logout administrator"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('adminLogin')}</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex lg:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 bg-white border-b border-slate-200 space-y-2.5">
          <button
            onClick={() => {
              setCurrentView('portal');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-emerald-50 rounded-lg"
          >
            {lang === 'ml' ? 'വിഭവ ശേഖരം (Resources)' : 'Public Resources'}
          </button>

          <button
            onClick={() => {
              onOpenRequestModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{t('requestResource')}</span>
          </button>

          <button
            onClick={() => {
              onOpenTrackModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{t('trackRequest')}</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            {isAdmin ? (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCurrentView(currentView === 'admin' ? 'portal' : 'admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-900 bg-emerald-100 rounded-lg flex items-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{currentView === 'admin' ? 'View Public Portal' : t('adminDashboard')}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded-lg flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAdminLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('adminLogin')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
