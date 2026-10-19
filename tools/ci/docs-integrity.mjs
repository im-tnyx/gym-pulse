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
  const lines = markdown.split(/\r\n|\n|\r/);
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

const UNCERTAIN_HEADING_ENTITY = '\0unknown-heading-entity';
function headingSlug(heading) {
  // Decode supported HTML references, but do not let an unrelated heading
  // with an unsupported entity abort the scan of an otherwise valid base.
  // A heading containing an unrecognized entity is conservatively ambiguous.
  let uncertain = false;
  const decoded = heading.replace(/&(?:#(?:[xX][0-9a-fA-F]+|[0-9]+)|[A-Za-z][A-Za-z0-9]+);/g, ref => {
    try { return decodeLinkEntities(ref); }
    catch { uncertain = true; return ''; }
  });
  if (uncertain) return null;
  // Protect single-tick code contents from HTML tag removal: a heading
  // containing `<There>` contributes the rendered word 'There'.
  const spans = [];
  const protectedHeading = decoded.replace(/`([^`\n]*)`/g, (_match, inner) => {
    const index = spans.length;
    spans.push(inner);
    return '\x01' + index + '\x02';
  });
  // More complex code delimiters are outside this pilot's slug parser.
  // If they coincide with HTML-like text, avoid a false baseline-invalid.
  if (protectedHeading.includes('`') && /<[^>]*>/.test(protectedHeading)) return null;
  return protectedHeading.replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/\x01(\d+)\x02/g, (_match, index) => spans[Number(index)] || '')
    .replace(/[\x60*_~]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\- ]/gu, '')
    .trim().replace(/ +/g, '-');
}

function headingsIn(text, original = text) {
  // Use masked text to decide which lines are headings, and the original
  // line to retain rendered inline-code text for baseline anchor slugs.
  const originalLines = original.split(/\r\n|\n|\r/);
  const found = new Set(), occurrences = new Map();
  const addSlug = heading => {
    const slug = headingSlug(heading);
    if (slug === null) { found.add(UNCERTAIN_HEADING_ENTITY); return; }
    if (!slug) return;
    const old = occurrences.get(slug) || 0;
    found.add(old ? slug + '-' + old : slug);
    occurrences.set(slug, old + 1);
  };
  const lines = text.split('\n');
  // A complete leading YAML front-matter block is metadata, not a setext
  // heading. An unmatched opener is not masked.
  let frontMatterEnd = -1;
  if (lines[0]?.trim() === '---') {
    for (let j = 1; j < lines.length; j++) {
      if (/^(?:---|\.\.\.)[ \t]*$/.test(lines[j])) {
        frontMatterEnd = j;
        break;
      }
    }
  }
  for (let i = 0; i < lines.length; i++) {
    if (frontMatterEnd >= 0 && i <= frontMatterEnd) continue;
    const line = lines[i];
    const atx = line.match(/^ {0,3}#{1,6}\s+(.+?)(?:\s+#+\s*)?$/);
    if (atx) {
      const source = (originalLines[i] || '').match(/^ {0,3}#{1,6}\s+(.+?)(?:\s+#+\s*)?$/);
      addSlug(source ? source[1] : atx[1]);
    } else if (i > 0 && /^ {0,3}(?:=+|-+)\s*$/.test(line)) {
      const previous = lines[i - 1];
      if (previous.trim() && !/^ {0,3}[#>]/.test(previous)) {
        addSlug((originalLines[i - 1] || previous).trim());
      }
    }
    // Capture complete tag first, then find one valid quoted/unquoted ID.
    // A single tag regex avoids overlapping attribute backtracking.
    for (const tag of line.matchAll(/<(?:a|h[1-6])\b[^>\n]*>/gi)) {
      const id = tag[0].match(/\sid\s*=\s*(?:"([^"\n]*)"|'([^'\n]*)'|([^\s"'=<>\x60]+))/i);
      if (id) {
        try { found.add(decodeLinkEntities(id[1] ?? id[2] ?? id[3])); }
        catch {
          // A valid but unsupported HTML5 reference can still form the
          // requested anchor. Never dismiss a deletion as baseline-invalid.
          found.add(UNCERTAIN_HEADING_ENTITY);
        }
      }
    }
  }
  return found;
}

function headingsFor(filename) {
  const original = fs.readFileSync(filename, 'utf8');
  return headingsIn(removeCode(original), original);
}

const NAMED_DESTINATION_ENTITIES = Object.freeze({
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
  period: '.', sol: '/', num: '#', colon: ':', semi: ';',
  quest: '?', percnt: '%', equals: '=', lowbar: '_', hyphen: '-',
  eacute: 'é', Eacute: 'É', copy: '©', reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–',
  euro: '€', pound: '£', yen: '¥', cent: '¢', bull: '•', times: '×', divide: '÷',
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

function hasEscapedAngleDelimiter(raw) {
  if (!raw.startsWith('<')) return false;
  // Under CommonMark a backslash-escaped '>' cannot delimit an angle link.
  for (let i = 1; i < raw.length; i++) {
    if (raw[i] !== '\\') continue;
    if (raw[i + 1] === '>') return true;
    i++;
  }
  return false;
}

function destination(raw) {
  const value = raw.trim();
  if (value.startsWith('<')) {
    if (hasEscapedAngleDelimiter(value)) {
      throw new Error('Escaped angle destination delimiter is invalid');
    }
    let end = -1;
    for (let i = 1; i < value.length; i++) {
      if (value[i] === '\\') { i++; continue; }
      if (value[i] === '>') { end = i; break; }
    }
    if (end < 0) throw new Error('Malformed angle-wrapped link');
    return decodeLinkEntities(value.slice(1, end).replace(/\\([!-/:-@\[-`{-~ ])/g, '$1'));
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
    const modeEntry = git(['ls-tree', base, '--', ':(literal)' + relative]);
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
          (() => {
             const original = git(['show', base + ':' + relative], true).toString('utf8');
             const headings = headingsIn(removeCode(original), original);
             // Unknown but plausible HTML5 entities can make an anchor valid.
             // Treat uncertain baseline headings as valid (fail-closed on deletion).
             return headings.has(anchor) || headings.has(UNCERTAIN_HEADING_ENTITY);
           })());
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

// Build the trusted BASE symlink index exactly once. Do NOT cache every
// ordinary path prefix: a legitimate 500-Markdown-file repository can have
// thousands of prefixes despite containing no symlinks.
let baseSymlinkPaths = null;
const baseSymlinkTargets = new Map();
function baseSymlinks() {
  if (baseSymlinkPaths !== null) return baseSymlinkPaths;
  const treeBytes = git(['ls-tree', '-r', '-z', base], true);
  const tree = treeBytes.toString('utf8');
  if (!Buffer.from(tree, 'utf8').equals(treeBytes)) {
    throw new Error('Non-UTF8 base tree paths unsupported; fail closed');
  }
  const paths = new Set();
  for (const entry of tree.split('\0').filter(Boolean)) {
    const match = entry.match(/^([0-7]{6}) (?:blob|commit|tree) [0-9a-f]{40}\t(.*)$/s);
    if (!match) throw new Error('Invalid base tree entry; fail closed');
    if (match[1] !== '120000') continue;
    if (paths.size >= 1000) throw new Error('Too many base symlinks to resolve safely');
    paths.add(match[2]);
  }
  baseSymlinkPaths = paths;
  return paths;
}
function resolveBaseParentAliases(parent) {
  // Only BASE links are authoritative; changed MERGE symlinks are untrusted.
  if (!withinRoot(parent)) throw new Error('Unsafe base alias path');
  const symlinks = baseSymlinks();
  if (!symlinks.size) return parent;
  let pending = path.relative(root, parent).split(path.sep).filter(Boolean);
  let current = root, hops = 0, steps = 0;
  while (pending.length) {
    if (++steps > 128) throw new Error('Base alias path exceeds resolution bounds');
    const next = path.resolve(current, pending.shift());
    if (!withinRoot(next)) throw new Error('Base alias escapes repository');
    const relative = path.relative(root, next).split(path.sep).join('/');
    if (!symlinks.has(relative)) { current = next; continue; }
    if (++hops > 8) throw new Error('Too many base symlink aliases');
    let target = baseSymlinkTargets.get(relative);
    if (target === undefined) {
      const size = Number(git(['cat-file', '-s', base + ':' + relative]).trim());
      if (!Number.isSafeInteger(size) || size < 1 || size > 4096) {
        throw new Error('Oversized or invalid base symlink; fail closed');
      }
      const bytes = git(['show', base + ':' + relative], true);
      target = bytes.toString('utf8');
      if (!Buffer.from(target, 'utf8').equals(bytes) ||
          target.includes('\0') || path.isAbsolute(target)) {
        throw new Error('Unsafe base symlink; fail closed');
      }
      baseSymlinkTargets.set(relative, target);
    }
    const resolved = path.resolve(path.dirname(next), target);
    if (!withinRoot(resolved)) throw new Error('Base symlink escapes repository');
    pending = path.relative(root, resolved).split(path.sep).filter(Boolean).concat(pending);
    current = root;
  }
  return current;
}

// When a named HTML entity cannot be decoded, treat the expansion as a
// conservative wildcard *only against deleted paths*. An unrelated link
// must not abort the entire inbound scan; a plausible deleted one must fail.
// Mark path-shaping ambiguous entities as possible when we cannot exclude
// an affected path. This deliberately does not claim full HTML5 parsing.
function couldUnparsedDestinationNameDeleted(source, raw, deleted) {
  if (!deleted.size) return false;
  const value = raw.trim().replace(/^</, '').replace(/>\s*$/, '')
    .split(/[?#]/, 1)[0];
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return false;
  const hasUnknown = /&(?:[A-Za-z][A-Za-z0-9]+);/.test(value);
  if (!hasUnknown) return true; // Malformed or numeric content stays fail-closed.
  let decoded;
  try {
    decoded = value.replace(/\\([!-/:-@\[-`{-~ ])/g, '$1');
    decoded = decoded.replace(/&([A-Za-z][A-Za-z0-9]+);/g, (entity, token) =>
      Object.hasOwn(NAMED_DESTINATION_ENTITIES, token)
        ? NAMED_DESTINATION_ENTITIES[token] : '\x01');
    decoded = decodeLinkEntities(decoded);
  } catch { return true; }
  // Unknown expansions must not enable arbitrary relative path traversal.
  // If an unknown entity occupies an entire path component or can reshape
  // dot-components, preserve fail-closed.
  if (/(?:^|\/)\x01(?:\/|$)/.test(decoded) ||
      /(?:^|\/)\.\.?\x01|\x01\.\.?\//.test(decoded)) return true;
  const slash = decoded.startsWith('/');
  const canonical = slash
    ? path.resolve(root, '.' + decoded)
    : path.resolve(root, path.dirname(source), decoded);
  const pattern = path.relative(root, canonical).split(path.sep).join('/');
  // Every encoded unknown is treated as any string; reject when a deleted
  // target has compatible anchored prefix/suffix. No regex from PR data.
  // Unknown entities may denote a filename reached through a BASE directory
  // symlink. A lexical pattern may differ from the deleted real path.
  // Fail closed only when an alias lies on/could occupy that path; ordinary
  // unrelated links without any plausible alias still remain nonblocking.
  const firstWildcard = pattern.indexOf('\x01');
  for (const alias of baseSymlinks()) {
    if (pattern === alias || pattern.startsWith(alias + '/') ||
        (firstWildcard >= 0 && alias.startsWith(pattern.slice(0, firstWildcard)))) {
      return true;
    }
  }
  const pieces = pattern.split('\x01');
  for (const target of deleted) {
    let offset = 0, matched = true;
    if (!target.startsWith(pieces[0])) continue;
    offset = pieces[0].length;
    for (let i = 1; i < pieces.length; i++) {
      const part = pieces[i];
      if (!part) continue;
      const at = target.indexOf(part, offset);
      if (at < 0) { matched = false; break; }
      offset = at + part.length;
    }
    if (matched && target.endsWith(pieces.at(-1))) return true;
  }
  return false;
}

function refersToDeletedMarkdown(source, raw, deleted) {
  let link;
  try { link = destination(raw); }
  catch {
    // Do not block an unrelated deletion for a pre-existing destination using
    // a valid but unsupported HTML5 entity. However an unknown expansion that
    // could name a deleted Markdown file MUST still fail closed.
    if (couldUnparsedDestinationNameDeleted(source, raw, deleted)) {
      throw new Error('Unparseable inbound destination; fail closed');
    }
    return false;
  }
  if (!link || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(link)) return false;
  const hash = link.indexOf('#'), query = link.indexOf('?');
  const end = Math.min(hash < 0 ? link.length : hash, query < 0 ? link.length : query);
  let filename, anchor;
  try {
    filename = decodeURIComponent(link.slice(0, end));
    anchor = hash < 0 ? '' : decodeURIComponent(link.slice(hash + 1));
  } catch { return false; }
  if (!filename || filename.includes('\0') || filename.includes('\\')) return false;
  const absolute = filename.startsWith('/')
    ? path.resolve(root, '.' + filename)
    : path.resolve(root, path.dirname(source), filename);
  if (!withinRoot(absolute)) return false;
  const paths = [absolute];
  // BASE was the state in which this unchanged source link was valid.
  // Merge-worktree realpaths are attacker-controlled and may hide old aliases.
  // Resolve ALL base path components, including a surviving final symlink
  // whose target Markdown file was removed by the PR.
  const canonicalBase = resolveBaseParentAliases(absolute);
  if (withinRoot(canonicalBase)) paths.push(canonicalBase);
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

// Pinned Unicode 15.1 default (locale-independent) full case-fold differences
// from simple lowercasing. Generated from Python's UCD 15.1 casefold data;
// each "codepoint:result,codepoints" entry is a fold that simple lowercase
// cannot express. No NFKC compatibility normalization: CommonMark compares
// Unicode case-folded LABEL TEXT, with literal backslash escapes preserved.
// Do not add dependencies or locale-sensitive Intl.Collator comparisons here.
const CASEFOLD_EXCEPTIONS_15_1 = new Map(`
b5:3bc
df:73,73
149:2bc,6e
17f:73
1f0:6a,30c
345:3b9
390:3b9,308,301
3b0:3c5,308,301
3c2:3c3
3d0:3b2
3d1:3b8
3d5:3c6
3d6:3c0
3f0:3ba
3f1:3c1
3f5:3b5
587:565,582
1c80:432
1c81:434
1c82:43e
1c83:441
1c84:442
1c85:442
1c86:44a
1c87:463
1c88:a64b
1e96:68,331
1e97:74,308
1e98:77,30a
1e99:79,30a
1e9a:61,2be
1e9b:1e61
1e9e:73,73
1f50:3c5,313
1f52:3c5,313,300
1f54:3c5,313,301
1f56:3c5,313,342
1f80:1f00,3b9
1f81:1f01,3b9
1f82:1f02,3b9
1f83:1f03,3b9
1f84:1f04,3b9
1f85:1f05,3b9
1f86:1f06,3b9
1f87:1f07,3b9
1f88:1f00,3b9
1f89:1f01,3b9
1f8a:1f02,3b9
1f8b:1f03,3b9
1f8c:1f04,3b9
1f8d:1f05,3b9
1f8e:1f06,3b9
1f8f:1f07,3b9
1f90:1f20,3b9
1f91:1f21,3b9
1f92:1f22,3b9
1f93:1f23,3b9
1f94:1f24,3b9
1f95:1f25,3b9
1f96:1f26,3b9
1f97:1f27,3b9
1f98:1f20,3b9
1f99:1f21,3b9
1f9a:1f22,3b9
1f9b:1f23,3b9
1f9c:1f24,3b9
1f9d:1f25,3b9
1f9e:1f26,3b9
1f9f:1f27,3b9
1fa0:1f60,3b9
1fa1:1f61,3b9
1fa2:1f62,3b9
1fa3:1f63,3b9
1fa4:1f64,3b9
1fa5:1f65,3b9
1fa6:1f66,3b9
1fa7:1f67,3b9
1fa8:1f60,3b9
1fa9:1f61,3b9
1faa:1f62,3b9
1fab:1f63,3b9
1fac:1f64,3b9
1fad:1f65,3b9
1fae:1f66,3b9
1faf:1f67,3b9
1fb2:1f70,3b9
1fb3:3b1,3b9
1fb4:3ac,3b9
1fb6:3b1,342
1fb7:3b1,342,3b9
1fbc:3b1,3b9
1fbe:3b9
1fc2:1f74,3b9
1fc3:3b7,3b9
1fc4:3ae,3b9
1fc6:3b7,342
1fc7:3b7,342,3b9
1fcc:3b7,3b9
1fd2:3b9,308,300
1fd3:3b9,308,301
1fd6:3b9,342
1fd7:3b9,308,342
1fe2:3c5,308,300
1fe3:3c5,308,301
1fe4:3c1,313
1fe6:3c5,342
1fe7:3c5,308,342
1ff2:1f7c,3b9
1ff3:3c9,3b9
1ff4:3ce,3b9
1ff6:3c9,342
1ff7:3c9,342,3b9
1ffc:3c9,3b9
fb00:66,66
fb01:66,69
fb02:66,6c
fb03:66,66,69
fb04:66,66,6c
fb05:73,74
fb06:73,74
fb13:574,576
fb14:574,565
fb15:574,56b
fb16:57e,576
fb17:574,56d
`.trim().split(/\s+/).map(item => {
  const [code, folded] = item.split(':');
  return [Number.parseInt(code, 16), String.fromCodePoint(
    ...folded.split(',').map(n => Number.parseInt(n, 16)))];
}));
function unicodeCaseFold15_1(input) {
  let result = '';
  for (const scalar of input) {
    const code = scalar.codePointAt(0);
    // Cherokee folds to the UPPERCASE blocks rather than the small letters.
    if (code >= 0x13a0 && code <= 0x13f5) result += scalar;
    else if (code >= 0x13f8 && code <= 0x13fd) result += String.fromCodePoint(code - 8);
    else if (code >= 0xab70 && code <= 0xabbf) result += String.fromCodePoint(code - 0x97d0);
    else result += CASEFOLD_EXCEPTIONS_15_1.get(code) ?? scalar.toLowerCase();
  }
  return result;
}
function referenceLabel(raw) {
  // CommonMark reference-label whitespace is ASCII space, tab, CR and LF.
  // NBSP and other Unicode whitespace are significant label characters.
  // Preserve backslash punctuation exactly (distinct keys).
  return unicodeCaseFold15_1(raw.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '')
    .replace(/[ \t\r\n]+/g, ' '));
}

function* inlineLinks(text) {
  // Non-overlapping escape alternatives, bounded labels and linear
  // destination scanning. Incomplete syntax remains eligible as a shortcut.
  const labels = /!?\[(?:\\.|[^\[\]\\\n]){0,512}\]\(/g;
  for (const candidate of text.matchAll(labels)) {
    const start = candidate.index + candidate[0].length;
    const limit = Math.min(text.length, start + 4096);
    // Leading whitespace may precede an angle-wrapped destination.
    let angleStart = start;
    while (angleStart < limit && (text[angleStart] === ' ' || text[angleStart] === '\t')) angleStart++;
    let depth = 0, rawEnd = -1, angle = text[angleStart] === '<', title = null;
    let whitespace = false, destinationSeen = false;
    for (let i = start; i < limit; i++) {
      const ch = text[i];
      if (ch === '\n') break;
      if (ch === '\\' && i + 1 < limit) {
        if (angle && text[i + 1] === '>') break; // Invalid escaped delimiter.
        i++;
        continue;
      }
      if (angle) {
        if (ch === '>') { angle = false; destinationSeen = true; }
        else if (ch === '<' && i !== angleStart) break;
        continue;
      }
      if (title !== null) {
        if (ch === title) title = null;
        continue;
      }
      if ((ch === '"' || ch === "'" || ch === '(') && whitespace && destinationSeen && depth === 0) {
        title = ch === '(' ? ')' : ch;
        whitespace = false;
        continue;
      }
      if (ch === ' ' || ch === '\t') {
        if (depth === 0) whitespace = true;
        continue;
      }
      if (whitespace && destinationSeen && depth === 0 && ch !== ')') break; // Invalid trailing title syntax.
      whitespace = false;
      if (ch === '(') { if (++depth > 1) break; }
      else if (ch === ')') {
        if (depth) depth--;
        else { rawEnd = i; break; }
      } else destinationSeen = true;
    }
    if (rawEnd < 0) continue;
    yield { index: candidate.index, opener: candidate.index +
      (candidate[0][0] === '!' ? 1 : 0), raw: text.slice(start, rawEnd) };
  }
}

function validateMarkdown(filename, deletedTargets = null, budget = null) {
  let resolved;
  try { resolved = localFile(filename); } catch { fail(safe(filename) + ': missing/unsafe Markdown'); return; }
  const stat = fs.statSync(resolved);
  if (!stat.isFile() || stat.size > 1024 * 1024) { fail(safe(filename) + ': unsupported file or >1MiB'); return; }
  if (budget && (budget.bytes -= stat.size) < 0) throw new Error('Inbound Markdown scan byte budget exceeded');
  const text = removeCode(fs.readFileSync(resolved, 'utf8'));
  const lineOf = lineLookup(text);
  const refs = new Map(), definitionLabelOffsets = new Set();
  function definitionCanStartAt(offset) {
    // Definitions cannot interrupt an open paragraph. The bounded pilot
    // supports up to four blockquote markers before a definition.
    const end = text.lastIndexOf('\n', offset - 1);
    if (end < 0) return true;
    const start = text.lastIndexOf('\n', end - 1) + 1;
    const prior = text.slice(start, end).replace(/^ {0,3}(?:>[ \t]?){0,4}/, '').trim();
    if (!prior) return true;
    if (/^#{1,6}[ \t]+/.test(prior)) return true; // Heading closes a paragraph.
    if (/^\[(?:\\.|[^\]\\\n]){1,512}\]:[ \t]+/.test(prior)) return true;
    return false;
  }
  for (const match of text.matchAll(/^ {0,3}(?:>[ \t]?){0,4}\[((?:\\.|[^\]\\\n]){1,512})\]:[ \t]*(<(?:\\.|[^\\>\n]){1,4096}>|[^\s]{1,4096})(?:[ \t]+(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\((?:\\.|[^)\\\n])*\)))?[ \t]*$/gm)) {
    if (escapedAt(text, match.index)) continue;
    if (!definitionCanStartAt(match.index)) continue;
    if (hasEscapedAngleDelimiter(match[2])) continue; // Not a valid definition.
    definitionLabelOffsets.add(match.index + match[0].indexOf('['));
    const id = referenceLabel(match[1]);
    if (refs.has(id)) continue; // First definition of each label wins.
    if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
    refs.set(id, { destination: match[2], line: lineOf(match.index) });
    if (!deletedTargets) checkLink(filename, match[2], lineOf(match.index));
  }
  // Scoped syntax: one parenthesis nesting level, 512-char link labels,
  // 4096-char destinations; unsupported advanced Markdown is NOT RUN.
  const inlineOpeners = new Set();
  for (const match of inlineLinks(text)) {
    if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
    if (escapedAt(text, match.opener)) continue;
    inlineOpeners.add(match.opener);
    if (!deletedTargets || refersToDeletedMarkdown(filename, match.raw, deletedTargets)) {
      checkLink(filename, match.raw, lineOf(match.index));
    }
  }
  const used = new Set(), referenceSuffixStarts = new Set(), referenceOpeners = new Set();
  for (const match of text.matchAll(/!?\[((?:\\.|[^\[\]\\\n]){1,512})\]\[((?:\\.|[^\[\]\\\n]){0,512})\]/g)) {
    // Consume an explicit reference's second [label] even if its first
    // bracket is escaped. Other text ending with ']' is not a reference.
    referenceSuffixStarts.add(match.index + match[0].lastIndexOf('['));
    if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
    const opener = match.index + (match[0][0] === '!' ? 1 : 0);
    if (escapedAt(text, opener)) continue;
    referenceOpeners.add(opener);
    const id = referenceLabel(match[2] || match[1]);
    if (deletedTargets) used.add(id);
    else if (!refs.has(id)) {
      fail(safe(filename) + ': undefined reference label ' + safe(id) + ' [' + safe(filename) + ':' + lineOf(match.index) + ']');
    }
  }
  if (deletedTargets) {
    // Standard shortcut references: [label] or ![alt] when a definition exists.
    // Ignore definitions, explicit/inline link openers, and backslash literals.
    for (const match of text.matchAll(/!?\[((?:\\.|[^\[\]\\\n]){1,512})\]/g)) {
      if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
      const opener = match.index + (match[0][0] === '!' ? 1 : 0);
      if (escapedAt(text, opener)) continue;
      if (referenceSuffixStarts.has(match.index)) continue;
      const after = text[match.index + match[0].length] || '';
      if (definitionLabelOffsets.has(match.index) || inlineOpeners.has(opener) || referenceOpeners.has(opener)) continue;
      const id = referenceLabel(match[1]);
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
