import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  FileText, 
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TeacherRequest, RequestStatus } from '../../types';
import { KERALA_DISTRICTS } from '../../constants/keralaData';
import { useLanguage } from '../../context/LanguageContext';

interface RequestDetailModalProps {
  isOpen: boolean;
  request: TeacherRequest | null;
  onClose: () => void;
  onSave: (requestId: string, status: RequestStatus, adminNotes: string) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  request,
  onClose,
  onSave,
}) => {
  const { lang, t } = useLanguage();

  const [status, setStatus] = useState<RequestStatus>('pending');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setAdminNotes(request.admin_notes || '');
    }
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  const districtObj = KERALA_DISTRICTS.find((d) => d.id === request.district);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(request.id, status, adminNotes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-detail-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 id="request-detail-title" className="text-sm font-bold font-mono">
                {request.ref_number}
              </h3>
              <p className="text-xs text-slate-400">Teacher Resource Need Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close request detail modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Teacher Info Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">Teacher Name:</span>
              <span className="font-bold text-slate-900 text-sm flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500 mr-1" />
                {request.teacher_name}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">School:</span>
              <span className="font-semibold text-slate-800 flex items-center space-x-1">
                <School className="w-3.5 h-3.5 text-slate-500 mr-1" />
                {request.school_name}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">District:</span>
              <span className="font-semibold text-slate-800 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                {districtObj ? `${districtObj.name_en} (${districtObj.name_ml})` : request.district}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">Contact Mobile:</span>
              <span className="font-mono font-bold text-slate-800 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-500 mr-1" />
                {request.phone_number}
              </span>
            </div>
          </div>

          {/* Curriculum Need Details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                Class {request.class_level}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                {request.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-100">
                {request.request_type}
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                Teacher's Classroom Need Description:
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-gayathri">
                {request.description}
              </p>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Update Request Status (അവസ്ഥ മാറ്റുക) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['pending', 'in_review', 'fulfilled', 'rejected'] as RequestStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    status === st
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t(`status${st.charAt(0).toUpperCase() + st.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Private Administrator Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Private Internal Notes (അഡ്മിൻ കുറിപ്പുകൾ)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Never visible to public or teachers</span>
            </div>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Assigned to DIET Kottayam curriculum group. Worksheet draft under review. Will notify teacher once published."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              <span>Save Status & Notes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
