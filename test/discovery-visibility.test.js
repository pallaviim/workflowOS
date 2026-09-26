import test from 'node:test';
import assert from 'node:assert/strict';
import {isDiscoveryVisible} from '../src/discovery-visibility.js';

const activity = (status, extra = {}) => ({
  id: `activity-${status}`,
  name: 'Process Customer Request',
  source: 'activity-discovery',
  status,
  discoverySignature: 'open_email|download_attachment|search_customer|update_customer|send_message',
  ...extra
});

const seeded = (status = 'discovered') => ({
  id: `seeded-${status}`,
  name: 'Process Customer Request',
  source: 'seeded-demo',
  status
});

test('TEST 1: Existing activity-derived Process Customer Request with status "discovered" is visible', () => {
  const candidate = activity('discovered');
  assert.equal(isDiscoveryVisible(candidate), true);
});

test('TEST 2: Existing activity-derived Process Customer Request candidate is visible to Discoveries page logic', () => {
  const candidate = activity('paused');
  assert.equal(isDiscoveryVisible(candidate), true);
});

test('TEST 3: When discovery returns created: 0 due to duplicate prevention, existing candidate remains visible', () => {
  const existing = activity('paused');
  const workflows = [seeded('discovered'), existing];
  const discoveryResult = { created: 0, candidates: [existing] };

  assert.equal(discoveryResult.created, 0);
  const visible = workflows.filter(isDiscoveryVisible);
  assert.ok(visible.some(w => w.id === existing.id));
});

test('TEST 4: Ignored legacy candidates remain hidden', () => {
  const legacyContaminated = activity('discovered', { legacyContaminated: true });
  const statusIgnored = activity('ignored');
  const flagIgnored = activity('discovered', { ignored: true });

  assert.equal(isDiscoveryVisible(legacyContaminated), false);
  assert.equal(isDiscoveryVisible(statusIgnored), false);
  assert.equal(isDiscoveryVisible(flagIgnored), false);
});

test('TEST 5: Seeded demo workflows remain available and are not broken', () => {
  const seedDiscovered = seeded('discovered');
  const seedNeedsApproval = seeded('needs_approval');

  assert.equal(isDiscoveryVisible(seedDiscovered), true);
  assert.equal(isDiscoveryVisible(seedNeedsApproval), true);
});

test('TEST 6: An activity-derived workflow with status "active" remains visible', () => {
  const candidate = activity('active');
  assert.equal(isDiscoveryVisible(candidate), true);
});

test('TEST 7: An activity-derived workflow with status "paused" remains visible', () => {
  const candidate = activity('paused');
  assert.equal(isDiscoveryVisible(candidate), true);
});

test('TEST 8: An activity-derived workflow with status "rejected" is hidden from pending discoveries', () => {
  const candidate = activity('rejected');
  assert.equal(isDiscoveryVisible(candidate), false);
});
