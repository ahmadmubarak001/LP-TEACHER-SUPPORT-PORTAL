export type Language = 'ml' | 'en';

export type ClassLevel = 1 | 2 | 3 | 4;

export type Subject = 
  | 'malayalam'
  | 'english'
  | 'mathematics'
  | 'environmental_studies'
  | 'arts_crafts'
  | 'physical_education'
  | 'ict'
  | 'general';

export type ResourceType = 
  | 'lesson_plan'
  | 'worksheet'
  | 'question_paper'
  | 'teaching_aid'
  | 'audio_visual'
  | 'handbook'
  | 'activity_card';

export type ResourceStatus = 'draft' | 'published' | 'archived';

export interface Resource {
  id: string;
  title_ml: string;
  title_en: string;
  description_ml: string;
  description_en: string;
  class_level: ClassLevel;
  subject: Subject;
  resource_type: ResourceType;
  file_path: string;
  file_size: string;
  file_format: string; // 'PDF' | 'DOCX' | 'MP4' | 'ZIP'
  status: ResourceStatus;
  downloads_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type RequestStatus = 'pending' | 'in_review' | 'fulfilled' | 'rejected';

export interface TeacherRequest {
  id: string;
  ref_number: string;
  teacher_name: string;
  school_name: string;
  district: string;
  phone_number: string;
  email: string;
  class_level: ClassLevel;
  subject: Subject;
  request_type: ResourceType;
  description: string;
  status: RequestStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_email: string;
  user_role: string;
  action: string;
  entity_type: 'resource' | 'teacher_request' | 'system' | 'auth';
  entity_id: string;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'teacher';
  full_name: string;
  school_name?: string;
  created_at: string;
}

export interface CaptchaChallenge {
  id: string;
  question_ml: string;
  question_en: string;
  expectedAnswer: number;
}
