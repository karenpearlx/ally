import assert from 'node:assert/strict';
import test from 'node:test';
import { extractJobSlugs, parseOLJJob, parseSalary } from './olj.mjs';

test('parseSalary handles common OLJ formats', () => {
  assert.deepEqual(parseSalary('3$/hour'), { min: 3, max: 3, currency: 'USD', type: 'hourly' });
  assert.deepEqual(parseSalary('PHP 50,000 - 70,000 per month'), { min: 50_000, max: 70_000, currency: 'PHP', type: 'monthly' });
  assert.deepEqual(parseSalary('$800/month'), { min: 800, max: 800, currency: 'USD', type: 'monthly' });
  assert.deepEqual(parseSalary('40k - 55k PHP'), { min: 40_000, max: 55_000, currency: 'PHP', type: 'monthly' });
  assert.deepEqual(parseSalary('Salary (@320.00/ $2.00 per hour)'), { min: 2, max: 2, currency: 'USD', type: 'hourly' });
});

test('extractJobSlugs deduplicates listing links', () => {
  const html = '<a href="/jobseekers/job/virtual-assistant-123">A</a><a href="/jobseekers/job/virtual-assistant-123">A</a>';
  assert.deepEqual(extractJobSlugs(html), ['virtual-assistant-123']);
});

test('parseOLJJob extracts actual detail fields', () => {
  const html = `
    <h1 class="job__title">Operations Assistant</h1>
    <div class="job-post"><dd><h3>TYPE OF WORK</h3><p>Full Time</p></dd>
    <dd><h3>WAGE / SALARY</h3><p>PHP 45,000-60,000/month</p></dd>
    <dd><h3>DATE UPDATED</h3><p>Aug 3, 2026</p></dd></div>
    <p id="job-description" data-jobid="987">Manage projects and client communication.</p>
    <a class="card-worker-topskill">Project Management</a><a class="card-worker-topskill">English</a>`;
  const job = parseOLJJob(html, 'https://www.onlinejobs.ph/jobseekers/job/operations-assistant-987');
  assert.equal(job.source_id, '987');
  assert.equal(job.title, 'Operations Assistant');
  assert.equal(job.description, 'Manage projects and client communication.');
  assert.equal(job.salary_min, 45_000);
  assert.equal(job.salary_max, 60_000);
  assert.equal(job.salary_currency, 'PHP');
  assert.equal(job.job_type, 'full-time');
  assert.deepEqual(job.skills, ['Project Management', 'English']);
  assert.equal(job.company, null);
  assert.match(job.posted_at, /^2026-08-03T/);
});
