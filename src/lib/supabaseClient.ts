import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resource, TeacherRequest, AuditLog, UserProfile } from '../types';

// Client-safe environment variable lookup (works in both Vite client and Node/tsx environments)
function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch {
    // fallback
  }
  return undefined;
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('...')
);

export const supabase: SupabaseClient | null = (isLiveSupabaseConfigured && supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Initial deterministic seed data representing authentic Kerala Lower Primary resources
const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-lp-01',
    title_ml: 'ക്ലാസ് 1 മലയാളം: കളിയും കാര്യവും - പാഠാസൂത്രണം (യൂണിറ്റ് 1)',
    title_en: 'Class 1 Malayalam: Fun & Learning - Lesson Plan (Unit 1)',
    description_ml: 'ഒന്നാം ക്ലാസിലെ ആദ്യ ആഴ്ചകളിലെ അക്ഷരപരിചയം, ശബ്ദവ്യത്യാസം എന്നിവ കുട്ടികളിലേക്ക് എത്തിക്കാനുള്ള കളികൾ ചേർത്ത പാഠാസൂത്രണം.',
    description_en: 'Introductory letter recognition and phonics lesson plan with playful classroom activities for Class 1 Malayalam.',
    class_level: 1,
    subject: 'malayalam',
    resource_type: 'lesson_plan',
    file_path: 'class1/malayalam_unit1_lesson_plan.pdf',
    file_size: '2.4 MB',
    file_format: 'PDF',
    status: 'published',
    downloads_count: 142,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'res-lp-02',
    title_ml: 'ക്ലാസ് 1 ഗണിതം: എണ്ണാം കണ്ടെത്താം - വർക്ക്ഷീറ്റ്',
    title_en: 'Class 1 Mathematics: Count & Find - Interactive Worksheet',
    description_ml: '1 മുതൽ 9 വരെയുള്ള സംഖ്യകൾ ചിത്രങ്ങളിലൂടെ എണ്ണി തിട്ടപ്പെടുത്താനും എഴുതാനുമുള്ള കളർ വർക്ക്ഷീറ്റ്.',
    description_en: 'Illustrated counting worksheets for numbers 1 to 9 with visual cues and trace cards for young learners.',
    class_level: 1,
    subject: 'mathematics',
    resource_type: 'worksheet',
    file_path: 'class1/maths_counting_worksheet.pdf',
    file_size: '1.8 MB',
    file_format: 'PDF',
    status: 'published',
    downloads_count: 98,
    created_at: '2026-09-05T11:30:00Z',
    updated_at: '2026-09-05T11:30:00Z',
  },
  {
    id: 'res-lp-03',
    title_ml: 'ക്ലാസ് 2 മലയാളം: പൂമ്പാറ്റ - കവിതാ ആസ്വാദന സഹായി',
    title_en: 'Class 2 Malayalam: The Butterfly - Poetry Appreciation & TLM',
    description_ml: 'രണ്ടാം ക്ലാസിലെ പൂമ്പാറ്റ എന്ന കവിത കുട്ടികളിൽ ഭാവഗീതമാക്കാനുള്ള ഈണവും ചിത്രകാർഡുകളും അടങ്ങിയ ടീച്ചിങ് എയ്ഡ്.',
    description_en: 'Musical notations, flashcards, and rhyme-based teaching aids for Class 2 poem on butterflies.',
    class_level: 2,
    subject: 'malayalam',
    resource_type: 'teaching_aid',
    file_path: 'class2/malayalam_butterfly_tlm.pdf',
    file_size: '3.1 MB',
    file_format: 'PDF',
    status: 'published',
    downloads_count: 215,
    created_at: '2026-09-12T09:15:00Z',
    updated_at: '2026-09-12T09:15:00Z',
  },
  {
    id: 'res-lp-04',
    title_ml: 'ക്ലാസ് 2 ഇംഗ്ലീഷ്: Phonics & Sight Words Flashcards',
    title_en: 'Class 2 English: Phonics & Sight Words Flashcards Pack',
    description_ml: 'രണ്ടാം ക്ലാസിലെ ലഘുവാക്യങ്ങൾ വായിക്കാൻ സഹായിക്കുന്ന 50 സൈറ്റ് വേഡ് കാർഡുകളും ഫൊണിക്‌സ് ഉച്ചാരണ സഹായിയും.',
    description_en: 'Set of 50 printable flashcards for sight words and early phonics blends tailored for Kerala state syllabus.',
    class_level: 2,
    subject: 'english',
    resource_type: 'activity_card',
    file_path: 'class2/english_sight_words.pdf',
    file_size: '4.5 MB',
    file_format: 'PDF',
    status: 'published',
    downloads_count: 178,
    created_at: '2026-09-18T14:20:00Z',
    updated_at: '2026-09-18T14:20:00Z',
  },
  {
    id: 'res-lp-05',
    title_ml: 'ക്ലാസ് 3 പരിസരപഠനം: പ്രകൃതിയിലെ വിസ്മയങ്ങൾ - ഡിജിറ്റൽ പ്രസന്റേഷൻ',
    title_en: 'Class 3 EVS: Wonders of Nature - Interactive Teaching Aid',
    description_ml: 'ചെടികളുടെ വളർച്ച, പൂക്കളുടെ ഭാഗങ്ങൾ, വിത്തുവിതരണം എന്നിവ വിശദമാക്കുന്ന മനോഹരമായ ചിത്രങ്ങളോടെയുള്ള അവതരണം.',
    description_en: 'Visual slides covering plant life cycles, seed dispersal, and neighborhood biodiversity for Class 3 EVS.',
    class_level: 3,
    subject: 'environmental_studies',
    resource_type: 'teaching_aid',
    file_path: 'class3/evs_plants_nature.pdf',
    file_size: '5.2 MB',
    file_format: 'PDF',
    status: 'published',
    downloads_count: 310,
    created_at: '2026-09-22T08:00:00Z',
    updated_at: '2026-09-22T08:00:00Z',
  },
  {
    id: 'res-lp-06',
    title_ml: 'ക്ലാസ് 3 ഗണിതം: ഗുണനപ്പട്ടിക എളുപ്പവഴികൾ - വർക്ക്ഷീറ്റ്',
    title_en: 'Class 3 Maths: Multiplication Tables Fun Tricks Worksheet',
    description_ml: 'കൂട്ടിച്ചേർക്കലിൽ നിന്ന് ഗുണനത്തിലേക്ക് കുട്ടികളെ നയിക്കുന്ന ഗ്രൂപ്പിംഗ് പരിശീലന വർക്ക്ഷീറ്റുകൾ.',
    description_en: 'Visual pattern-based worksheets transforming repeated addition into multiplication understanding.',
    class_level: 3,
    subject: 'mathematics',
    resource_type: 'worksheet',
    file_path: 'class3/maths_multiplication_sheet.pdf',
    file_size: '1.5 MB',
    file_format: 'PDF',
    status: 'published',
    downloads_count: 260,
    created_at: '2026-09-25T11:00:00Z',
    updated_at: '2026-09-25T11:00:00Z',
  },
  {
    id: 'res-lp-07',
    title_ml: 'ക്ലാസ് 4 പരിസരപഠനം: കേരളം - നമ്മുടെ നാട് ഭൂപട പഠന സഹായി',
    title_en: 'Class 4 EVS: Kerala - Our Homeland Geography Map Guide',
    description_ml: '14 ജില്ലകൾ, നദികൾ, പർവതനിരകൾ എന്നിവ കുട്ടികൾക്ക് ലളിതമായി മനസ്സിലാക്കാനുള്ള ഭൂപട സഹായിയും കളർ ചാർട്ടുകളും.',
    description_en: 'Child-friendly outline maps, district charts, and river flow infographics for Class 4 Kerala studies.',
    class_level: 4,
    subject: 'environmental_studies',
    resource_type: 'handbook',
    file_path: 'class4/evs_kerala_map_guide.pdf',
    file_size: '6.8 MB',
    file_format: 'PDF',
    status: 'published',
    downloads_count: 420,
    created_at: '2026-10-02T13:45:00Z',
    updated_at: '2026-10-02T13:45:00Z',
  },
  {
    id: 'res-lp-08',
    title_ml: 'ക്ലാസ് 4 ഗണിതം: രണ്ടാം ടേം മൂല്യനിർണ്ണയ ചോദ്യപേപ്പർ മാതൃക (കരട്)',
    title_en: 'Class 4 Mathematics: Term 2 Model Question Paper (DRAFT)',
    description_ml: 'ടേം 2 പരീക്ഷയ്ക്കുള്ള മാതൃകാ ചോദ്യശേഖരം - അധ്യാപക സമിതിയുടെ പരിശോധനയ്ക്കായി തയ്യാറാക്കിയ കരട് രൂപം.',
    description_en: 'Draft model question pool undergoing curriculum committee review. Not yet cleared for public download.',
    class_level: 4,
    subject: 'mathematics',
    resource_type: 'question_paper',
    file_path: 'class4/draft_term2_maths_questions.pdf',
    file_size: '1.1 MB',
    file_format: 'PDF',
    status: 'draft', // DRAFT - MUST NEVER BE DOWNLOADABLE BY PUBLIC!
    downloads_count: 0,
    created_at: '2026-10-15T16:00:00Z',
    updated_at: '2026-10-15T16:00:00Z',
  },
  {
    id: 'res-lp-09',
    title_ml: 'ക്ലാസ് 1 കല & കായികം: നാടൻ പാട്ടുകളും ആംഗ്യപ്പാട്ടുകളും (കരട് ശേഖരം)',
    title_en: 'Class 1 Arts & PE: Traditional Rhymes & Action Songs (DRAFT)',
    description_ml: 'ഒന്നാം ക്ലാസിലെ കായിക പാഠങ്ങൾക്കായുള്ള നാടൻ പാട്ടുകളുടെ ശേഖരം - ഓഡിയോ റെക്കോർഡിംഗ് അപൂർണ്ണമാണ്.',
    description_en: 'Internal draft compendium of Kerala folk rhymes for primary motor skills and circle time.',
    class_level: 1,
    subject: 'arts_crafts',
    resource_type: 'audio_visual',
    file_path: 'class1/draft_action_songs.pdf',
    file_size: '2.0 MB',
    file_format: 'PDF',
    status: 'draft', // DRAFT
    downloads_count: 0,
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'res-lp-10',
    title_ml: 'ക്ലാസ് 2 പഴയ പാഠപുസ്തക സഹായി 2024 (ആർക്കൈവ് ചെയ്തത്)',
    title_en: 'Class 2 Previous Curriculum Guide 2024 (ARCHIVED)',
    description_ml: 'കഴിഞ്ഞ വർഷത്തെ പാഠ്യപദ്ധതി പ്രകാരമുള്ള അധ്യാപക സഹായി - റഫറൻസിനായി മാത്രം ആർക്കൈവ് ചെയ്തത്.',
    description_en: 'Superseded curriculum handbook preserved in administrative archives only.',
    class_level: 2,
    subject: 'general',
    resource_type: 'handbook',
    file_path: 'archive/2024_class2_handbook.pdf',
    file_size: '3.8 MB',
    file_format: 'PDF',
    status: 'archived', // ARCHIVED
    downloads_count: 85,
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2026-05-01T10:00:00Z',
  },
];

const INITIAL_REQUESTS: TeacherRequest[] = [
  {
    id: 'req-01',
    ref_number: 'LPR-2026-7K2M9',
    teacher_name: 'രമ്യ കെ.വി (Remya K.V)',
    school_name: 'ഗവ. എൽ.പി സ്കൂൾ, നീലേശ്വരം',
    district: 'ksd',
    phone_number: '9447102938',
    email: 'remya.kv@school.kerala.gov.in',
    class_level: 1,
    subject: 'malayalam',
    request_type: 'teaching_aid',
    description: 'ഒന്നാം ക്ലാസിലെ വള്ളി, പുള്ളി ചിഹ്നങ്ങൾ കുട്ടികൾക്ക് എളുപ്പത്തിൽ പഠിക്കാൻ പറ്റിയ കാർഡുകളും വലിയ അക്ഷര ചാർട്ടുകളും ആവശ്യമുണ്ട്.',
    status: 'in_review',
    admin_notes: 'DIET Kasaragod resource group contacted. Shared preview draft on Oct 24.',
    created_at: '2026-10-22T08:30:00Z',
    updated_at: '2026-10-24T11:00:00Z',
  },
  {
    id: 'req-02',
    ref_number: 'LPR-2026-3P8X1',
    teacher_name: 'മനോജ് കുമാർ (Manoj Kumar)',
    school_name: 'എ.എം.എൽ.പി.എസ് മങ്കട',
    district: 'mlp',
    phone_number: '9847291038',
    email: 'manoj.mankada@gmail.com',
    class_level: 3,
    subject: 'mathematics',
    request_type: 'worksheet',
    description: 'ഭിന്നസംഖ്യകൾ (Fractions) കുട്ടികളിലേക്ക് ലളിതമായി എത്തിക്കാൻ പിസ / ദോശ ചിത്രങ്ങളോടെയുള്ള വർക്ക്ഷീറ്റുകൾ ലഭ്യമാക്കുമോ?',
    status: 'fulfilled',
    admin_notes: 'Class 3 Fractions worksheet published under res-lp-06 series. Notified teacher via SMS.',
    created_at: '2026-10-18T14:15:00Z',
    updated_at: '2026-10-21T16:45:00Z',
  },
  {
    id: 'req-03',
    ref_number: 'LPR-2026-9W4N2',
    teacher_name: 'ഫാത്തിമ സുഹറ (Fathima Suhara)',
    school_name: 'ജി.എൽ.പി.എസ് ചാത്തന്നൂർ',
    district: 'klm',
    phone_number: '9744883321',
    email: 'fathima.chathannoor@gmail.com',
    class_level: 4,
    subject: 'english',
    request_type: 'lesson_plan',
    description: 'Unit 4 "The Brave Little Tailor" skit script and action oriented lesson plan for Class 4 English.',
    status: 'pending',
    admin_notes: '',
    created_at: '2026-10-25T09:10:00Z',
    updated_at: '2026-10-25T09:10:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-01',
    user_email: 'admin.scert@kerala.gov.in',
    user_role: 'admin',
    action: 'RESOURCE_PUBLISHED',
    entity_type: 'resource',
    entity_id: 'res-lp-07',
    details: { title: 'Class 4 EVS: Kerala Map Guide', previous_status: 'draft', new_status: 'published' },
    created_at: '2026-10-02T13:45:00Z',
  },
  {
    id: 'audit-02',
    user_email: 'admin.scert@kerala.gov.in',
    user_role: 'admin',
    action: 'REQUEST_STATUS_UPDATED',
    entity_type: 'teacher_request',
    entity_id: 'req-02',
    details: { ref_number: 'LPR-2026-3P8X1', previous_status: 'in_review', new_status: 'fulfilled', note: 'Worksheet uploaded' },
    created_at: '2026-10-21T16:45:00Z',
  },
  {
    id: 'audit-03',
    user_email: 'admin.scert@kerala.gov.in',
    user_role: 'admin',
    action: 'REQUEST_IN_REVIEW',
    entity_type: 'teacher_request',
    entity_id: 'req-01',
    details: { ref_number: 'LPR-2026-7K2M9', note: 'DIET Kasaragod resource group contacted' },
    created_at: '2026-10-24T11:00:00Z',
  },
];

// Persistent state wrapper for local session/demo fallback
class LocalStorageDataStore {
  private resources: Resource[];
  private requests: TeacherRequest[];
  private auditLogs: AuditLog[];

  constructor() {
    this.resources = [...INITIAL_RESOURCES];
    this.requests = [...INITIAL_REQUESTS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const savedRes = localStorage.getItem('lp_resources');
      if (savedRes) this.resources = JSON.parse(savedRes);

      const savedReq = localStorage.getItem('lp_teacher_requests');
      if (savedReq) this.requests = JSON.parse(savedReq);

      const savedLogs = localStorage.getItem('lp_audit_logs');
      if (savedLogs) this.auditLogs = JSON.parse(savedLogs);
    } catch {
      // ignore storage errors
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('lp_resources', JSON.stringify(this.resources));
      localStorage.setItem('lp_teacher_requests', JSON.stringify(this.requests));
      localStorage.setItem('lp_audit_logs', JSON.stringify(this.auditLogs));
    } catch {
      // ignore
    }
  }

  getResources(includeNonPublished = false): Resource[] {
    if (includeNonPublished) {
      return [...this.resources];
    }
    // Strict RLS emulation: anonymous & public can ONLY get published resources
    return this.resources.filter((r) => r.status === 'published');
  }

  getResourceById(id: string): Resource | undefined {
    return this.resources.find((r) => r.id === id);
  }

  createResource(resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'downloads_count'>): Resource {
    const newRes: Resource = {
      ...resourceData,
      id: 'res-' + Date.now().toString(36),
      downloads_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.resources.unshift(newRes);
    this.persist();
    return newRes;
  }

  updateResource(id: string, updates: Partial<Resource>): Resource | null {
    const index = this.resources.findIndex((r) => r.id === id);
    if (index === -1) return null;
    this.resources[index] = {
      ...this.resources[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.resources[index];
  }

  deleteResource(id: string): boolean {
    const beforeLen = this.resources.length;
    this.resources = this.resources.filter((r) => r.id !== id);
    this.persist();
    return this.resources.length < beforeLen;
  }

  incrementDownloadCount(id: string): void {
    const res = this.resources.find((r) => r.id === id);
    if (res) {
      res.downloads_count += 1;
      this.persist();
    }
  }

  getTeacherRequests(): TeacherRequest[] {
    return [...this.requests];
  }

  createTeacherRequest(reqData: Omit<TeacherRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'admin_notes'>): TeacherRequest {
    const newReq: TeacherRequest = {
      ...reqData,
      id: 'req-' + Date.now().toString(36),
      status: 'pending',
      admin_notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.requests.unshift(newReq);
    this.persist();
    return newReq;
  }

  updateTeacherRequestStatus(id: string, status: TeacherRequest['status'], adminNotes?: string): TeacherRequest | null {
    const req = this.requests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    if (adminNotes !== undefined) req.admin_notes = adminNotes;
    req.updated_at = new Date().toISOString();
    this.persist();
    return req;
  }

  findRequestByRefAndPhone(ref: string, phone: string): TeacherRequest | null {
    const cleanPhone = phone.replace(/\D/g, '');
    const found = this.requests.find(
      (r) => r.ref_number.trim().toUpperCase() === ref.trim().toUpperCase() &&
             r.phone_number.replace(/\D/g, '') === cleanPhone
    );
    if (!found) return null;
    // Do not return internal admin notes to the public user
    return {
      ...found,
      admin_notes: found.status === 'fulfilled' ? 'Resource prepared and published.' : '',
    };
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  addAuditLog(entry: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const newLog: AuditLog = {
      ...entry,
      id: 'audit-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    this.persist();
    return newLog;
  }

  resetToDefaults(): void {
    this.resources = [...INITIAL_RESOURCES];
    this.requests = [...INITIAL_REQUESTS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.persist();
  }
}

export const localStore = new LocalStorageDataStore();
