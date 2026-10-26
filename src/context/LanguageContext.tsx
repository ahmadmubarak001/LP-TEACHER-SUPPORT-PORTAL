import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; ml: string }> = {
  // Navigation & Branding
  portalTitle: {
    en: 'LP Teacher Support Portal',
    ml: 'കേരള എൽ.പി അധ്യാപക സഹായി',
  },
  portalSubtitle: {
    en: 'Kerala General Education Department | LP Schools (Class 1-4)',
    ml: 'പൊതുവിദ്യാഭ്യാസ വകുപ്പ്, കേരളം | എൽ.പി വിദ്യാലയങ്ങൾ (ക്ലാസ് 1-4)',
  },
  requestResource: {
    en: 'Request Resource',
    ml: 'വിഭവം ആവശ്യപ്പെടുക',
  },
  trackRequest: {
    en: 'Track Request',
    ml: 'അപേക്ഷ പരിശോധിക്കുക',
  },
  adminLogin: {
    en: 'Admin Login',
    ml: 'അഡ്മിൻ ലോഗിൻ',
  },
  adminDashboard: {
    en: 'Admin Dashboard',
    ml: 'അഡ്മിൻ ഡാഷ്‌ബോർഡ്',
  },
  logout: {
    en: 'Logout',
    ml: 'ലോഗ് ഔട്ട്',
  },

  // Hero Section
  heroTitle: {
    en: 'Empowering Kerala LP Teachers with Quality Curriculum Resources',
    ml: 'കേരളത്തിലെ എൽ.പി അധ്യാപകർക്കായി മികച്ച പാഠ്യ-ബോധന സാമഗ്രികൾ',
  },
  heroSubtitle: {
    en: 'Access verified lesson plans, interactive worksheets, question pools, and TLMs for Classes 1 to 4 in Malayalam and English medium.',
    ml: 'ഒന്ന് മുതൽ നാല് വരെയുള്ള ക്ലാസുകളിലെ പാഠാസൂത്രണങ്ങൾ, വർക്ക്ഷീറ്റുകൾ, മൂല്യനിർണ്ണയ സഹായികൾ, പഠനോപകരണങ്ങൾ എന്നിവ എളുപ്പത്തിൽ ഡൗൺലോഡ് ചെയ്യാം.',
  },
  searchPlaceholder: {
    en: 'Search by lesson name, topic, or keyword (English or മലയാളം)...',
    ml: 'പാഠഭാഗം, വിഷയം അല്ലെങ്കിൽ കീവേഡ് വഴി തിരയുക (മലയാളം അല്ലെങ്കിൽ English)...',
  },
  allClasses: {
    en: 'All Classes',
    ml: 'എല്ലാ ക്ലാസുകളും',
  },
  allSubjects: {
    en: 'All Subjects',
    ml: 'എല്ലാ വിഷയങ്ങളും',
  },
  allTypes: {
    en: 'All Types',
    ml: 'എല്ലാ സാമഗ്രികളും',
  },

  // Stats
  statResources: {
    en: 'Published Resources',
    ml: 'ലഭ്യമായ വിഭവങ്ങൾ',
  },
  statDownloads: {
    en: 'Secure Downloads',
    ml: 'ഡൗൺലോഡുകൾ',
  },
  statRequests: {
    en: 'Teacher Requests',
    ml: 'അധ്യാപക ആവശ്യങ്ങൾ',
  },
  statDistricts: {
    en: 'Kerala Districts',
    ml: 'കേരള ജില്ലകൾ',
  },

  // Resources
  download: {
    en: 'Download Resource',
    ml: 'ഡൗൺലോഡ് ചെയ്യുക',
  },
  previewOnly: {
    en: 'Private / Draft',
    ml: 'കരട് രൂപം (ലഭ്യമല്ല)',
  },
  downloadsCount: {
    en: 'downloads',
    ml: 'ഡൗൺലോഡുകൾ',
  },
  filterBySubject: {
    en: 'Filter by Subject',
    ml: 'വിഷയം തിരഞ്ഞെടുക്കുക',
  },
  filterByClass: {
    en: 'Filter by Class',
    ml: 'ക്ലാസ് തിരഞ്ഞെടുക്കുക',
  },
  filterByType: {
    en: 'Resource Category',
    ml: 'വിഭവ തരം',
  },
  noResourcesFound: {
    en: 'No resources match your filter criteria.',
    ml: 'നിങ്ങൾ തിരഞ്ഞ മാനദണ്ഡങ്ങൾക്കൊത്ത വിഭവങ്ങൾ കണ്ടെത്തിയില്ല.',
  },
  clearFilters: {
    en: 'Reset Filters',
    ml: 'ഫിൽട്ടറുകൾ ഒഴിവാക്കുക',
  },

  // Teacher Request Modal
  requestFormTitle: {
    en: 'Submit Teacher Resource Need',
    ml: 'പുതിയ പാഠ്യസാമഗ്രിക്കായി അപേക്ഷിക്കുക',
  },
  requestFormSubtitle: {
    en: 'Kerala Lower Primary school teachers can request specific worksheets, lesson plans, or teaching aids.',
    ml: 'നിങ്ങളുടെ സ്കൂളിലെ ക്ലാസ്റൂം പ്രവർത്തനങ്ങൾക്ക് ആവശ്യമായ പാഠ്യസാമഗ്രികൾ ഇവിടെ ആവശ്യപ്പെടാം. വിഭവ സമിതി ഇത് തയ്യാറാക്കി പോർട്ടലിൽ ലഭ്യമാക്കും.',
  },
  teacherName: {
    en: 'Teacher Name',
    ml: 'അധ്യാപകന്റെ / അധ്യാപികയുടെ പേര്',
  },
  schoolName: {
    en: 'School Name (e.g. GLPS, AMLPS)',
    ml: 'വിദ്യാലയത്തിന്റെ പേര്',
  },
  district: {
    en: 'District',
    ml: 'ജില്ല',
  },
  phoneNumber: {
    en: 'Mobile Number (for reference SMS/verification)',
    ml: 'മൊബൈൽ നമ്പർ',
  },
  email: {
    en: 'Email Address (optional)',
    ml: 'ഇമെയിൽ വിലാസം (ആവശ്യമെങ്കിൽ)',
  },
  classLevel: {
    en: 'Class Level',
    ml: 'ക്ലാസ്',
  },
  subject: {
    en: 'Subject',
    ml: 'വിഷയം',
  },
  resourceTypeNeeded: {
    en: 'Required Resource Type',
    ml: 'ആവശ്യമായ വിഭവത്തിന്റെ തരം',
  },
  detailedDescription: {
    en: 'Detailed Description of Requirement',
    ml: 'ആവശ്യത്തിന്റെ വിശദ വിവരങ്ങൾ (പാഠഭാഗം, യൂണിറ്റ്, പ്രത്യേകതകൾ)',
  },
  securityChallenge: {
    en: 'Verification Challenge (Anti-Spam)',
    ml: 'പരിശോധന ചോദ്യം (സ്പാം തടയാൻ)',
  },
  submitRequest: {
    en: 'Submit Request',
    ml: 'അപേക്ഷ സമർപ്പിക്കുക',
  },
  submitting: {
    en: 'Submitting securely...',
    ml: 'സമർപ്പിക്കുന്നു...',
  },

  // Status Labels
  statusPending: {
    en: 'Pending Review',
    ml: 'പരിഗണനയിൽ',
  },
  statusInReview: {
    en: 'In Preparation',
    ml: 'തയ്യാറാക്കുന്നു',
  },
  statusFulfilled: {
    en: 'Fulfilled & Published',
    ml: 'ലഭ്യമാക്കി',
  },
  statusRejected: {
    en: 'Cannot Process',
    ml: 'നിരസിച്ചു',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ml'); // Default to Malayalam for authentic Kerala LP context

  useEffect(() => {
    const saved = localStorage.getItem('lp_portal_lang') as Language;
    if (saved === 'ml' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lp_portal_lang', newLang);
  };

  const toggleLang = () => {
    const nextLang = lang === 'ml' ? 'en' : 'ml';
    setLang(nextLang);
  };

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[lang] || item.en || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
