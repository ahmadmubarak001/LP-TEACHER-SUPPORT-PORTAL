import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Send, 
  History, 
  Database, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Archive, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowLeft, 
  FileText, 
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  UploadCloud
} from 'lucide-react';
import { Resource, TeacherRequest, AuditLog, ResourceStatus, RequestStatus, ClassLevel } from '../../types';
import { localStore } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LP_CLASSES, LP_SUBJECTS, KERALA_DISTRICTS } from '../../constants/keralaData';
import { ResourceEditorModal } from './ResourceEditorModal';
import { RequestDetailModal } from './RequestDetailModal';
import { SupabaseStatusPanel } from './SupabaseStatusPanel';

interface AdminDashboardProps {
  onBackToPortal: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToPortal,
  onRefreshData,
}) => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'requests' | 'audit_logs' | 'supabase'>('overview');

  // Resources state
  const [resources, setResources] = useState<Resource[]>(() => localStore.getResources(true));
  const [resourceFilterStatus, setResourceFilterStatus] = useState<ResourceStatus | 'all'>('all');
  const [resourceFilterClass, setResourceFilterClass] = useState<ClassLevel | 'all'>('all');
  const [resourceSearch, setResourceSearch] = useState('');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Requests state
  const [requests, setRequests] = useState<TeacherRequest[]>(() => localStore.getTeacherRequests());
  const [requestFilterStatus, setRequestFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [requestFilterDistrict, setRequestFilterDistrict] = useState<string>('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => localStore.getAuditLogs());

  const refreshAll = () => {
    setResources(localStore.getResources(true));
    setRequests(localStore.getTeacherRequests());
    setAuditLogs(localStore.getAuditLogs());
    onRefreshData();
  };

  // ---------------------------------------------------------------------------
  // Resource Actions (Priority 3)
  // ---------------------------------------------------------------------------
  const handleSaveResource = (resourceData: Partial<Resource>) => {
    const adminEmail = user?.email || 'admin@lp-portal.org';

    if (editingResource) {
      // Update
      const updated = localStore.updateResource(editingResource.id, resourceData);
      localStore.addAuditLog({
        user_email: adminEmail,
        user_role: 'admin',
        action: 'RESOURCE_UPDATED',
        entity_type: 'resource',
        entity_id: editingResource.id,
        details: { previous: editingResource, updated },
      });
    } else {
      // Create
      const created = localStore.createResource(
        resourceData as Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'downloads_count'>
      );
      localStore.addAuditLog({
        user_email: adminEmail,
        user_role: 'admin',
        action: 'RESOURCE_CREATED',
        entity_type: 'resource',
        entity_id: created.id,
        details: { title_en: created.title_en, status: created.status },
      });
    }
    refreshAll();
  };

  const handleStatusChange = (resource: Resource, newStatus: ResourceStatus) => {
    const adminEmail = user?.email || 'admin@lp-portal.org';
    localStore.updateResource(resource.id, { status: newStatus });
    localStore.addAuditLog({
      user_email: adminEmail,
      user_role: 'admin',
      action: `RESOURCE_STATUS_${newStatus.toUpperCase()}`,
      entity_type: 'resource',
      entity_id: resource.id,
      details: {
        title_en: resource.title_en,
        previous_status: resource.status,
        new_status: newStatus,
      },
    });
    refreshAll();
  };

  const handleDeleteResource = (resource: Resource) => {
    if (!confirm(`Are you sure you want to delete "${resource.title_en}"?`)) return;
    const adminEmail = user?.email || 'admin@lp-portal.org';
    localStore.deleteResource(resource.id);
    localStore.addAuditLog({
      user_email: adminEmail,
      user_role: 'admin',
      action: 'RESOURCE_DELETED',
      entity_type: 'resource',
      entity_id: resource.id,
      details: { title_en: resource.title_en },
    });
    refreshAll();
  };

  // ---------------------------------------------------------------------------
  // Teacher Request Actions (Priority 3)
  // ---------------------------------------------------------------------------
  const handleSaveRequest = (requestId: string, newStatus: RequestStatus, adminNotes: string) => {
    const adminEmail = user?.email || 'admin@lp-portal.org';
    const target = requests.find((r) => r.id === requestId);
    localStore.updateTeacherRequestStatus(requestId, newStatus, adminNotes);
    localStore.addAuditLog({
      user_email: adminEmail,
      user_role: 'admin',
      action: 'TEACHER_REQUEST_STATUS_UPDATED',
      entity_type: 'teacher_request',
      entity_id: requestId,
      details: {
        ref_number: target?.ref_number,
        previous_status: target?.status,
        new_status: newStatus,
        adminNotesAdded: adminNotes.length > 0,
      },
    });
    refreshAll();
  };

  // Filters
  const filteredResources = resources.filter((r) => {
    if (resourceFilterStatus !== 'all' && r.status !== resourceFilterStatus) return false;
    if (resourceFilterClass !== 'all' && r.class_level !== resourceFilterClass) return false;
    if (resourceSearch.trim()) {
      const q = resourceSearch.toLowerCase();
      const matchTitle = r.title_en.toLowerCase().includes(q) || r.title_ml.toLowerCase().includes(q);
      const matchSubject = r.subject.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject) return false;
    }
    return true;
  });

  const filteredRequests = requests.filter((r) => {
    if (requestFilterStatus !== 'all' && r.status !== requestFilterStatus) return false;
    if (requestFilterDistrict !== 'all' && r.district !== requestFilterDistrict) return false;
    if (requestSearch.trim()) {
      const q = requestSearch.toLowerCase();
      const matchRef = r.ref_number.toLowerCase().includes(q);
      const matchName = r.teacher_name.toLowerCase().includes(q);
      const matchSchool = r.school_name.toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchSchool) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16">
      {/* Top Admin Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToPortal}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-colors cursor-pointer"
              title="Return to Public Portal"
              aria-label="Return to public portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold">LP Administrator Command Center</h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                  SCERT / DIET Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: <strong className="text-emerald-400 font-mono">{user?.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onBackToPortal}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              View Public Portal
            </button>
            <button
              onClick={() => {
                setEditingResource(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-4 flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'resources'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Resources ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Teacher Requests ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'audit_logs'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase & RLS Health</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* =================================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* =================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Published Resources</span>
                <span className="text-3xl font-extrabold text-emerald-700 font-sans">
                  {resources.filter((r) => r.status === 'published').length}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Live for public download</span>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Drafts (In Preparation)</span>
                <span className="text-3xl font-extrabold text-amber-600 font-sans">
                  {resources.filter((r) => r.status === 'draft').length}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Under curriculum review</span>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Pending Teacher Requests</span>
                <span className="text-3xl font-extrabold text-blue-600 font-sans">
                  {requests.filter((r) => r.status === 'pending').length}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Awaiting review</span>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Fulfilled Requests</span>
                <span className="text-3xl font-extrabold text-teal-700 font-sans">
                  {requests.filter((r) => r.status === 'fulfilled').length}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Materials published</span>
              </div>
            </div>

            {/* Recent Teacher Requests & Recent Privileged Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Requests */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Recent Teacher Submissions</h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {requests.slice(0, 3).map((req) => (
                    <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-800">{req.ref_number}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            Class {req.class_level} • {req.subject}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5 font-medium">{req.teacher_name} ({req.school_name})</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsRequestModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Audit Logs */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Privileged Operations Audit Log</h3>
                  <button
                    onClick={() => setActiveTab('audit_logs')}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {auditLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="py-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                          {log.action}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-600 truncate">{log.user_email}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: RESOURCES MANAGEMENT (Priority 3) */}
        {/* =================================================================== */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    placeholder="Search resources..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={resourceFilterStatus}
                  onChange={(e) => setResourceFilterStatus(e.target.value as ResourceStatus | 'all')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft (Private)</option>
                  <option value="archived">Archived</option>
                </select>

                {/* Class Filter */}
                <select
                  value={resourceFilterClass}
                  onChange={(e) => setResourceFilterClass(e.target.value === 'all' ? 'all' : Number(e.target.value) as ClassLevel)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">All Classes</option>
                  <option value="1">Class 1</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setEditingResource(null);
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Resource</span>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Resource Title</th>
                      <th className="px-4 py-3">Class & Subject</th>
                      <th className="px-4 py-3">Status (RLS)</th>
                      <th className="px-4 py-3">Downloads</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResources.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-bold text-slate-900 truncate font-gayathri">{res.title_ml}</p>
                          <p className="text-slate-500 text-[11px] truncate italic">{res.title_en}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800">Class {res.class_level}</span>
                          <span className="text-slate-400 mx-1">•</span>
                          <span className="text-slate-600 capitalize">{res.subject}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              res.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : res.status === 'draft'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {res.status === 'published' ? '● Published' : res.status === 'draft' ? '○ Draft' : '■ Archived'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-700">
                          {res.downloads_count}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Toggle Publish / Unpublish */}
                            {res.status === 'published' ? (
                              <button
                                onClick={() => handleStatusChange(res, 'draft')}
                                className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] transition-colors cursor-pointer"
                                title="Unpublish resource (Move to Draft)"
                              >
                                Unpublish
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(res, 'published')}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] transition-colors cursor-pointer"
                                title="Publish resource"
                              >
                                Publish
                              </button>
                            )}

                            {/* Archive */}
                            {res.status !== 'archived' && (
                              <button
                                onClick={() => handleStatusChange(res, 'archived')}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Archive"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setEditingResource(res);
                                setIsEditorOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteResource(res)}
                              className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: TEACHER REQUESTS MANAGEMENT (Priority 3) */}
        {/* =================================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="Search ref # or teacher..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={requestFilterStatus}
                  onChange={(e) => setRequestFilterStatus(e.target.value as RequestStatus | 'all')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">All Request Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Preparation</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* District Filter */}
                <select
                  value={requestFilterDistrict}
                  onChange={(e) => setRequestFilterDistrict(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">All Kerala Districts</option>
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing {filteredRequests.length} requests
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Ref #</th>
                      <th className="px-4 py-3">Teacher & School</th>
                      <th className="px-4 py-3">Class & Subject</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Private Admin Notes</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-800">
                          {req.ref_number}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-bold text-slate-900 truncate">{req.teacher_name}</p>
                          <p className="text-slate-500 text-[11px] truncate">{req.school_name} ({req.district.toUpperCase()})</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800">Class {req.class_level}</span>
                          <span className="text-slate-400 mx-1">•</span>
                          <span className="text-slate-600">{req.subject}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              req.status === 'fulfilled'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : req.status === 'in_review'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : req.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-slate-500 text-[11px]">
                          {req.admin_notes ? (
                            <span className="text-slate-700 italic">{req.admin_notes}</span>
                          ) : (
                            <span className="text-slate-400 italic">No notes added</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setIsRequestModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Review & Note
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: AUDIT LOGS */}
        {/* =================================================================== */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Privileged Operations Audit Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete immutable history of administrative actions, downloads, and status transitions.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                {auditLogs.length} Events Logged
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Actor / Email</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Entity Type</th>
                      <th className="px-4 py-3">Entity ID</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-800 font-semibold whitespace-nowrap">
                          {log.user_email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 uppercase whitespace-nowrap">
                          {log.entity_type}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {log.entity_id}
                        </td>
                        <td className="px-4 py-3 max-w-sm truncate text-slate-600 font-sans text-xs">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: SUPABASE & RLS HEALTH */}
        {/* =================================================================== */}
        {activeTab === 'supabase' && <SupabaseStatusPanel />}
      </main>

      {/* Editor Modal */}
      <ResourceEditorModal
        isOpen={isEditorOpen}
        resource={editingResource}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveResource}
      />

      {/* Request Detail Modal */}
      <RequestDetailModal
        isOpen={isRequestModalOpen}
        request={selectedRequest}
        onClose={() => setIsRequestModalOpen(false)}
        onSave={handleSaveRequest}
      />
    </div>
  );
};
