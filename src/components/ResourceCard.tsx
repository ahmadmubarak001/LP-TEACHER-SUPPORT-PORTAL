import React from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Clock,
  Layers
} from 'lucide-react';
import { Resource } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LP_SUBJECTS, RESOURCE_TYPES } from '../constants/keralaData';

interface ResourceCardProps {
  resource: Resource;
  onDownload: (resource: Resource) => void;
  isAdmin?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onDownload,
  isAdmin = false,
}) => {
  const { lang, t } = useLanguage();

  const subjectInfo = LP_SUBJECTS.find((s) => s.id === resource.subject);
  const typeInfo = RESOURCE_TYPES.find((t) => t.id === resource.resource_type);

  const isPublished = resource.status === 'published';
  const isDraft = resource.status === 'draft';
  const isArchived = resource.status === 'archived';

  return (
    <article 
      className={`group relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isDraft 
          ? 'border-amber-300 bg-amber-50/30' 
          : isArchived 
            ? 'border-slate-300 opacity-75' 
            : 'border-slate-200/80 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/5'
      }`}
    >
      {/* Top Banner for Draft / Archived items */}
      {!isPublished && (
        <div className={`px-4 py-1.5 text-xs font-bold flex items-center justify-between ${
          isDraft ? 'bg-amber-100 text-amber-900 border-b border-amber-200' : 'bg-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>{isDraft ? (lang === 'ml' ? 'കരട് രൂപം (അഡ്മിന് മാത്രം)' : 'Draft - Admin Only') : (lang === 'ml' ? 'ആർക്കൈവ് ചെയ്തത്' : 'Archived')}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-mono">RLS Protected</span>
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Badges Header */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {/* Class Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            {lang === 'ml' ? `ക്ലാസ് ${resource.class_level}` : `Class ${resource.class_level}`}
          </span>

          {/* Subject Badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
            {lang === 'ml' ? subjectInfo?.name_ml || resource.subject : subjectInfo?.name_en || resource.subject}
          </span>

          {/* Resource Type */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-800 border border-teal-100/80">
            {lang === 'ml' ? typeInfo?.name_ml || resource.resource_type : typeInfo?.name_en || resource.resource_type}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug mb-2 font-gayathri">
          {lang === 'ml' ? resource.title_ml : resource.title_en}
        </h3>

        {/* Secondary Title in other language */}
        <p className="text-xs text-slate-500 font-medium mb-3 italic line-clamp-1">
          {lang === 'ml' ? resource.title_en : resource.title_ml}
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed flex-1">
          {lang === 'ml' ? resource.description_ml || resource.description_en : resource.description_en || resource.description_ml}
        </p>

        {/* Metadata Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
              {resource.file_format}
            </span>
            <span>{resource.file_size}</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-500 font-medium">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{resource.downloads_count} {t('downloadsCount')}</span>
          </div>
        </div>
      </div>

      {/* Card Action Button */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100">
        {isPublished ? (
          <button
            onClick={() => onDownload(resource)}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer group-hover:scale-[1.01]"
            aria-label={`Download ${resource.title_en}`}
          >
            <Download className="w-4 h-4" />
            <span>{t('download')}</span>
          </button>
        ) : (
          <button
            disabled={!isAdmin}
            onClick={() => isAdmin && onDownload(resource)}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-200 text-slate-600 font-semibold text-sm cursor-not-allowed"
            title="Draft resources cannot be downloaded publicly"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>{isAdmin ? 'Admin Test Download' : t('previewOnly')}</span>
          </button>
        )}
      </div>
    </article>
  );
};
