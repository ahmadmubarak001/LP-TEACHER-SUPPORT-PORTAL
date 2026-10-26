import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Copy, 
  ShieldAlert, 
  HelpCircle,
  School,
  User,
  Phone,
  Mail,
  FileSpreadsheet
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { KERALA_DISTRICTS, LP_CLASSES, LP_SUBJECTS, RESOURCE_TYPES } from '../constants/keralaData';
import { generateCaptchaChallenge } from '../utils/security';
import { CaptchaChallenge, ClassLevel, Subject, ResourceType } from '../types';

interface TeacherRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted?: () => void;
}

export const TeacherRequestModal: React.FC<TeacherRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted,
}) => {
  const { lang, t } = useLanguage();

  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [district, setDistrict] = useState(KERALA_DISTRICTS[0].id);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>(1);
  const [subject, setSubject] = useState<Subject>('malayalam');
  const [requestType, setRequestType] = useState<ResourceType>('lesson_plan');
  const [description, setDescription] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot trap

  // CAPTCHA
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCaptcha(generateCaptchaChallenge());
      setSubmittedRef(null);
      setErrors({});
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      teacher_name: teacherName,
      school_name: schoolName,
      district,
      phone_number: phoneNumber,
      email,
      class_level: classLevel,
      subject,
      request_type: requestType,
      description,
      honeypot,
      captchaAnswer,
      captchaExpected: captcha?.expectedAnswer,
    };

    try {
      const response = await fetch('/api/teacher-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.error || 'Failed to submit request' });
        }
        setIsSubmitting(false);
        return;
      }

      // Submission confirmed by database
      setSubmittedRef(data.ref_number);
      setIsSubmitting(false);

      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const copyRefToClipboard = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setTeacherName('');
    setSchoolName('');
    setPhoneNumber('');
    setEmail('');
    setDescription('');
    setCaptchaAnswer('');
    setSubmittedRef(null);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 id="request-modal-title" className="text-base font-bold font-gayathri">
                {t('requestFormTitle')}
              </h3>
              <p className="text-xs text-emerald-200/90">
                {lang === 'ml' ? 'എൽ.പി അധ്യാപകർക്കായി പ്രത്യേക വിഭവ അപേക്ഷ' : 'Kerala LP Teachers Curriculum Resource Service'}
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            aria-label="Close request modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedRef ? (
            /* Confirmation Screen */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-1 font-gayathri">
                  {lang === 'ml' ? 'അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു!' : 'Request Successfully Registered!'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {lang === 'ml'
                    ? 'നിങ്ങളുടെ അപേക്ഷ സ്വീകരിച്ചു. താഴെ കാണുന്ന റഫറൻസ് നമ്പർ സൂക്ഷിക്കുക. ഇത് ഉപയോഗിച്ച് അപേക്ഷയുടെ അവസ്ഥ പരിശോധിക്കാം.'
                    : 'Your request has been stored in our database. Save this reference number to track your preparation status.'}
                </p>
              </div>

              {/* Reference Number Card */}
              <div className="p-4 bg-slate-50 border-2 border-emerald-500/40 rounded-2xl max-w-sm mx-auto">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Official Reference Number / റഫറൻസ് നമ്പർ
                </span>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-black font-mono tracking-wider text-emerald-800">
                    {submittedRef}
                  </span>
                  <button
                    onClick={copyRefToClipboard}
                    className="p-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                    title="Copy reference number"
                    aria-label="Copy reference number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copied && (
                  <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
                    Copied to clipboard!
                  </span>
                )}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 text-left max-w-md mx-auto space-y-1">
                <p className="font-semibold">
                  {lang === 'ml' ? '• സ്വകാര്യതാ സുരക്ഷ (Private Database):' : '• Privacy Protection:'}
                </p>
                <p className="text-slate-600 text-[11px]">
                  {lang === 'ml'
                    ? 'അധ്യാപകരുടെ വ്യക്തിഗത വിവരങ്ങളും ഫോൺ നമ്പറും പൊതു പോർട്ടലിൽ പ്രദർശിപ്പിക്കില്ല. അഡ്മിന് മാത്രമേ കാണാൻ കഴിയൂ.'
                    : 'Teacher contact details are protected under RLS and never exposed publicly.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Done / പൂർത്തിയായി
                </button>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {errors.form}
                </div>
              )}

              {/* Bot Honeypot field (hidden from genuine users) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Teacher Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('teacherName')} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder={lang === 'ml' ? 'ഉദാ: പ്രിയ സുരേഷ്' : 'e.g. Priya Suresh'}
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border ${
                        errors.teacher_name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                      } focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  {errors.teacher_name && (
                    <span className="text-[11px] text-rose-600">{errors.teacher_name}</span>
                  )}
                </div>

                {/* School Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('schoolName')} *
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder={lang === 'ml' ? 'ഉദാ: GLPS കോട്ടയം' : 'e.g. GLPS Kottayam'}
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border ${
                        errors.school_name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                      } focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  {errors.school_name && (
                    <span className="text-[11px] text-rose-600">{errors.school_name}</span>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('district')} *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {lang === 'ml' ? `${d.name_ml} (${d.name_en})` : d.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('phoneNumber')} *
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
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border ${
                        errors.phone_number ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                      } focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  {errors.phone_number && (
                    <span className="text-[11px] text-rose-600">{errors.phone_number}</span>
                  )}
                </div>
              </div>

              {/* Class, Subject, Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Class */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('classLevel')} *
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(Number(e.target.value) as ClassLevel)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {LP_CLASSES.map((c) => (
                      <option key={c.level} value={c.level}>
                        {lang === 'ml' ? c.title_ml : c.title_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('subject')} *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as Subject)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {LP_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {lang === 'ml' ? s.name_ml : s.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resource Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('resourceTypeNeeded')} *
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {RESOURCE_TYPES.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {lang === 'ml' ? rt.name_ml : rt.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('detailedDescription')} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    lang === 'ml'
                      ? 'ഉദാഹരണത്തിന്: മൂന്നാം ക്ലാസിലെ പരിസരപഠനം യൂണിറ്റ് 2 പൂന്തോട്ടത്തിലെ വിത്തുകൾ എന്ന പാഠഭാഗത്തിനായി കളർ വർക്ക്ഷീറ്റുകളും മാതൃകാ പ്രവർത്തനങ്ങളും ആവശ്യമുണ്ട്...'
                      : 'Please specify the lesson, learning outcomes, or specific type of TLM needed for your LP classroom...'
                  }
                  className={`w-full p-3 text-xs sm:text-sm rounded-xl border ${
                    errors.description ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  } focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
                />
                {errors.description && (
                  <span className="text-[11px] text-rose-600">{errors.description}</span>
                )}
              </div>

              {/* Anti-Spam CAPTCHA */}
              {captcha && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      {t('securityChallenge')}
                    </span>
                    <span className="text-xs text-emerald-800 font-semibold">
                      {lang === 'ml' ? captcha.question_ml : captcha.question_en}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      required
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      placeholder="Answer"
                      className={`w-28 px-3 py-1.5 text-xs sm:text-sm rounded-lg border ${
                        errors.captcha ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                      } text-center font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                </div>
              )}
              {errors.captcha && (
                <span className="text-[11px] text-rose-600 block">{errors.captcha}</span>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t('submitting') : t('submitRequest')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
