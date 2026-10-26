import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { RequestStatus, TeacherRequest } from '../types';

interface TrackRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackRequestModal: React.FC<TrackRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lang, t } = useLanguage();

  const [refNumber, setRefNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Partial<TeacherRequest> | null>(null);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/track-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refNumber: refNumber.trim().toUpperCase(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Request not found. Please verify reference number and mobile.');
        setLoading(false);
        return;
      }

      setResult(data.request);
      setLoading(false);
    } catch {
      setError('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: RequestStatus) => {
    switch (status) {
      case 'fulfilled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {t('statusFulfilled')}
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
            {t('statusInReview')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            {t('statusRejected')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            {t('statusPending')}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Search className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 id="track-modal-title" className="text-sm font-bold text-slate-800 font-gayathri">
                {lang === 'ml' ? 'അപേക്ഷയുടെ അവസ്ഥ പരിശോധിക്കുക' : 'Track Request Status'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">Private Request Lookup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close track modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleTrack} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ml' ? 'റഫറൻസ് നമ്പർ (Reference Number)' : 'Reference Number'} *
              </label>
              <input
                type="text"
                required
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. LPR-2026-7K2M9"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ml' ? 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ' : 'Registered Mobile Number'} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : (lang === 'ml' ? 'പരിശോധിക്കുക' : 'Track Status')}</span>
            </button>
          </form>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-700">
                  {result.ref_number}
                </span>
                {getStatusBadge(result.status)}
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <strong className="text-slate-800">{lang === 'ml' ? 'അധ്യാപകൻ:' : 'Teacher:'}</strong> {result.teacher_name}
                </p>
                <p>
                  <strong className="text-slate-800">{lang === 'ml' ? 'സ്കൂൾ:' : 'School:'}</strong> {result.school_name}
                </p>
                <p>
                  <strong className="text-slate-800">{lang === 'ml' ? 'ക്ലാസ് & വിഷയം:' : 'Class & Subject:'}</strong> Class {result.class_level} • {result.subject}
                </p>
                <p>
                  <strong className="text-slate-800">{lang === 'ml' ? 'വിഭവ തരം:' : 'Resource Type:'}</strong> {result.request_type}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Submitted: {new Date(result.created_at || '').toLocaleDateString()}</span>
                <span className="flex items-center text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified Submission
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
