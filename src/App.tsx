/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ResourceCatalog } from './components/ResourceCatalog';
import { DownloadModal } from './components/DownloadModal';
import { TeacherRequestModal } from './components/TeacherRequestModal';
import { TrackRequestModal } from './components/TrackRequestModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { localStore } from './lib/supabaseClient';
import { Resource, ClassLevel, Subject, ResourceType } from './types';
import { ShieldCheck, Heart, ExternalLink, HelpCircle } from 'lucide-react';

function PortalContent() {
  const { lang, t } = useLanguage();
  const { isAdmin } = useAuth();

  // Navigation & View State
  const [currentView, setCurrentView] = useState<'portal' | 'admin'>('portal');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassLevel | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');

  // Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [downloadingResource, setDownloadingResource] = useState<Resource | null>(null);

  // Resources Data (Public only sees published; Admins can see all if in admin mode)
  const [resources, setResources] = useState<Resource[]>(() =>
    localStore.getResources(isAdmin && currentView === 'admin')
  );

  const refreshData = () => {
    setResources(localStore.getResources(isAdmin && currentView === 'admin'));
  };

  useEffect(() => {
    refreshData();
  }, [isAdmin, currentView]);

  // Public Catalog Filtering
  const filteredCatalog = resources.filter((r) => {
    // Only published for public catalog
    if (!isAdmin && r.status !== 'published') return false;

    if (selectedClass !== 'all' && r.class_level !== selectedClass) return false;
    if (selectedSubject !== 'all' && r.subject !== selectedSubject) return false;
    if (selectedType !== 'all' && r.resource_type !== selectedType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitleEn = r.title_en.toLowerCase().includes(q);
      const matchTitleMl = r.title_ml.toLowerCase().includes(q);
      const matchDescEn = r.description_en.toLowerCase().includes(q);
      const matchDescMl = r.description_ml.toLowerCase().includes(q);
      const matchSubject = r.subject.toLowerCase().includes(q);
      if (!matchTitleEn && !matchTitleMl && !matchDescEn && !matchDescMl && !matchSubject) {
        return false;
      }
    }
    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClass('all');
    setSelectedSubject('all');
    setSelectedType('all');
  };

  // Stats calculation
  const allDbResources = localStore.getResources(true);
  const totalPublished = allDbResources.filter((r) => r.status === 'published').length;
  const totalDownloads = allDbResources.reduce((acc, curr) => acc + (curr.downloads_count || 0), 0);
  const totalRequests = localStore.getTeacherRequests().length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        onOpenRequestModal={() => setIsRequestModalOpen(true)}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content Router */}
      {currentView === 'admin' && isAdmin ? (
        <AdminDashboard
          onBackToPortal={() => setCurrentView('portal')}
          onRefreshData={refreshData}
        />
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            onOpenRequestModal={() => setIsRequestModalOpen(true)}
            stats={{
              totalPublished,
              totalDownloads,
              totalRequests,
            }}
          />

          {/* Catalog Section */}
          <ResourceCatalog
            resources={filteredCatalog}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            searchQuery={searchQuery}
            onClearFilters={clearFilters}
            onDownload={(resource) => setDownloadingResource(resource)}
            isAdmin={isAdmin}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800 text-xs">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            {/* Column 1: Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-white text-sm font-gayathri">
                  {lang === 'ml' ? 'കേരള എൽ.പി അധ്യാപക സഹായി' : 'LP Teacher Support Portal'}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {lang === 'ml'
                  ? 'കേരളത്തിലെ പൊതുവിദ്യാലയങ്ങളിലെ ഒന്ന് മുതൽ നാല് വരെയുള്ള ക്ലാസുകളിലെ അധ്യാപകർക്കായി തയ്യാറാക്കിയ ഔദ്യോഗിക സഹായ പോർട്ടൽ.'
                  : 'Curriculum resources, worksheets, lesson plans, and teaching learning materials (TLMs) for Kerala Lower Primary schools.'}
              </p>
            </div>

            {/* Column 2: Classes */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                {lang === 'ml' ? 'ക്ലാസുകൾ' : 'Classes'}
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => setSelectedClass(1)} className="hover:text-emerald-400 transition-colors cursor-pointer">
                    {lang === 'ml' ? 'ക്ലാസ് 1 (Class 1)' : 'Class 1 - Foundation Stage'}
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedClass(2)} className="hover:text-emerald-400 transition-colors cursor-pointer">
                    {lang === 'ml' ? 'ക്ലാസ് 2 (Class 2)' : 'Class 2 - Early Numeracy & Reading'}
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedClass(3)} className="hover:text-emerald-400 transition-colors cursor-pointer">
                    {lang === 'ml' ? 'ക്ലാസ് 3 (Class 3)' : 'Class 3 - Environmental Studies'}
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedClass(4)} className="hover:text-emerald-400 transition-colors cursor-pointer">
                    {lang === 'ml' ? 'ക്ലാസ് 4 (Class 4)' : 'Class 4 - Advanced Primary Concepts'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                {lang === 'ml' ? 'പ്രധാന ലിങ്കുകൾ' : 'Portal Services'}
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => setIsRequestModalOpen(true)} className="hover:text-emerald-400 transition-colors cursor-pointer">
                    {t('requestResource')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsTrackModalOpen(true)} className="hover:text-emerald-400 transition-colors cursor-pointer">
                    {t('trackRequest')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsAdminLoginOpen(true)} className="hover:text-emerald-400 transition-colors cursor-pointer">
                    {t('adminLogin')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Security & Compliance */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                Security & Compliance
              </h4>
              <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Supabase Row-Level Security</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Private cloud storage with 60-second HMAC signed URLs. Public admin registration strictly blocked.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p>
              © {new Date().getFullYear()} State Council of Educational Research and Training (SCERT), Kerala. All rights reserved.
            </p>
            <p className="flex items-center space-x-1">
              <span>Dedicated to Kerala Primary Educators</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DownloadModal
        resource={downloadingResource}
        onClose={() => setDownloadingResource(null)}
        onDownloadSuccess={() => refreshData()}
      />

      <TeacherRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onRequestSubmitted={() => refreshData()}
      />

      <TrackRequestModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          refreshData();
          setCurrentView('admin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PortalContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
