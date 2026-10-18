#!/usr/bin/env node
// GymPulse Stage 1 docs-integrity pilot; execute only from reviewed BASE checkout.
// PR merge checkout is untrusted DATA. No packages, network, or PR-owned scripts.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [argRepo, base, head, merge] = process.argv.slice(2);
const isSha = value => typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
const errors = [], notices = [];
const fail = message => errors.push(message);
const safe = (value, max = 240) => String(value).replace(/[^\x20-\x7e]/g, '?').slice(0, max);
const root = argRepo && path.resolve(argRepo);

function git(args, binary = false) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: binary ? 'buffer' : 'utf8',
    timeout: 20000, maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1' },
  });
  if (result.error || result.status !== 0) throw new Error('Git operation unavailable: ' + safe(args[0]));
  return result.stdout;
}

function withinRoot(candidate) {
  const rel = path.relative(root, candidate);
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel));
}

function localFile(filename) {
  if (!filename || filename.includes('\0') || path.isAbsolute(filename)) throw new Error('Unsafe repository path');
  const candidate = path.resolve(root, filename);
  if (!withinRoot(candidate)) throw new Error('Repository path escape');
  const canonical = fs.realpathSync(candidate);
  if (!withinRoot(canonical)) throw new Error('Symlink escapes repository');
  return canonical;
}

function removeCode(markdown) {
  let fenced = null;
  return markdown.split(/\r?\n/).map(line => {
    const match = line.match(/^ {0,3}(\x60{3,}|~{3,})/);
    if (match) {
      const marker = match[1][0];
      if (!fenced) fenced = { marker, count: match[1].length };
      else if (marker === fenced.marker && match[1].length >= fenced.count) fenced = null;
      return '';
    }
    if (fenced || /^( {4}|\t)/.test(line)) return '';
    return line.replace(/(\x60+)[^\n]*?\1/g, '');
  }).join('\n');
}

function headingSlug(heading) {
  return heading.replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[\x60*_~]/g, '')
    .normalize('NFKC').toLowerCase()
    .replace(/[^\p{L}\p{N}_\- ]/gu, '')
    .trim().replace(/ +/g, '-');
}

function headingsFor(filename) {
  const text = removeCode(fs.readFileSync(filename, 'utf8'));
  const found = new Set(), occurrences = new Map();
  for (const line of text.split('\n')) {
    const match = line.match(/^ {0,3}#{1,6}\s+(.+?)(?:\s+#+\s*)?$/);
    if (match) {
      const slug = headingSlug(match[1]);
      if (slug) {
        const old = occurrences.get(slug) || 0;
        found.add(old ? slug + '-' + old : slug);
        occurrences.set(slug, old + 1);
      }
    }
    for (const m of line.matchAll(/<(?:a|h[1-6])\s+[^>]*\bid=["']([^"']+)["'][^>]*>/gi)) found.add(m[1]);
  }
  return found;
}

function destination(raw) {
  const value = raw.trim();
  if (value.startsWith('<')) {
    const end = value.indexOf('>');
    if (end < 0) throw new Error('Malformed angle-wrapped link');
    return value.slice(1, end);
  }
  return (value.match(/^(?:\\.|[^\s])+/) || [''])[0].replace(/\\([() ])/g, '$1');
}

function checkLink(source, raw, line) {
  const at = line ? ' [' + safe(source) + ':' + line + ']' : '';
  let target;
  try { target = destination(raw); } catch { fail(safe(source) + ': malformed link' + at); return; }
  if (!target || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) return; // No external URL calls.
  if (target.startsWith('/')) { fail(safe(source) + ': root-absolute link unsupported' + at); return; }
  const hash = target.indexOf('#'), query = target.indexOf('?');
  const end = Math.min(hash < 0 ? target.length : hash, query < 0 ? target.length : query);
  let filePart, anchor;
  try {
    filePart = decodeURIComponent(target.slice(0, end));
    anchor = hash < 0 ? '' : decodeURIComponent(target.slice(hash + 1));
  } catch { fail(safe(source) + ': invalid URL encoding' + at); return; }
  if (filePart.includes('\0') || filePart.includes('\\')) { fail(safe(source) + ': unsafe encoding' + at); return; }
  const rel = filePart ? path.join(path.dirname(source), filePart) : source;
  try {
    const resolved = localFile(rel), stat = fs.statSync(resolved);
    if (!stat.isFile() && !stat.isDirectory()) throw new Error('Not a file');
    if (anchor && stat.isFile() && resolved.toLowerCase().endsWith('.md')) {
      if (!headingsFor(resolved).has(anchor)) throw new Error('Missing Markdown anchor');
    } else if (anchor && stat.isDirectory()) throw new Error('Directory anchor unsupported');
  } catch { fail(safe(source) + ': invalid local link ' + safe(target) + at); }
}

// Convert match offsets to 1-based file lines without rescanning for each link.
function lineLookup(text) {
  const breaks = [];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) breaks.push(i);
  return offset => {
    let lo = 0, hi = breaks.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (breaks[mid] < offset) lo = mid + 1; else hi = mid;
    }
    return lo + 1;
  };
}

function validateMarkdown(filename) {
  let resolved;
  try { resolved = localFile(filename); } catch { fail(safe(filename) + ': missing/unsafe Markdown'); return; }
  const stat = fs.statSync(resolved);
  if (!stat.isFile() || stat.size > 1024 * 1024) { fail(safe(filename) + ': unsupported file or >1MiB'); return; }
  const text = removeCode(fs.readFileSync(resolved, 'utf8'));
  const lineOf = lineLookup(text);
  const refs = new Map();
  for (const match of text.matchAll(/^ {0,3}\[([^\]]+)\]:\s*(<[^>]+>|[^\s]+)/gm)) {
    const id = match[1].trim().toLowerCase().replace(/\s+/g, ' ');
    refs.set(id, match[2]);
    checkLink(filename, match[2], lineOf(match.index));
  }
  // Scoped syntax support only; nested/multiline links, HTML href and live URL checks are NOT RUN.
  for (const match of text.matchAll(/!?\[[^\]\n]*\]\((<[^>\n]*>|[^)\n]*(?:\([^)\n]*\)[^)\n]*)?)\)/g)) checkLink(filename, match[1], lineOf(match.index));
  for (const match of text.matchAll(/!?\[([^\]\n]+)\]\[([^\]\n]*)\]/g)) {
    const id = (match[2] || match[1]).trim().toLowerCase().replace(/\s+/g, ' ');
    if (!refs.has(id)) fail(safe(filename) + ': undefined reference label ' + safe(id) + ' [' + safe(filename) + ':' + lineOf(match.index) + ']');
  }
}

try {
  if (!root || ![base, head, merge].every(isSha)) throw new Error('Missing/invalid SHA arguments');
  if (!fs.existsSync(path.join(root, '.git'))) throw new Error('Subject checkout unavailable');
  const parents = git(['show', '-s', '--format=%P', merge]).trim().split(/\s+/);
  if (parents.length !== 2 || parents[0] !== base || parents[1] !== head) {
    throw new Error('Unexpected PR merge commit parents; fail closed');
  }
  for (const ref of [base, head, merge]) git(['cat-file', '-e', ref + '^{commit}']);
  const white = spawnSync('git', ['-C', root, 'diff', '--check', base, merge, '--'], {
    encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024,
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1' },
  });
  if (white.error || white.status !== 0) {
    fail('Changed-line whitespace check failed');
    // Only report Git's path, line and known reason. Never log the offending
    // source line from PR data (it could contain secrets or control sequences).
    let count = 0;
    for (const line of (white.stdout || '').split(/\r?\n/)) {
      const finding = line.match(/^(.+):([1-9]\d*): (trailing whitespace|new blank line at EOF|space before tab in indent)\.?$/);
      if (finding && count++ < 10) fail(safe(finding[1]) + ':' + finding[2] + ': ' + finding[3]);
    }
  }
  const names = git(['diff', '--name-only', '-z', '--diff-filter=ACMR', base, merge, '--'], true)
    .toString('utf8').split('\0').filter(Boolean);
  if (names.length > 300) throw new Error('Too many changed files for pilot');
  const docs = names.filter(name => /\.md$/i.test(name));
  for (const doc of docs) validateMarkdown(doc);
  if (!docs.length) notices.push('NO DOC FILES: whitespace checked, link check not applicable');
  notices.push('External URLs and advanced/nested Markdown syntax: NOT RUN');
  console.log('docs-integrity: changed_files=' + names.length + ' markdown_files=' + docs.length);
} catch (err) { fail(safe(err.message || String(err))); }
for (const item of notices) console.log('NOTICE: ' + item);
// The combined message may contain two bounded paths plus a target. Preserve
// the final location/reason suffix while capping each emitted log line.
for (const item of errors) console.error('FAIL: ' + safe(item, 1024));
if (errors.length) {
  console.error('docs-integrity: FAIL (' + errors.length + ' findings)');
  process.exitCode = 1;
} else {
  console.log('docs-integrity: PASS (scoped docs checks only, not a production/security gate)');
}
