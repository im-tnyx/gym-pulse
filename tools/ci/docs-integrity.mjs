#!/usr/bin/env node
// GymPulse Stage 1 docs-integrity pilot; execute only from reviewed BASE checkout.
// PR merge checkout is untrusted DATA. No packages, network, or PR-owned scripts.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [argRepo, base, head, merge] = process.argv.slice(2);
const isSha = value => typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
const errors = [], notices = [];
const MAX_FINDINGS = 100;
const fail = message => {
  if (errors.length < MAX_FINDINGS) errors.push(message);
  else if (errors.length === MAX_FINDINGS) errors.push('Too many findings; diagnostics truncated');
};
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

function escapedAt(text, index) {
  let slashes = 0;
  for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) slashes++;
  return slashes % 2 === 1;
}

function removeCode(markdown) {
  // Bounded, order-sensitive Markdown masking. Preserve newlines and offsets.
  // Multiline code spans and HTML comments cannot change fence ownership.
  const lines = markdown.split(/\r?\n/);
  let fenced = null, comment = false, rawBlock = null, listIndent = null, inlineTicks = 0;

  function closingTicks(text, from, count) {
    const runs = /`+/g;
    runs.lastIndex = from;
    let run, inspected = 0;
    while ((run = runs.exec(text))) {
      // Avoid quadratic work on hostile Markdown containing many tick runs.
      if (++inspected > 512) return null; // Conservatively keep ambiguous text visible.
      if (run[0].length === count) return run;
    }
    return null;
  }
  function laterClosingTicks(index, count) {
    let inspected = 0;
    for (let j = index + 1; j < lines.length && j - index <= 32; j++) {
      inspected += lines[j].length + 1;
      if (inspected > 8192) return false; // Do not suppress uncertain live links.
      // Do not mistake a later fenced code marker for an inline-code closer.
      if (/^ {0,3}(?:`{3,}|~{3,})/.test(lines[j])) return false;
      if (closingTicks(lines[j], 0, count)) return true;
    }
    return false;
  }

  return lines.map((line, lineIndex) => {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fenced) {
      if (fence && fence[1][0] === fenced.marker &&
          fence[1].length >= fenced.count && !fence[2].trim()) fenced = null;
      return '';
    }
    if (rawBlock) {
      if (new RegExp('</' + rawBlock + '\\s*>', 'i').test(line)) rawBlock = null;
      return '';
    }
    if (!comment && !inlineTicks && fence &&
        !(fence[1][0] === '`' && fence[2].includes('`'))) {
      fenced = { marker: fence[1][0], count: fence[1].length };
      return '';
    }
    if (!comment && !inlineTicks) {
      const rawOpen = line.match(/^ {0,3}<(pre|script|style|textarea)\b[^>]*>/i);
      if (rawOpen) {
        const tag = rawOpen[1].toLowerCase();
        if (!new RegExp('</' + tag + '\\s*>', 'i').test(line.slice(rawOpen[0].length))) rawBlock = tag;
        return '';
      }
      const list = line.match(/^ {0,3}(?:[-+*]|\d{1,9}[.)])\s+/);
      if (list) listIndent = list[0].length;
      else if (line.trim() && listIndent !== null &&
          !line.startsWith(' '.repeat(listIndent))) listIndent = null;
      const indent = (line.match(/^ */) || [''])[0].length;
      if ((indent >= 4 || line.startsWith('\t')) &&
          (listIndent === null || indent < listIndent || indent >= listIndent + 4)) return '';
    }

    let visible = '', from = 0;
    while (from < line.length) {
      if (comment) {
        const end = line.indexOf('-->', from);
        if (end < 0) { visible += ' '.repeat(line.length - from); break; }
        visible += ' '.repeat(end + 3 - from);
        from = end + 3;
        comment = false;
        continue;
      }
      if (inlineTicks) {
        const end = closingTicks(line, from, inlineTicks);
        if (!end) { visible += ' '.repeat(line.length - from); break; }
        visible += ' '.repeat(end.index + inlineTicks - from);
        from = end.index + inlineTicks;
        inlineTicks = 0;
        continue;
      }
      const ticks = /`+/g;
      ticks.lastIndex = from;
      let tick = ticks.exec(line);
      while (tick && escapedAt(line, tick.index)) {
        ticks.lastIndex = tick.index + tick[0].length;
        tick = ticks.exec(line);
      }
      let opener = line.indexOf('<!--', from);
      while (opener >= 0 && escapedAt(line, opener)) opener = line.indexOf('<!--', opener + 4);
      if (tick && (opener < 0 || tick.index < opener)) {
        const closer = closingTicks(line, tick.index + tick[0].length, tick[0].length);
        if (closer) {
          visible += line.slice(from, tick.index) +
            ' '.repeat(closer.index + closer[0].length - tick.index);
          from = closer.index + closer[0].length;
        } else if (laterClosingTicks(lineIndex, tick[0].length)) {
          visible += line.slice(from, tick.index) + ' '.repeat(line.length - tick.index);
          inlineTicks = tick[0].length;
          break;
        } else {
          visible += line.slice(from, tick.index + tick[0].length);
          from = tick.index + tick[0].length;
        }
      } else if (opener >= 0) {
        visible += line.slice(from, opener);
        from = opener;
        comment = true;
      } else {
        visible += line.slice(from);
        break;
      }
    }
    return visible;
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

function headingsIn(text) {
  const found = new Set(), occurrences = new Map();
  const addSlug = heading => {
    const slug = headingSlug(heading);
    if (!slug) return;
    const old = occurrences.get(slug) || 0;
    found.add(old ? slug + '-' + old : slug);
    occurrences.set(slug, old + 1);
  };
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const atx = line.match(/^ {0,3}#{1,6}\s+(.+?)(?:\s+#+\s*)?$/);
    if (atx) addSlug(atx[1]);
    else if (i > 0 && /^ {0,3}(?:=+|-+)\s*$/.test(line)) {
      const previous = lines[i - 1];
      if (previous.trim() && !/^ {0,3}[#>]/.test(previous)) addSlug(previous.trim());
    }
    for (const m of line.matchAll(/<(?:a|h[1-6])\s+[^>]*\bid=["']([^"']+)["'][^>]*>/gi)) found.add(m[1]);
  }
  return found;
}

function headingsFor(filename) {
  return headingsIn(removeCode(fs.readFileSync(filename, 'utf8')));
}

const NAMED_DESTINATION_ENTITIES = Object.freeze({
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
  period: '.', sol: '/', num: '#', colon: ':', semi: ';',
  quest: '?', percnt: '%', equals: '=', lowbar: '_', hyphen: '-',
});
function decodeLinkEntities(value) {
  return value.replace(/&(?:#(?:[xX][0-9a-fA-F]+|[0-9]+)|[A-Za-z][A-Za-z0-9]+);/g, entity => {
    const token = entity.slice(1, -1);
    if (token[0] === '#') {
      const hex = token[1] === 'x' || token[1] === 'X';
      const number = Number.parseInt(token.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (!Number.isSafeInteger(number) || number < 1 || number > 0x10ffff ||
          (number >= 0xd800 && number <= 0xdfff)) {
        throw new Error('Unsupported numeric HTML entity; fail closed');
      }
      return String.fromCodePoint(number);
    }
    if (!Object.hasOwn(NAMED_DESTINATION_ENTITIES, token)) {
      throw new Error('Unsupported named HTML entity; fail closed');
    }
    return NAMED_DESTINATION_ENTITIES[token];
  });
}

function destination(raw) {
  const value = raw.trim();
  if (value.startsWith('<')) {
    const end = value.indexOf('>');
    if (end < 0) throw new Error('Malformed angle-wrapped link');
    return decodeLinkEntities(value.slice(1, end));
  }
  return decodeLinkEntities((value.match(/^(?:\\.|[^\s])+/) || [''])[0]
    .replace(/\\([!-/:-@\[-`{-~ ])/g, '$1'));
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

// Target matching uses lexical paths because the target is absent in the merge.
// Resolve surviving directory symlink aliases, never paths outside the checkout.
// Invalid pre-existing anchors were not introduced by this deletion and are skipped.
const baseTargetCache = new Map();
const baseTargetInProgress = new Set();
function baseTargetValid(relative, anchor) {
  const key = JSON.stringify([relative, anchor]);
  if (baseTargetCache.has(key)) return baseTargetCache.get(key);
  if (baseTargetInProgress.has(key)) return false; // Cyclic base symlink: already invalid.
  if (baseTargetCache.size > 1000 || baseTargetInProgress.size >= 8) {
    throw new Error('Too many distinct/cyclic deleted link destinations');
  }
  let valid = false;
  baseTargetInProgress.add(key);
  try {
    const modeEntry = git(['ls-tree', base, '--', relative]);
    if (/^100(?:644|755) blob [0-9a-f]{40}\t/.test(modeEntry)) {
      valid = !anchor;
      if (anchor) {
        const blobSize = Number(git(['cat-file', '-s', base + ':' + relative]).trim());
        if (!Number.isSafeInteger(blobSize) || blobSize < 0) {
          throw new Error('Invalid base Markdown target blob size');
        }
        // Conservative fail-closed rejection of deletions where base anchors
        // cannot safely be parsed, without reading a huge Git blob.
        valid = blobSize > 1024 * 1024 || (relative.toLowerCase().endsWith('.md') &&
          headingsIn(removeCode(git(['show', base + ':' + relative], true).toString('utf8'))).has(anchor));
      }
    } else if (/^120000 blob [0-9a-f]{40}\t/.test(modeEntry)) {
      const blobSize = Number(git(['cat-file', '-s', base + ':' + relative]).trim());
      if (!Number.isSafeInteger(blobSize) || blobSize > 4096) {
        throw new Error('Oversized or unknown base symlink target; fail closed');
      }
      const targetBytes = git(['show', base + ':' + relative], true);
      const target = targetBytes.toString('utf8');
      if (!Buffer.from(target, 'utf8').equals(targetBytes)) {
        throw new Error('Non-UTF8 base symlink target unsupported');
      }
      if (target && !path.isAbsolute(target) && !target.includes('\0')) {
        const resolved = path.resolve(root, path.dirname(relative), target);
        if (withinRoot(resolved)) {
          valid = baseTargetValid(path.relative(root, resolved).split(path.sep).join('/'), anchor);
        }
      }
    }
  } finally { baseTargetInProgress.delete(key); }
  // Do not convert Git inspection failures into "invalid in base": errors
  // propagate to outer fail-closed checker handler instead of false PASS.
  baseTargetCache.set(key, valid);
  return valid;
}

function refersToDeletedMarkdown(source, raw, deleted) {
  let link;
  try { link = destination(raw); } catch { throw new Error('Unparseable inbound destination; fail closed'); }
  if (!link || link.startsWith('/') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(link)) return false;
  const hash = link.indexOf('#'), query = link.indexOf('?');
  const end = Math.min(hash < 0 ? link.length : hash, query < 0 ? link.length : query);
  let filename, anchor;
  try {
    filename = decodeURIComponent(link.slice(0, end));
    anchor = hash < 0 ? '' : decodeURIComponent(link.slice(hash + 1));
  } catch { return false; }
  if (!filename || filename.includes('\0') || filename.includes('\\')) return false;
  const absolute = path.resolve(root, path.dirname(source), filename);
  if (!withinRoot(absolute)) return false;
  const paths = [absolute];
  try {
    // Deleted basename cannot be realpathed, but any symlinked parent can.
    const parent = fs.realpathSync(path.dirname(absolute));
    if (withinRoot(parent)) paths.push(path.join(parent, path.basename(absolute)));
  } catch { /* Normal missing parent: no alias candidate. */ }
  return paths.some(candidate => {
    if (!withinRoot(candidate)) return false;
    const relative = path.relative(root, candidate).split(path.sep).join('/');
    return deleted.has(relative) && baseTargetValid(relative, anchor);
  });
}

// Convert match offsets to 1-based file lines without rescanning for each link.
function lineLookup(text) {
  const breaks = [];
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    if (char === 13) {
      if (text.charCodeAt(i + 1) === 10) i++; // CRLF is one break.
      breaks.push(i);
    } else if (char === 10) breaks.push(i); // LF or standalone CR.
  }
  return offset => {
    let lo = 0, hi = breaks.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (breaks[mid] < offset) lo = mid + 1; else hi = mid;
    }
    return lo + 1;
  };
}

function validateMarkdown(filename, deletedTargets = null, budget = null) {
  let resolved;
  try { resolved = localFile(filename); } catch { fail(safe(filename) + ': missing/unsafe Markdown'); return; }
  const stat = fs.statSync(resolved);
  if (!stat.isFile() || stat.size > 1024 * 1024) { fail(safe(filename) + ': unsupported file or >1MiB'); return; }
  if (budget && (budget.bytes -= stat.size) < 0) throw new Error('Inbound Markdown scan byte budget exceeded');
  const text = removeCode(fs.readFileSync(resolved, 'utf8'));
  const lineOf = lineLookup(text);
  const refs = new Map();
  for (const match of text.matchAll(/^ {0,3}\[([^\]]+)\]:\s*(<[^>]+>|[^\s]+)/gm)) {
    if (escapedAt(text, match.index)) continue;
    const id = match[1].trim().toLowerCase().replace(/\s+/g, ' ');
    if (refs.has(id)) continue; // First definition of each label wins.
    if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
    refs.set(id, { destination: match[2], line: lineOf(match.index) });
    if (!deletedTargets) checkLink(filename, match[2], lineOf(match.index));
  }
  // Scoped syntax support only; nested/multiline links, HTML href and live URL checks are NOT RUN.
  for (const match of text.matchAll(/!?\[(?:\\.|[^\]\n])*\]\((<[^>\n]*>|[^)\n]*(?:\([^\)\n]*\)[^)\n]*)?)\)/g)) {
    if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
    const opener = match.index + (match[0][0] === '!' ? 1 : 0);
    if (escapedAt(text, opener)) continue;
    if (!deletedTargets || refersToDeletedMarkdown(filename, match[1], deletedTargets)) {
      checkLink(filename, match[1], lineOf(match.index));
    }
  }
  const used = new Set();
  for (const match of text.matchAll(/!?\[([^\]\n]+)\]\[([^\]\n]*)\]/g)) {
    if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
    const opener = match.index + (match[0][0] === '!' ? 1 : 0);
    if (escapedAt(text, opener)) continue;
    const id = (match[2] || match[1]).trim().toLowerCase().replace(/\s+/g, ' ');
    if (deletedTargets) used.add(id);
    else if (!refs.has(id)) {
      fail(safe(filename) + ': undefined reference label ' + safe(id) + ' [' + safe(filename) + ':' + lineOf(match.index) + ']');
    }
  }
  if (deletedTargets) {
    // Standard shortcut references: [label] or ![alt] when a definition exists.
    // Ignore definitions, explicit/inline link openers, and backslash literals.
    for (const match of text.matchAll(/!?\[([^\[\]\n]+)\]/g)) {
      if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
      const opener = match.index + (match[0][0] === '!' ? 1 : 0);
      if (escapedAt(text, opener)) continue;
      const after = text[match.index + match[0].length] || '';
      if (after === ':' || after === '[' || after === '(') continue;
      const id = match[1].trim().toLowerCase().replace(/\s+/g, ' ');
      if (refs.has(id)) used.add(id);
    }
    for (const [id, ref] of refs) {
      if (!used.has(id)) continue;
      if (refersToDeletedMarkdown(filename, ref.destination, deletedTargets)) {
        checkLink(filename, ref.destination, ref.line);
      }
    }
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
    const lines = (white.stdout || '').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const finding = lines[i].match(/^(.+):([1-9]\d*): (trailing whitespace|new blank line at EOF|space before tab in indent)\.?$/);
      if (!finding) continue;
      const reason = finding[3];
      // Git prints the untrusted added source line IMMEDIATELY AFTER each
      // trailing-whitespace / space-before-tab header. Never interpret or log
      // that raw payload, even if crafted to resemble another diagnostic.
      if (reason !== 'new blank line at EOF') i++;
      if (count++ < 10) fail(safe(finding[1]) + ':' + finding[2] + ': ' + reason);
    }
  }
  const names = git(['diff', '--name-only', '-z', '--diff-filter=ACMRT', base, merge, '--'], true)
    .toString('utf8').split('\0').filter(Boolean);
  if (names.length > 300) throw new Error('Too many changed files for pilot');
  const docs = names.filter(name => /\.md$/i.test(name));
  for (const doc of docs) validateMarkdown(doc);
  // Inbound local links in unchanged Markdown can break when a target is deleted.
  // Limit work and check only deleted Markdown paths, not every baseline link.
  // --no-renames treats an old rename path as D and the new path as A.
  // Fail closed on non-UTF8 paths rather than silently replacing raw Git bytes.
  const deletedBytes = git(['diff', '--no-renames', '--name-only', '-z',
    '--diff-filter=D', base, merge, '--'], true);
  const decoded = deletedBytes.toString('utf8');
  if (!Buffer.from(decoded, 'utf8').equals(deletedBytes)) {
    throw new Error('Non-UTF8 Git deletion path unsupported; fail closed');
  }
  const deleted = decoded.split('\0').filter(name => /\.md$/i.test(name));
  if (deleted.length > 100) throw new Error('Too many deleted Markdown targets for bounded pilot');
  let inboundScanned = 0;
  if (deleted.length) {
    const deletedSet = new Set(deleted);
    const indexBytes = git(['ls-files', '--stage', '-z', '--'], true);
    const index = indexBytes.toString('utf8');
    if (!Buffer.from(index, 'utf8').equals(indexBytes)) {
      throw new Error('Non-UTF8 tracked path unsupported for inbound scan; fail closed');
    }
    const tracked = index.split('\0').filter(Boolean).map(entry => {
      const match = entry.match(/^([0-7]{6}) [0-9a-f]{40} [0-3]\t(.*)$/s);
      if (!match) throw new Error('Unrecognized Git index entry; fail closed');
      return { mode: match[1], filename: match[2] };
    }).filter(entry => /\.md$/i.test(entry.filename));
    if (tracked.length > 500) throw new Error('Too many tracked Markdown files for bounded inbound scan');
    const changedDocs = new Set(docs);
    const budget = { bytes: 32 * 1024 * 1024, links: 10000 };
    for (const { mode, filename } of tracked) {
      if (changedDocs.has(filename) || mode === '120000') continue;
      if (!mode.startsWith('100')) throw new Error('Unsupported Markdown index mode');
      validateMarkdown(filename, deletedSet, budget);
      inboundScanned++;
    }
    notices.push('Removed/renamed Markdown target inbound references: scoped scan of unchanged Markdown only');
  }
  if (!docs.length && !deleted.length) notices.push('NO DOC FILES: whitespace checked, link check not applicable');
  notices.push('External URLs and advanced/nested Markdown syntax: NOT RUN');
  console.log('docs-integrity: changed_files=' + names.length + ' markdown_files=' + docs.length
    + ' deleted_markdown_files=' + deleted.length + ' inbound_scanned=' + inboundScanned);
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
