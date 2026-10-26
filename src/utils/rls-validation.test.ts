import test from 'node:test';
import assert from 'node:assert/strict';
import { localStore } from '../lib/supabaseClient';
import { verifyResourceDownloadEligibility } from './security';

test('RLS Policy: Anonymous users can only query published resources', () => {
  const publicView = localStore.getResources(false);
  const allResources = localStore.getResources(true);

  // Assert all returned items in public view have status === 'published'
  for (const item of publicView) {
    assert.equal(item.status, 'published', `Resource ${item.id} should be published`);
  }

  // Assert drafts exist in full DB but are omitted from public view
  const draftsInDb = allResources.filter((r) => r.status === 'draft');
  assert.ok(draftsInDb.length > 0, 'Database should contain draft resources');

  for (const draft of draftsInDb) {
    const leaked = publicView.some((p) => p.id === draft.id);
    assert.equal(leaked, false, `Draft resource ${draft.id} must NOT be visible to public`);
  }
});

test('RLS Policy: Admin users can inspect draft, archived, and published resources', () => {
  const adminView = localStore.getResources(true);
  const statuses = new Set(adminView.map((r) => r.status));

  assert.ok(statuses.has('published'), 'Admin can see published');
  assert.ok(statuses.has('draft'), 'Admin can see drafts');
  assert.ok(statuses.has('archived'), 'Admin can see archived');
});

test('Priority 2 Storage Security: Direct download verification rejects draft resources', () => {
  const allResources = localStore.getResources(true);
  const draft = allResources.find((r) => r.status === 'draft');
  assert.ok(draft, 'Draft resource must exist for test');

  const result = verifyResourceDownloadEligibility(draft);
  assert.equal(result.allowed, false, 'Draft download must be disallowed');
  assert.equal(result.statusCode, 403, 'Draft download must return 403 Forbidden');
});

test('Priority 2 Storage Security: Published resource download verification succeeds', () => {
  const allResources = localStore.getResources(true);
  const published = allResources.find((r) => r.status === 'published');
  assert.ok(published, 'Published resource must exist for test');

  const result = verifyResourceDownloadEligibility(published);
  assert.equal(result.allowed, true, 'Published resource download must be allowed');
  assert.equal(result.statusCode, 200, 'Published download returns 200');
});

test('Priority 3 Admin Dashboard: Resource status transition updates accurately', () => {
  const allResources = localStore.getResources(true);
  const target = allResources[0];
  const originalStatus = target.status;

  // Unpublish (switch to draft)
  localStore.updateResource(target.id, { status: 'draft' });
  const updatedAsDraft = localStore.getResourceById(target.id);
  assert.equal(updatedAsDraft?.status, 'draft');

  // Verify it is immediately hidden from public view
  const publicView = localStore.getResources(false);
  assert.equal(publicView.some((r) => r.id === target.id), false);

  // Restore back to original status
  localStore.updateResource(target.id, { status: originalStatus });
});

test('Priority 4 Privacy: Teacher requests tracking requires exact phone number match', () => {
  const requests = localStore.getTeacherRequests();
  assert.ok(requests.length > 0, 'Seed requests must exist');
  const sample = requests[0];

  // Correct ref + correct phone
  const match = localStore.findRequestByRefAndPhone(sample.ref_number, sample.phone_number);
  assert.ok(match, 'Matching request should be found');
  assert.equal(match.ref_number, sample.ref_number);

  // Wrong phone number must return null (protecting teacher privacy)
  const wrongPhone = localStore.findRequestByRefAndPhone(sample.ref_number, '9999999999');
  assert.equal(wrongPhone, null, 'Wrong phone number must return null');
});
