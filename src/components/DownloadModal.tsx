import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  FileCheck, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { Resource } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DownloadModalProps {
  resource: Resource | null;
  onClose: () => void;
  onDownloadSuccess?: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  resource,
  onClose,
  onDownloadSuccess,
}) => {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);

  useEffect(() => {
    if (!resource) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setSignedUrl(null);
    setTimeLeft(60);
    setDownloadStarted(false);

    // Call secure backend endpoint /api/download-resource
    fetch('/api/download-resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId: resource.id }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate secure download link');
        }
        return data;
      })
      .then((data) => {
        if (!isMounted) return;
        setSignedUrl(data.signedUrl);
        setTimeLeft(data.expiresInSeconds || 60);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'An error occurred while preparing your download.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [resource]);

  // Countdown timer for 60s signed URL TTL
  useEffect(() => {
    if (!signedUrl || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [signedUrl, timeLeft]);

  if (!resource) return null;

  const handleTriggerDownload = () => {
    if (!signedUrl || timeLeft <= 0) return;
    setDownloadStarted(true);

    // Trigger download
    const anchor = document.createElement('a');
    anchor.href = signedUrl;
    anchor.download = resource.file_path.split('/').pop() || `${resource.title_en}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    if (onDownloadSuccess) {
      onDownloadSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 id="download-modal-title" className="text-sm font-bold text-slate-800">
                {lang === 'ml' ? 'സുരക്ഷിത ഡൗൺലോഡ് ഗേറ്റ്‌വേ' : 'Secure Download Gateway'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">Private Supabase Storage</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close download modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Resource Details Header */}
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md mb-2">
              {lang === 'ml' ? `ക്ലാസ് ${resource.class_level}` : `Class ${resource.class_level}`} • {resource.subject}
            </span>
            <h4 className="text-base font-bold text-slate-900 leading-snug mb-1 font-gayathri">
              {lang === 'ml' ? resource.title_ml : resource.title_en}
            </h4>
            <p className="text-xs text-slate-500 italic">
              {lang === 'ml' ? resource.title_en : resource.title_ml}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-600 font-medium">
              <span>{resource.file_format}</span>
              <span>•</span>
              <span>{resource.file_size}</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700 font-gayathri">
                {lang === 'ml'
                  ? 'പ്രൈവറ്റ് സ്റ്റോറേജ് അനുമതി പരിശോധിച്ച് സൈൻഡ് ലിങ്ക് തയ്യാറാക്കുന്നു...'
                  : 'Verifying published status and generating short-lived signed URL...'}
              </p>
              <p className="text-xs text-slate-400">
                Enforcing Row Level Security & Private Bucket Integrity
              </p>
            </div>
          )}

          {/* Error State (e.g. Draft resource blocked) */}
          {error && (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-rose-900 font-gayathri">
                {lang === 'ml' ? 'ഡൗൺലോഡ് അനുവദനീയമല്ല' : 'Download Not Permitted'}
              </h5>
              <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 leading-relaxed">
                {error}
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )}

          {/* Success State with Signed URL & Countdown */}
          {!loading && !error && signedUrl && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold">
                    {lang === 'ml' ? 'പരിശോധന പൂർത്തിയായി: ലിങ്ക് തയ്യാറാണ്' : 'Verification Complete: Signed URL Ready'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {timeLeft === 0 ? (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto" />
                  <p className="text-xs font-bold text-amber-900">
                    {lang === 'ml' ? 'ഡൗൺലോഡ് ലിങ്കിന്റെ കാലാവധി കഴിഞ്ഞു (60 സെക്കൻഡ്)' : 'Signed URL expired (60 seconds TTL)'}
                  </p>
                  <button
                    onClick={() => {
                      setLoading(true);
                      fetch('/api/download-resource', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resourceId: resource.id }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          setSignedUrl(data.signedUrl);
                          setTimeLeft(60);
                          setLoading(false);
                        });
                    }}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {lang === 'ml' ? 'പുതിയ ലിങ്ക് നേടുക' : 'Generate Fresh Signed URL'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleTriggerDownload}
                    className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>{lang === 'ml' ? 'ഇപ്പോൾ ഡൗൺലോഡ് ചെയ്യുക' : 'Download Now'}</span>
                  </button>

                  {downloadStarted && (
                    <p className="text-center text-xs text-emerald-700 font-medium animate-pulse">
                      {lang === 'ml' ? 'ഡൗൺലോഡ് ആരംഭിച്ചു!' : 'Download initiated successfully!'}
                    </p>
                  )}
                </div>
              )}

              {/* RLS Security Notice */}
              <div className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ml'
                    ? 'ഈ ഫയൽ സ്വകാര്യ ക്ലൗഡ് സ്റ്റോറേജിൽ പരിരക്ഷിതമാണ്. സൈൻ ചെയ്ത താൽക്കാലിക ടോക്കൺ വഴി മാത്രമേ ഡൗൺലോഡ് സാധ്യമാകൂ.'
                    : 'Protected by Supabase Private Storage & RLS. Direct public bucket access is restricted.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
