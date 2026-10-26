import React from 'react';
import { Search, Sparkles, BookCheck, Download, Users, MapPin, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LP_CLASSES } from '../constants/keralaData';
import { ClassLevel } from '../types';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedClass: ClassLevel | 'all';
  setSelectedClass: (c: ClassLevel | 'all') => void;
  onOpenRequestModal: () => void;
  stats: {
    totalPublished: number;
    totalDownloads: number;
    totalRequests: number;
  };
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  setSearchQuery,
  selectedClass,
  setSelectedClass,
  onOpenRequestModal,
  stats,
}) => {
  const { lang, t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white pt-12 pb-16 px-4">
      {/* Background Subtle Kerala Education Motif Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10 text-center">
        {/* Department Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{lang === 'ml' ? 'കേരള പൊതുവിദ്യാഭ്യാസ സംരക്ഷണ പദ്ധതി' : 'Kerala General Education Department Quality Initiative'}</span>
        </div>

        {/* Hero Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto mb-4 font-gayathri text-balance">
          {t('heroTitle')}
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center shadow-xl rounded-2xl bg-white text-slate-800 p-2 focus-within:ring-4 focus-within:ring-emerald-500/30 transition-all">
            <Search className="w-6 h-6 text-slate-400 ml-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full px-3 py-2.5 text-sm sm:text-base bg-transparent border-none focus:outline-hidden text-slate-800 placeholder-slate-400 font-sans"
              aria-label="Search resources"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 mr-2"
              >
                Clear
              </button>
            )}
            <button
              onClick={onOpenRequestModal}
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === 'ml' ? 'ആവശ്യപ്പെടുക' : 'Request'}</span>
            </button>
          </div>
        </div>

        {/* Class Level Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              selectedClass === 'all'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300'
                : 'bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/15'
            }`}
          >
            {t('allClasses')}
          </button>

          {LP_CLASSES.map((cls) => (
            <button
              key={cls.level}
              onClick={() => setSelectedClass(cls.level)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedClass === cls.level
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300'
                  : 'bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/15'
              }`}
            >
              <span>{lang === 'ml' ? cls.title_ml : cls.title_en}</span>
            </button>
          ))}
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-emerald-800/60">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-center space-x-2 text-emerald-300 mb-1">
              <BookCheck className="w-5 h-5" />
              <span className="text-2xl font-bold font-sans">{stats.totalPublished}</span>
            </div>
            <p className="text-xs text-emerald-200/80 font-medium">{t('statResources')}</p>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-center space-x-2 text-teal-300 mb-1">
              <Download className="w-5 h-5" />
              <span className="text-2xl font-bold font-sans">{stats.totalDownloads}</span>
            </div>
            <p className="text-xs text-emerald-200/80 font-medium">{t('statDownloads')}</p>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-center space-x-2 text-amber-300 mb-1">
              <Users className="w-5 h-5" />
              <span className="text-2xl font-bold font-sans">{stats.totalRequests}</span>
            </div>
            <p className="text-xs text-emerald-200/80 font-medium">{t('statRequests')}</p>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-center space-x-2 text-indigo-300 mb-1">
              <MapPin className="w-5 h-5" />
              <span className="text-2xl font-bold font-sans">14/14</span>
            </div>
            <p className="text-xs text-emerald-200/80 font-medium">{t('statDistricts')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
