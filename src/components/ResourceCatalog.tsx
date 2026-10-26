import React from 'react';
import { Filter, RotateCcw, BookOpen, Layers } from 'lucide-react';
import { Resource, ClassLevel, Subject, ResourceType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LP_SUBJECTS, RESOURCE_TYPES } from '../constants/keralaData';
import { ResourceCard } from './ResourceCard';

interface ResourceCatalogProps {
  resources: Resource[];
  selectedSubject: Subject | 'all';
  setSelectedSubject: (s: Subject | 'all') => void;
  selectedType: ResourceType | 'all';
  setSelectedType: (t: ResourceType | 'all') => void;
  selectedClass: ClassLevel | 'all';
  setSelectedClass: (c: ClassLevel | 'all') => void;
  searchQuery: string;
  onClearFilters: () => void;
  onDownload: (resource: Resource) => void;
  isAdmin?: boolean;
}

export const ResourceCatalog: React.FC<ResourceCatalogProps> = ({
  resources,
  selectedSubject,
  setSelectedSubject,
  selectedType,
  setSelectedType,
  selectedClass,
  setSelectedClass,
  searchQuery,
  onClearFilters,
  onDownload,
  isAdmin = false,
}) => {
  const { lang, t } = useLanguage();

  const isFiltered =
    selectedSubject !== 'all' ||
    selectedType !== 'all' ||
    selectedClass !== 'all' ||
    searchQuery.trim().length > 0;

  return (
    <section className="py-10 px-4 container mx-auto max-w-7xl">
      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 shrink-0 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'ml' ? 'വിഷയം:' : 'Subject:'}</span>
            </span>

            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('allSubjects')}
            </button>

            {LP_SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubject === sub.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lang === 'ml' ? sub.name_ml : sub.name_en}
              </button>
            ))}
          </div>

          {/* Type Dropdown & Reset */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Resource Type Dropdown */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ResourceType | 'all')}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 pr-8 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                aria-label="Filter by resource type"
              >
                <option value="all">{t('allTypes')}</option>
                {RESOURCE_TYPES.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {lang === 'ml' ? rt.name_ml : rt.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {isFiltered && (
              <button
                onClick={onClearFilters}
                className="inline-flex items-center space-x-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-2 rounded-xl transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('clearFilters')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Catalog Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 font-gayathri">
            {lang === 'ml' ? 'ലഭ്യമായ പഠന വിഭവങ്ങൾ' : 'Available Learning Resources'}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {resources.length}{' '}
            {lang === 'ml' ? 'സാമഗ്രികൾ ലഭ്യമാണ്' : 'verified materials ready for classroom use'}
          </p>
        </div>

        {/* Security badge: Storage Bucket Protected */}
        <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{lang === 'ml' ? 'സുരക്ഷിത പ്രൈവറ്റ് സ്റ്റോറേജ് (Signed URL 60s)' : 'Private Storage (60s Signed URLs)'}</span>
        </div>
      </div>

      {/* Resources Grid */}
      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onDownload={onDownload}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-2 font-gayathri">
            {t('noResourcesFound')}
          </h4>
          <p className="text-xs text-slate-500 mb-6">
            {lang === 'ml'
              ? 'തിരഞ്ഞ ക്ലാസിലോ വിഷയത്തിലോ ഉള്ള സാമഗ്രികൾ ഇപ്പോൾ ലഭ്യമല്ലെങ്കിൽ താഴെയുള്ള ബട്ടൺ വഴി അപേക്ഷിക്കാം.'
              : 'If what you need is not yet available, submit a request and our resource team will prepare it.'}
          </p>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('clearFilters')}</span>
          </button>
        </div>
      )}
    </section>
  );
};
