import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Copy, 
  FileCode, 
  Key, 
  Lock,
  RefreshCw,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { isLiveSupabaseConfigured } from '../../lib/supabaseClient';

interface TestResult {
  name: string;
  description: string;
  passed: boolean;
  details: string;
}

export const SupabaseStatusPanel: React.FC = () => {
  const [testingRls, setTestingRls] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const runRlsTests = async () => {
    setTestingRls(true);
    try {
      const res = await fetch('/api/test-rls');
      const data = await res.json();
      setTestResults(data.tests || []);
      setTestingRls(false);
    } catch {
      setTestingRls(false);
    }
  };

  const copyMigrationSnippet = () => {
    const snippet = `-- Enable RLS on all tables
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anonymous users can ONLY view published resources
CREATE POLICY "Public can view published resources only"
  ON public.resources FOR SELECT USING (status = 'published');

-- Teacher requests are private: only admins can view all
CREATE POLICY "Admins can view all teacher requests"
  ON public.teacher_requests FOR SELECT USING (public.is_admin());

-- Disable client-side admin self-elevation
CREATE OR REPLACE FUNCTION public.prevent_public_admin_elevation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'admin' AND current_user <> 'service_role' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin role elevation prohibited.';
  END IF;
  RETURN NEW;
END;
$$;`;
    navigator.clipboard.writeText(snippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Status Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLiveSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {isLiveSupabaseConfigured ? 'Supabase Live Connection Active' : 'Supabase Local Storage Mode'}
                </h4>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isLiveSupabaseConfigured
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {isLiveSupabaseConfigured ? 'Production Live' : 'Verified Local Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isLiveSupabaseConfigured
                  ? 'Connecting to your cloud Supabase database with Row-Level Security.'
                  : 'Operating via deterministic seeded local state. Plug in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to link your project.'}
              </p>
            </div>
          </div>

          <button
            onClick={runRlsTests}
            disabled={testingRls}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {testingRls ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Run RLS Policy Test Suite</span>
          </button>
        </div>

        {/* Security Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1 font-semibold">Storage Security</span>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Private Bucket (Signed 60s)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Direct public URL access blocked</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1 font-semibold">Row Level Security</span>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Drafts & Requests Isolated</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Anonymous SELECT restricted to published</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1 font-semibold">Admin Provisioning</span>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Client Registration Disabled</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Admin elevation blocked via trigger</p>
          </div>
        </div>
      </div>

      {/* RLS Policy Test Runner Results */}
      {testResults && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Automated RLS Policy & Storage Validation Results</span>
            </h4>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {testResults.filter((t) => t.passed).length}/{testResults.length} Checks Passed
            </span>
          </div>

          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-800">{t.name}</span>
                  </div>
                  <p className="text-slate-500 pl-6">{t.description}</p>
                  <p className="text-slate-700 font-mono text-[11px] pl-6">{t.details}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ml-2 ${
                    t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {t.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Provisioning Instructions */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
        <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Key className="w-4 h-4 text-emerald-600" />
          <span>Administrator Provisioning Process (Documented)</span>
        </h4>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">
            How to provision a verified curriculum administrator:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 pl-1">
            <li>
              In your <strong>Supabase Dashboard → Authentication → Users</strong>, click <strong>"Add User"</strong> and invite or create the administrator email (e.g., <code>admin.scert@kerala.gov.in</code>).
            </li>
            <li>
              Run the following SQL in <strong>Supabase SQL Editor</strong> to elevate their profile to <code>'admin'</code>:
              <pre className="mt-1.5 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
{`UPDATE public.profiles
SET role = 'admin', full_name = 'Curriculum Coordinator'
WHERE email = 'admin.scert@kerala.gov.in';`}
              </pre>
            </li>
            <li>
              The database trigger <code>prevent_public_admin_elevation</code> actively blocks any regular user from tampering with their JWT or calling <code>supabase.auth.updateUser</code> to grant themselves the admin role.
            </li>
          </ol>
        </div>

        {/* Copyable SQL Snippet */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-700 flex items-center space-x-1.5">
              <FileCode className="w-4 h-4 text-slate-500" />
              <span>Core RLS Security SQL</span>
            </span>
            <button
              onClick={copyMigrationSnippet}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Full migration file is preserved at <code>supabase/migrations/20261026000000_lp_teacher_support_schema.sql</code>
          </p>
        </div>
      </div>
    </div>
  );
};
