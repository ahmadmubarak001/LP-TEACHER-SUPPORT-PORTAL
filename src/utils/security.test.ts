import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateReferenceNumber,
  generateCaptchaChallenge,
  checkRateLimit,
  validateTeacherRequestPayload,
  verifyResourceDownloadEligibility,
} from './security';

test('generateReferenceNumber produces valid format', () => {
  const ref = generateReferenceNumber();
  const currentYear = new Date().getFullYear();
  assert.match(ref, new RegExp(`^LPR-${currentYear}-[0-9A-Z]{5}$`));
});

test('generateCaptchaChallenge provides valid arithmetic or GK challenge', () => {
  const challenge = generateCaptchaChallenge();
  assert.ok(challenge.id);
  assert.ok(challenge.question_en);
  assert.ok(challenge.question_ml);
  assert.equal(typeof challenge.expectedAnswer, 'number');
});

test('checkRateLimit restricts excess requests within window', () => {
  const testIp = 'test-ip-' + Math.random();
  // 3 requests allowed
  const r1 = checkRateLimit(testIp, 3, 5000);
  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 2);

  const r2 = checkRateLimit(testIp, 3, 5000);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = checkRateLimit(testIp, 3, 5000);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);

  // 4th request should be blocked
  const r4 = checkRateLimit(testIp, 3, 5000);
  assert.equal(r4.allowed, false);
  assert.equal(r4.remaining, 0);
});

test('validateTeacherRequestPayload detects invalid and bot inputs', () => {
  // Test bot honeypot detection
  const botResult = validateTeacherRequestPayload({
    teacher_name: 'Robot',
    honeypot: 'http://spam.ru',
  });
  assert.equal(botResult.valid, false);
  assert.ok(botResult.errors.honeypot);

  // Test missing required fields
  const missingResult = validateTeacherRequestPayload({
    teacher_name: 'A',
    school_name: 'B',
  });
  assert.equal(missingResult.valid, false);
  assert.ok(missingResult.errors.teacher_name);
  assert.ok(missingResult.errors.school_name);
  assert.ok(missingResult.errors.district);
  assert.ok(missingResult.errors.phone_number);

  // Test valid submission
  const validResult = validateTeacherRequestPayload({
    teacher_name: 'Anjali Nair',
    school_name: 'GLPS Kazhakoottam',
    district: 'tvm',
    phone_number: '9847123456',
    class_level: 2,
    subject: 'malayalam',
    request_type: 'lesson_plan',
    description: 'Need Class 2 unit 3 poem teaching aids and worksheets.',
    captchaAnswer: 11,
    captchaExpected: 11,
  });
  assert.equal(validResult.valid, true);
  assert.deepEqual(validResult.errors, {});
});

test('verifyResourceDownloadEligibility strictly forbids draft or archived items', () => {
  // Published resource with valid file_path should pass
  const pub = verifyResourceDownloadEligibility({
    id: 'res-1',
    status: 'published',
    file_path: 'resources/class2/malayalam_unit1.pdf',
  });
  assert.equal(pub.allowed, true);
  assert.equal(pub.statusCode, 200);

  // Draft resource must be blocked with 403 Forbidden
  const draft = verifyResourceDownloadEligibility({
    id: 'res-2',
    status: 'draft',
    file_path: 'resources/draft_exam.pdf',
  });
  assert.equal(draft.allowed, false);
  assert.equal(draft.statusCode, 403);
  assert.match(draft.error || '', /Draft or archived/);

  // Archived resource must be blocked with 403
  const archived = verifyResourceDownloadEligibility({
    id: 'res-3',
    status: 'archived',
    file_path: 'resources/old_curriculum.pdf',
  });
  assert.equal(archived.allowed, false);
  assert.equal(archived.statusCode, 403);

  // Missing resource
  const notFound = verifyResourceDownloadEligibility(null);
  assert.equal(notFound.allowed, false);
  assert.equal(notFound.statusCode, 404);
});
