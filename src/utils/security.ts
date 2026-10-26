import { Resource, TeacherRequest, CaptchaChallenge } from '../types';
import { KERALA_DISTRICTS } from '../constants/keralaData';

// Generates an official LP Teacher Portal reference number: LPR-2026-XXXXX
export function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars[randomIndex];
  }
  return `LPR-${year}-${randomPart}`;
}

// Generate bilingual Math / General knowledge CAPTCHA
export function generateCaptchaChallenge(): CaptchaChallenge {
  const challenges: CaptchaChallenge[] = [
    {
      id: 'c1',
      question_en: 'What is 4 + 7 ?',
      question_ml: '4 + 7 ന്റെ ഉത്തരം എത്രയാണ്?',
      expectedAnswer: 11,
    },
    {
      id: 'c2',
      question_en: 'How many districts are there in Kerala? (Number)',
      question_ml: 'കേരളത്തിൽ എത്ര ജില്ലകളുണ്ട്? (സംഖ്യ)',
      expectedAnswer: 14,
    },
    {
      id: 'c3',
      question_en: 'What is 15 - 6 ?',
      question_ml: '15 ൽ നിന്ന് 6 കുറച്ചാൽ എത്ര? (15 - 6)',
      expectedAnswer: 9,
    },
    {
      id: 'c4',
      question_en: 'What is 3 × 4 ?',
      question_ml: '3 × 4 ന്റെ ഗുണനഫലം എത്ര?',
      expectedAnswer: 12,
    },
    {
      id: 'c5',
      question_en: 'How many classes are in Lower Primary (LP)? (1 to 4)',
      question_ml: 'എൽ.പി വിദ്യാലയത്തിൽ എത്ര ക്ലാസുകളുണ്ട്? (1 മുതൽ 4 വരെ)',
      expectedAnswer: 4,
    },
  ];
  const idx = Math.floor(Math.random() * challenges.length);
  return challenges[idx];
}

// Rate limiting in-memory store
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInMs: windowMs,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetInMs: Math.max(0, existing.resetAt - now),
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateTeacherRequestPayload(payload: Partial<TeacherRequest> & { captchaAnswer?: number | string; captchaExpected?: number | string; honeypot?: string }): ValidationResult {
  const errors: Record<string, string> = {};

  // Honeypot check
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    errors.honeypot = 'Automated bot submission detected.';
    return { valid: false, errors };
  }

  // Teacher name
  if (!payload.teacher_name || payload.teacher_name.trim().length < 2) {
    errors.teacher_name = 'Teacher name is required (minimum 2 characters)';
  }

  // School name
  if (!payload.school_name || payload.school_name.trim().length < 3) {
    errors.school_name = 'School name is required';
  }

  // District validation (must belong to Kerala 14 districts)
  const validDistricts = KERALA_DISTRICTS.map((d) => d.id);
  if (!payload.district || !validDistricts.includes(payload.district)) {
    errors.district = 'Please select a valid Kerala district';
  }

  // Phone number (10-digit Indian standard)
  const cleanPhone = (payload.phone_number || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length !== 10) {
    errors.phone_number = 'A valid 10-digit mobile number is required';
  }

  // Class level (1 to 4)
  if (!payload.class_level || payload.class_level < 1 || payload.class_level > 4) {
    errors.class_level = 'Class level must be between 1 and 4';
  }

  // Subject
  if (!payload.subject) {
    errors.subject = 'Subject selection is required';
  }

  // Request type
  if (!payload.request_type) {
    errors.request_type = 'Resource type is required';
  }

  // Description
  if (!payload.description || payload.description.trim().length < 10) {
    errors.description = 'Please describe the required resource in at least 10 characters';
  }

  // CAPTCHA verification
  if (payload.captchaExpected !== undefined && payload.captchaAnswer !== undefined) {
    const ans = Number(payload.captchaAnswer);
    const exp = Number(payload.captchaExpected);
    if (isNaN(ans) || ans !== exp) {
      errors.captcha = 'Incorrect verification answer. Please solve the simple challenge.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Strict public download validation:
// Storage bucket is private; public users can ONLY download published resources
export function verifyResourceDownloadEligibility(resource: Pick<Resource, 'id' | 'status' | 'file_path'> | null | undefined): {
  allowed: boolean;
  statusCode: number;
  error?: string;
} {
  if (!resource) {
    return {
      allowed: false,
      statusCode: 404,
      error: 'Resource not found or has been removed.',
    };
  }

  if (resource.status !== 'published') {
    return {
      allowed: false,
      statusCode: 403,
      error: 'Access denied: Draft or archived materials cannot be downloaded by the public.',
    };
  }

  if (!resource.file_path) {
    return {
      allowed: false,
      statusCode: 404,
      error: 'Resource file is not configured.',
    };
  }

  return {
    allowed: true,
    statusCode: 200,
  };
}
