import React, { useState, useEffect } from 'react';
import { X, Save, FileText, CheckCircle2 } from 'lucide-react';
import { Resource, ClassLevel, Subject, ResourceType, ResourceStatus } from '../../types';
import { LP_CLASSES, LP_SUBJECTS, RESOURCE_TYPES } from '../../constants/keralaData';
import { useLanguage } from '../../context/LanguageContext';

interface ResourceEditorModalProps {
  isOpen: boolean;
  resource: Resource | null;
  onClose: () => void;
  onSave: (resourceData: Partial<Resource>) => void;
}

export const ResourceEditorModal: React.FC<ResourceEditorModalProps> = ({
  isOpen,
  resource,
  onClose,
  onSave,
}) => {
  const { lang } = useLanguage();

  const [titleMl, setTitleMl] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionMl, setDescriptionMl] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>(1);
  const [subject, setSubject] = useState<Subject>('malayalam');
  const [resourceType, setResourceType] = useState<ResourceType>('lesson_plan');
  const [filePath, setFilePath] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [status, setStatus] = useState<ResourceStatus>('draft');

  useEffect(() => {
    if (resource) {
      setTitleMl(resource.title_ml);
      setTitleEn(resource.title_en);
      setDescriptionMl(resource.description_ml);
      setDescriptionEn(resource.description_en);
      setClassLevel(resource.class_level);
      setSubject(resource.subject);
      setResourceType(resource.resource_type);
      setFilePath(resource.file_path);
      setFileSize(resource.file_size);
      setFileFormat(resource.file_format);
      setStatus(resource.status);
    } else {
      setTitleMl('');
      setTitleEn('');
      setDescriptionMl('');
      setDescriptionEn('');
      setClassLevel(1);
      setSubject('malayalam');
      setResourceType('lesson_plan');
      setFilePath('curriculum/lp_new_resource.pdf');
      setFileSize('1.8 MB');
      setFileFormat('PDF');
      setStatus('draft');
    }
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title_ml: titleMl.trim(),
      title_en: titleEn.trim(),
      description_ml: descriptionMl.trim(),
      description_en: descriptionEn.trim(),
      class_level: classLevel,
      subject,
      resource_type: resourceType,
      file_path: filePath.trim(),
      file_size: fileSize.trim(),
      file_format: fileFormat.trim(),
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 id="editor-title" className="text-base font-bold font-gayathri">
                {resource ? (lang === 'ml' ? 'വിഭവം തിരുത്തുക' : 'Edit Resource') : (lang === 'ml' ? 'പുതിയ വിഭവം ചേർക്കുക' : 'Add New Resource')}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {resource ? `ID: ${resource.id}` : 'Supabase Table: resources'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close resource editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title Malayalam */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Title in Malayalam (മലയാളം ശീർഷകം) *
              </label>
              <input
                type="text"
                required
                value={titleMl}
                onChange={(e) => setTitleMl(e.target.value)}
                placeholder="ഉദാ: ക്ലാസ് 2 ഗണിതം വർക്ക്ഷീറ്റ്"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Title English */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Title in English *
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Class 2 Maths Counting Worksheet"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Class Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Class Level (ക്ലാസ്) *
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(Number(e.target.value) as ClassLevel)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {LP_CLASSES.map((c) => (
                  <option key={c.level} value={c.level}>
                    {c.title_en} - {c.title_ml}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject (വിഷയം) *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {LP_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_en} - {s.name_ml}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resource Type (വിഭവ തരം) *
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {RESOURCE_TYPES.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name_en} - {rt.name_ml}
                  </option>
                ))}
              </select>
            </div>

            {/* Publishing Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Publishing Status (അവസ്ഥ) *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ResourceStatus)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="draft">Draft (കരട് - Public Downloads Blocked)</option>
                <option value="published">Published (പ്രസിദ്ധീകരിച്ചത് - Public Download Enabled)</option>
                <option value="archived">Archived (ആർക്കൈവ് ചെയ്തത് - Read Only)</option>
              </select>
            </div>

            {/* File Path */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Storage Path in Private Bucket *
              </label>
              <input
                type="text"
                required
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="e.g. class2/maths_unit1.pdf"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* File Format & Size */}
            <div className="flex space-x-2">
              <div className="w-1/2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Format</label>
                <input
                  type="text"
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Size</label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Description Malayalam */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description in Malayalam
            </label>
            <textarea
              rows={2}
              value={descriptionMl}
              onChange={(e) => setDescriptionMl(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Description English */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description in English
            </label>
            <textarea
              rows={2}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Resource</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
