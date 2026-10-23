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

function isBlockInterruption(raw) {
  // Inline constructs cannot cross a block boundary. Recognize the CommonMark
  // HTML block openers, ATX headings, block quotes, list items, thematic breaks,
  // setext underlines and code fences.
  const htmlBlock = /^ {0,3}(?:<!--|<\?|<![A-Z]|<!\[CDATA\[|<(?:script|pre|style|textarea)(?=[ \t>]|$)|<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|nav|noframes|ol|optgroup|option|output|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?=[ \t/>]|$)|<\/(?:script|pre|style|textarea)(?=[ \t/>]|$))/i;
  return htmlBlock.test(raw) || /^ {0,3}(?:#{1,6}(?:[ \t]|$)|>|(?:[-+*]|1[.)])[ \t]+|(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})$|=+[ \t]*$|`{3,}|~{3,})/.test(raw);
}

function hasInterveningBlockBoundary(text, begin, end) {
  let nl = text.indexOf('\n', begin);
  while (nl !== -1 && nl < end) {
    const nextNl = text.indexOf('\n', nl + 1);
    const lineEnd = nextNl === -1 ? text.length : nextNl;
    const fullLine = text.slice(nl + 1, lineEnd);
    if (/^[ \t]*\r?$/.test(fullLine) || isBlockInterruption(fullLine)) {
      return true;
    }
    nl = nextNl;
  }
  return false;
}

const LINK_LABEL_LIMIT = 512;

function codeSpanRanges(text, from, to) {
  const ranges = [];
  const slice = text.slice(from, to);
  const runs = [...slice.matchAll(/`+/g)];
  for (let i = 0; i < runs.length; i++) {
    const opener = runs[i];
    if (escapedAt(text, from + opener.index)) continue;
    const len = opener[0].length;
    let closer = null;
    for (let j = i + 1; j < runs.length; j++) {
      if (runs[j][0].length === len) {
        const between = text.slice(from + opener.index, from + runs[j].index);
        if (!/\n[ \t]*\n/.test(between)) {
          closer = runs[j];
          i = j;
          break;
        }
      }
    }
    if (closer) {
      ranges.push({
        start: from + opener.index,
        end: from + closer.index + len,
      });
    }
  }
  return ranges;
}
function hasMatchingLinkOpener(text, bracket) {
  let depth = 1;
  const minIndex = Math.max(0, bracket - LINK_LABEL_LIMIT - 1);
  const rawIgnored = [
    ...codeSpanRanges(text, minIndex, bracket),
    ...htmlTagRanges(text.slice(minIndex, bracket)).map(r => ({ start: minIndex + r.start, end: minIndex + r.end })),
  ].sort((a, b) => a.start - b.start || a.end - b.end);
  const ignored = [];
  let curEnd = 0;
  for (const r of rawIgnored) {
    if (ignored.length && r.start <= curEnd) {
      curEnd = Math.max(curEnd, r.end);
      ignored.at(-1).end = curEnd;
    } else {
      curEnd = r.end;
      ignored.push({ start: r.start, end: r.end });
    }
  }
  for (let k = bracket - 1; k >= minIndex; k--) {
    if (inRanges(ignored, k)) continue;
    if (text[k] === '\n') {
      let probe = k - 1;
      while (probe >= minIndex && (text[probe] === ' ' || text[probe] === '\t')) probe--;
      if (probe >= minIndex && text[probe] === '\n') return false;
    }
    if (text[k] === ']' && !escapedAt(text, k)) {
      depth++;
    } else if (text[k] === '[' && !escapedAt(text, k)) {
      depth--;
      if (depth === 0) {
        const inner = text.slice(k + 1, bracket);
        let innerTail = 0;
        while ((innerTail = inner.indexOf('](', innerTail)) >= 0) {
          if (!escapedAt(inner, innerTail) && parseInlineTail(inner, innerTail + 1)) {
            let img = false, d = 1;
            for (let j = innerTail - 1; j >= 0; j--) {
              if (inner[j] === ']' && !escapedAt(inner, j)) d++;
              else if (inner[j] === '[' && !escapedAt(inner, j)) {
                if (--d === 0) {
                  img = j > 0 && inner[j - 1] === '!' && !escapedAt(inner, j - 1);
                  break;
                }
              }
            }
            if (!img) return false;
          }
          innerTail += 2;
        }
        return true;
      }
    }
  }
  return false;
}
function removeCode(markdown) {
  // Bounded, order-sensitive Markdown masking. Preserve newlines and offsets.
  // Multiline code spans and HTML comments cannot change fence ownership.
  const lines = markdown.split(/\r\n|\n|\r/);
  // Front matter is metadata, not inline Markdown. An unmatched opener
  // remains ordinary text so it cannot hide live links.
  let frontMatterEnd = -1;
  if (lines[0] === '---') {
    for (let j = 1; j < lines.length; j++) {
      if (/^(?:---|\.\.\.)[ \t]*$/.test(lines[j])) {
        frontMatterEnd = j;
        break;
      }
    }
  }
  let fenced = null, comment = false, commentContainer = null, commentIsBlock = false;
  let rawBlock = null, listIndent = null, inlineTicks = 0;
  let pendingHtmlScanBytes = 0;
  let paragraphOpen = false;
  const laterCommentCloser = new Array(lines.length + 1).fill(false);
  for (let i = lines.length - 1; i >= 0; i--) {
    laterCommentCloser[i] = lines[i].includes('-->') || laterCommentCloser[i + 1];
  }
  const multilineProtectedRanges = [];
  let searchTail = 0;
  while (searchTail < markdown.length) {
    const bracket = markdown.indexOf('](', searchTail);
    if (bracket < 0) break;
    if (!escapedAt(markdown, bracket) && hasMatchingLinkOpener(markdown, bracket)) {
      const tail = parseInlineTail(markdown, bracket + 1);
      if (tail) {
        multilineProtectedRanges.push({ start: bracket + 1, end: tail.end });
        searchTail = tail.end;
        continue;
      }
    }
    searchTail = bracket + 2;
  }
  for (const m of markdown.matchAll(/^ {0,3}\[([^\]]+)\]:[ \t]*/gm)) {
    const parsedDef = parseReferenceDefinition(markdown, m.index + m[0].indexOf('['), markdown.length);
    if (parsedDef) {
      multilineProtectedRanges.push({ start: m.index + m[0].length, end: parsedDef.end });
    }
  }
  multilineProtectedRanges.sort((a, b) => a.start - b.start || a.end - b.end);

  function idTagsOnly(line, ranges = htmlTagRanges(line)) {
    // Preserve explicit anchors for BASE heading validation even inside
    // raw HTML blocks while keeping line lengths and offsets aligned.
    let result = '', last = 0;
    for (const range of ranges) {
      const tag = line.slice(range.start, range.end);
      if (/\sid\s*=/i.test(tag)) {
        result += ' '.repeat(range.start - last) + tag;
        last = range.end;
      }
    }
    result += ' '.repeat(line.length - last);
    return result;
  }

  function continuingContainer(state, containerLine, lineInList) {
    let content = containerLine;
    let continues = !state.outerListIndent || lineInList;
    for (const part of state.containers || []) {
      if (!continues) break;
      if (part.kind === 'quote') {
        const prefix = /^ {0,3}>[ \t]?/.exec(content);
        if (!prefix) continues = false;
        else content = content.slice(prefix[0].length);
      } else if (!content.startsWith(' '.repeat(part.indent))) continues = false;
      else content = content.slice(part.indent);
    }
    return { continues, content };
  }

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
  function laterCommentCloserInline(index, openerContainer, outerListIndent) {
    let inspected = 0;
    for (let j = index + 1; j < lines.length && j - index <= 32; j++) {
      const lineInList = outerListIndent !== null &&
        lines[j].startsWith(' '.repeat(outerListIndent));
      const containerLine = lineInList ? lines[j].slice(outerListIndent) : lines[j];
      const rawLine = lines[j];
      const continuation = continuingContainer(
        { containers: openerContainer.containers, outerListIndent }, containerLine, lineInList);
      if (!continuation.continues && !openerContainer.containers?.some(p => p.kind === 'quote')) return false;
      const candidate = continuation.continues ? continuation.content : rawLine;
      const isBlank = /^[ \t]*$/.test(candidate);
      const isInterruption = isBlockInterruption(candidate);
      if (isBlank || isInterruption) return false;
      inspected += candidate.length + 1;
      if (inspected > 8192) return false;
      if (candidate.includes('-->')) return true;
    }
    return false;
  }

  function laterClosingTicks(index, count, openerContainer, outerListIndent) {
    let inspected = 0;
    for (let j = index + 1; j < lines.length && j - index <= 32; j++) {
      const lineInList = outerListIndent !== null &&
        lines[j].startsWith(' '.repeat(outerListIndent));
      const containerLine = lineInList ? lines[j].slice(outerListIndent) : lines[j];
      const rawLine = lines[j];
      const continuation = continuingContainer(
        { containers: openerContainer.containers, outerListIndent }, containerLine, lineInList);
      // An inline code span cannot cross the blockquote/list container that
      // owns its opener, unless it is a lazy blockquote continuation.
      if (!continuation.continues && !openerContainer.containers?.some(p => p.kind === 'quote')) return false;
      const candidate = continuation.continues ? continuation.content : rawLine;
      const isBlank = /^[ \t]*$/.test(candidate);
      const isInterruption = isBlockInterruption(candidate);
      if (isBlank || isInterruption) return false;
      inspected += candidate.length + 1;
      if (inspected > 8192) return false; // Do not suppress uncertain live links.
      // Do not mistake a later fenced code marker for an inline-code closer.
      if (/^ {0,3}(?:`{3,}|~{3,})/.test(candidate)) return false;
      if (closingTicks(candidate, 0, count)) return true;
    }
    return false;
  }

  let lineStartOffset = 0;
  return lines.map((line, lineIndex) => {
    const currentLineOffset = lineStartOffset;
    lineStartOffset += line.length + 1;
    if (frontMatterEnd >= 0 && lineIndex <= frontMatterEnd) return ' '.repeat(line.length);
    // A list item's continuation indentation is a container prefix, not
    // indented code. Match fences after removing that active prefix.
    const activeListIndent = listIndent;
    const lineInList = activeListIndent !== null && line.startsWith(' '.repeat(activeListIndent));
    const containerLine = lineInList ? line.slice(listIndent) : line;
    const continuationInput = state =>
      state.outerListIndent === null && lineInList &&
        state.containers?.some(part => part.kind === 'list') ? line : containerLine;
    if (fenced) {
      const continuation = continuingContainer(fenced, continuationInput(fenced), lineInList);
      if (continuation.continues) {
        const closer = continuation.content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
        if (closer && closer[1][0] === fenced.marker &&
            closer[1].length >= fenced.count && /^[ \t]*$/.test(closer[2])) fenced = null;
        paragraphOpen = false;
        return ' '.repeat(line.length);
      }
      fenced = null;
    }
    const container = markdownContainer(containerLine, paragraphOpen);
    // Apply this only when opening a new container below. List-like text in
    // an existing fence/raw block/comment is literal and must not mutate the
    // outer list continuation state.
    const updateListIndent = () => {
      if (container.listIndent) {
        listIndent = (lineInList ? activeListIndent : 0) + container.listIndent;
      }
    };
    const fence = container.content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (comment && !commentIsBlock) {
      const continuation = continuingContainer(
        commentContainer ? commentContainer : { containers: [] },
        lineInList && commentContainer ? line.slice(activeListIndent) : line, lineInList);
      const isBlank = /^[ \t]*$/.test(line);
      const isInterruption = isBlockInterruption(line);
      const isLazy = !isBlank && !isInterruption && commentContainer?.containers?.some(p => p.kind === 'quote');
      if ((!continuation.continues && !isLazy) || isBlank || isInterruption) {
        comment = false;
        commentContainer = null;
      }
    } else if (comment && commentContainer &&
        !continuingContainer(commentContainer, continuationInput(commentContainer), lineInList).continues) {
      comment = false;
      commentContainer = null;
    }
    if (rawBlock) {
      // A block opened inside a blockquote/list ends when that container
      // ends. Never mask a live link on the first line outside it.
      const { continues, content: blockLine } = continuingContainer(
        rawBlock, continuationInput(rawBlock), lineInList);
      if (!continues) rawBlock = null;
      else {
        // Type 6 ends on a blank line; type 1 ends on its closing tag.
        if (rawBlock.endOnBlank && /^[ \t]*$/.test(blockLine)) {
          rawBlock = null;
          paragraphOpen = false;
          return ' '.repeat(line.length);
        }
        if (rawBlock.pendingTag) {
          const prevTag = rawBlock.pendingTag;
          rawBlock.pendingTag += '\n' + blockLine;
          if (rawBlock.pendingTag.length > 4096) failParserBound();
          let keptLine = ' '.repeat(line.length);
          if (blockLine.includes('>')) {
            pendingHtmlScanBytes += rawBlock.pendingTag.length;
            if (pendingHtmlScanBytes > 16 * 1024 * 1024) failParserBound();
            const ranges = htmlTagRanges(rawBlock.pendingTag);
            if (ranges.length && /\sid\s*=/i.test(rawBlock.pendingTag.slice(ranges[0].start, ranges[0].end))) {
              const tagEndOnLine = ranges[0].end - (prevTag.length + 1);
              keptLine = line.slice(0, tagEndOnLine) + ' '.repeat(line.length - tagEndOnLine);
            }
            rawBlock.pendingTag = null;
          }
          if (!rawBlock.endOnBlank && !rawBlock.terminator &&
              /<\/(?:script|pre|style|textarea)\s*>/i.test(blockLine)) rawBlock = null;
          paragraphOpen = false;
          return keptLine;
        }
        if (rawBlock.terminator && blockLine.includes(rawBlock.terminator)) rawBlock = null;
        else if (!rawBlock.endOnBlank && !rawBlock.terminator &&
            /<\/(?:script|pre|style|textarea)\s*>/i.test(blockLine)) rawBlock = null;
        paragraphOpen = false;
        return idTagsOnly(line);
      }
    }
    if (!comment && !inlineTicks && fence &&
        !(fence[1][0] === '`' && fence[2].includes('`'))) {
      updateListIndent();
      fenced = { marker: fence[1][0], count: fence[1].length,
        containers: container.containers,
        outerListIndent: lineInList ? activeListIndent : null };
      paragraphOpen = false;
      return ' '.repeat(line.length);
    }
    if (!comment && !inlineTicks) {
      updateListIndent();
      const container = markdownContainer(containerLine, paragraphOpen);
      const special = /^ {0,3}(<\?|<!\[CDATA\[|<![A-Z])/.exec(
        container.content);
      if (special) {
        const terminator = special[1] === '<?' ? '?>' : special[1] === '<![CDATA[' ? ']]>' : '>';
        if (!container.content.includes(terminator, special[0].length)) {
          rawBlock = { terminator, quoteDepth: container.quoteDepth,
            listIndent: container.listIndent, containers: container.containers,
            outerListIndent: lineInList ? activeListIndent : null };
        }
        paragraphOpen = false;
        return ' '.repeat(line.length);
      }
      const type1 = container.content.match(/^ {0,3}<(script|pre|style|textarea)(?=[ \t>]|$)/i);
      if (type1) {
        const tag = type1[1].toLowerCase();
        if (!/<\/(?:script|pre|style|textarea)\s*>/i.test(container.content.slice(type1[0].length))) {
          rawBlock = { tag, endOnBlank: false, quoteDepth: container.quoteDepth,
            listIndent: container.listIndent, containers: container.containers,
            outerListIndent: lineInList ? activeListIndent : null };
          rawBlock.pendingTag = htmlTagRanges(line).length ? null : line;
        }
        paragraphOpen = false;
        return idTagsOnly(line);
      }
      const type6 = container.content.match(/^ {0,3}(?:<\/?(address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|nav|noframes|ol|optgroup|option|output|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)|<\/(script|pre|style|textarea))(?=[ \t/>]|$)/i);
      if (type6) {
        const tag = (type6[1] || type6[2]).toLowerCase();
        rawBlock = { tag, endOnBlank: true, quoteDepth: container.quoteDepth,
          listIndent: container.listIndent, containers: container.containers,
          outerListIndent: lineInList ? activeListIndent : null };
        rawBlock.pendingTag = htmlTagRanges(line).length ? null : line;
        paragraphOpen = false;
        return rawBlock.pendingTag ? line : idTagsOnly(line);
      }
      if (!paragraphOpen) {
        const ranges = htmlTagRanges(container.content);
        if (ranges.length === 1 && ranges[0].start <= 3 &&
            /^[ \t]*$/.test(container.content.slice(0, ranges[0].start)) &&
            /^[ \t]*$/.test(container.content.slice(ranges[0].end))) {
          const tagMatch = container.content.slice(ranges[0].start).match(/^<\/??([A-Za-z][A-Za-z0-9-]*)/);
          const tag = tagMatch ? tagMatch[1].toLowerCase() : '';
          if (tag && !/^(?:script|style|textarea)$/.test(tag)) {
            rawBlock = { tag, endOnBlank: true, quoteDepth: container.quoteDepth,
              listIndent: container.listIndent, containers: container.containers,
              outerListIndent: lineInList ? activeListIndent : null };
            paragraphOpen = false;
            return idTagsOnly(line);
          }
        }
      }
      const list = line.match(/^ {0,3}(?:[-+*]|\d{1,9}[.)])\s+/);
      if (list) { listIndent = list[0].length; paragraphOpen = false; }
      else if (!/^[ \t]*$/.test(line) && listIndent !== null &&
          !line.startsWith(' '.repeat(listIndent))) listIndent = null;
      const indent = (line.match(/^ */) || [''])[0].length;
      if ((indent >= 4 || line.startsWith('\t')) && !paragraphOpen &&
          (listIndent === null || indent < listIndent || indent >= listIndent + 4)) return ' '.repeat(line.length);
      if (container.quoteDepth > 0 && !paragraphOpen) {
        const quotedIndent = (container.content.match(/^ */) || [''])[0].length;
        if ((quotedIndent >= 4 || container.content.startsWith('\t')) &&
            (!container.listIndent || quotedIndent >= container.listIndent + 4)) return ' '.repeat(line.length);
      }
    }

    let visible = '', from = 0;
    const inlineTagRanges = htmlTagRanges(line);
    const protectedRanges = [...inlineTagRanges];
    let tailSearch = 0;
    while (tailSearch < line.length) {
      const bracket = line.indexOf('](', tailSearch);
      if (bracket < 0) break;
      if (!escapedAt(line, bracket) && hasMatchingLinkOpener(line, bracket)) {
        const tail = parseInlineTail(line, bracket + 1);
        if (tail) {
          protectedRanges.push({ start: bracket + 1, end: tail.end });
          tailSearch = tail.end;
          continue;
        }
      }
      tailSearch = bracket + 2;
    }
    const defMatch = /^ {0,3}\[([^\]]+)\]:[ \t]*/.exec(line);
    if (defMatch) {
      const parsedDef = parseReferenceDefinition(line, line.indexOf('['), line.length);
      if (parsedDef) {
        protectedRanges.push({ start: defMatch[0].length, end: parsedDef.end });
      }
    }
    protectedRanges.sort((a, b) => a.start - b.start || a.end - b.end);
    const mergedProtected = [];
    let curEnd = 0;
    for (const r of protectedRanges) {
      if (mergedProtected.length && r.start <= curEnd) {
        curEnd = Math.max(curEnd, r.end);
        mergedProtected.at(-1).end = curEnd;
      } else {
        curEnd = r.end;
        mergedProtected.push({ start: r.start, end: r.end });
      }
    }
    const insideProtected = index =>
      inRanges(mergedProtected, index) || inRanges(multilineProtectedRanges, currentLineOffset + index);
    // ATX headings cannot contain line breaks; an unclosed backtick cannot span lines.
    const isAtxHeading = /^ {0,3}#{1,6}(?:[ \t]|$)/.test(container.content);
    // Cache the next unescaped backtick run and comment opener. Recomputing
    // either from every comment would rescan the same suffix repeatedly.
    let cachedTick, cachedTickFrom = -1, cachedOpener = -1, cachedOpenerFrom = Infinity;
    function unescapedTick(startAt) {
      if (cachedTick !== undefined && cachedTickFrom <= startAt &&
          (cachedTick === null || cachedTick.index >= startAt)) return cachedTick;
      const runs = /`+/g;
      runs.lastIndex = startAt;
      let run;
      while ((run = runs.exec(line))) {
        if (escapedAt(line, run.index)) {
          if (run[0].length > 1) {
            const remainder = { 0: run[0].slice(1), index: run.index + 1 };
            if (!insideProtected(remainder.index)) {
              cachedTick = remainder;
              cachedTickFrom = startAt;
              return remainder;
            }
          }
          continue;
        }
        if (!insideProtected(run.index)) {
          cachedTick = run;
          cachedTickFrom = startAt;
          return run;
        }
      }
      cachedTick = null;
      cachedTickFrom = startAt;
      return null;
    }
    function unescapedComment(startAt) {
      if (cachedOpenerFrom <= startAt && (cachedOpener < 0 || cachedOpener >= startAt)) {
        return cachedOpener;
      }
      let opener = line.indexOf('<!--', startAt);
      while (opener >= 0 && (escapedAt(line, opener) || insideProtected(opener))) {
        opener = line.indexOf('<!--', opener + 4);
      }
      cachedOpener = opener;
      cachedOpenerFrom = startAt;
      return opener;
    }
    let cachedCloser = -1, cachedCloserFrom = 0;
    function hasSameLineCommentCloser(startAt) {
      if (cachedCloser >= startAt) return true;
      if (cachedCloser < -1 && cachedCloserFrom <= startAt) return false;
      const at = line.indexOf('-->', startAt);
      cachedCloser = at >= 0 ? at : -2;
      cachedCloserFrom = startAt;
      return at >= 0;
    }
    while (from < line.length) {
      if (comment) {
        const end = line.indexOf('-->', from);
        if (end < 0) { visible += ' '.repeat(line.length - from); break; }
        if (commentIsBlock) {
          visible += ' '.repeat(line.length - from);
          comment = false;
          commentIsBlock = false;
          break;
        }
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
      const tick = unescapedTick(from);
      const opener = unescapedComment(from);
      if (tick && (opener < 0 || tick.index < opener)) {
        const closer = closingTicks(line, tick.index + tick[0].length, tick[0].length);
        if (closer) {
          visible += line.slice(from, tick.index) +
            ' '.repeat(closer.index + closer[0].length - tick.index);
          from = closer.index + closer[0].length;
        } else if (!isAtxHeading && laterClosingTicks(lineIndex, tick[0].length, container,
          lineInList ? activeListIndent : null)) {
          visible += line.slice(from, tick.index) + ' '.repeat(line.length - tick.index);
          inlineTicks = tick[0].length;
          break;
        } else {
          visible += line.slice(from, tick.index + tick[0].length);
          from = tick.index + tick[0].length;
        }
      } else if (opener >= 0) {
        const openerShape = markdownContainer(containerLine, paragraphOpen);
        const blockStart = /^ {0,3}<!--/.test(openerShape.content);
        const hasSameLineCloser = hasSameLineCommentCloser(opener + 4);
        // Unclosed inline opener is literal text; unclosed block opener masks.
        if (!blockStart && !hasSameLineCloser && !laterCommentCloserInline(lineIndex, openerShape,
          lineInList ? activeListIndent : null)) {
          visible += line.slice(from, opener + 4);
          from = opener + 4;
          continue;
        }
        visible += line.slice(from, opener);
        from = opener;
        comment = true;
        commentIsBlock = blockStart;
        commentContainer = openerShape.quoteDepth || openerShape.listIndent || lineInList
          ? { containers: openerShape.containers,
              outerListIndent: lineInList ? activeListIndent : null }
          : null;
        if (commentIsBlock && hasSameLineCloser) {
          visible += ' '.repeat(line.length - from);
          comment = false;
          commentIsBlock = false;
          break;
        }
      } else {
        visible += line.slice(from);
        break;
      }
    }
    if (/^[ \t]*$/.test(line) || isAtxHeading ||
        /^ {0,3}(?:={2,}|-{2,})[ \t]*$/.test(line) ||
        /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})$/.test(line)) {
      paragraphOpen = false;
    } else if (!/^[ \t]*$/.test(visible) && !/^ {0,3}(?:>|[-+*][ \t]|\d{1,9}[.)][ \t])/.test(line)) {
      paragraphOpen = true;
    }
    return visible;
  }).join('\n');
}

const UNCERTAIN_HEADING_ENTITY = '\0unknown-heading-entity';
function stripClosedHeadingComments(text) {
  // Visit tags and comments in source order: attribute values own their '<!--'.
  const starts = /<!--|<\/?[A-Za-z][A-Za-z0-9-]*/g;
  let visible = '', cursor = 0, scanned = 0, match;
  const maxScanned = Math.min(4 * text.length + 4096, 2 * 1024 * 1024);
  const tick = () => {
    if (++scanned > maxScanned) throw new Error('Heading HTML scan budget exceeded; fail closed');
  };
  while ((match = starts.exec(text))) {
    const opener = match.index;
    if (escapedAt(text, opener)) continue;
    if (match[0] !== '<!--') {
      if (!/[\s/>]/.test(text[opener + match[0].length] || '')) continue;
      const end = parseHtmlTagEnd(text, opener, match[0].length, tick);
      if (end > opener) starts.lastIndex = end;
      continue;
    }
    const closer = text.indexOf('-->', opener + 4);
    if (closer < 0) break; // An unmatched opener needs only one suffix scan.
    visible += text.slice(cursor, opener);
    cursor = closer + 3;
    starts.lastIndex = cursor;
  }
  return visible + text.slice(cursor);
}
function protectHeadingCode(heading, spans, rawSpans = []) {
  let scanned = 0;
  const maxScanned = Math.min(4 * heading.length + 4096, 2 * 1024 * 1024);
  const tick = () => {
    if (++scanned > maxScanned) throw new Error('Heading HTML scan budget exceeded; fail closed');
  };
  // Preindex matching run lengths rather than repeatedly searching suffixes.
  const runs = [...heading.matchAll(/`+/g)], next = new Map();
  const closers = new Array(runs.length);
  for (let i = runs.length - 1; i >= 0; i--) {
    closers[i] = next.get(runs[i][0].length);
    next.set(runs[i][0].length, i);
  }

  const htmlStarts = /<!--|<\/?[A-Za-z][A-Za-z0-9-]*/g;
  let visible = '', cursor = 0, runIndex = 0;
  let nextMatch = null, hasClosingComment = true, htmlExhausted = false;

  function findNextHtmlOpener(from) {
    if (htmlExhausted) return null;
    if (nextMatch && nextMatch.index >= from) return nextMatch;
    htmlStarts.lastIndex = Math.max(from, htmlStarts.lastIndex);
    while ((nextMatch = htmlStarts.exec(heading))) {
      const opener = nextMatch.index;
      if (escapedAt(heading, opener)) continue;
      if (nextMatch[0] === '<!--') {
        if (!hasClosingComment) continue;
        return nextMatch;
      }
      if (!/[\s/>]/.test(heading[opener + nextMatch[0].length] || '')) continue;
      return nextMatch;
    }
    nextMatch = null;
    htmlExhausted = true;
    return null;
  }

  while (cursor < heading.length) {
    while (runIndex < runs.length && (runs[runIndex].index < cursor || escapedAt(heading, runs[runIndex].index) || closers[runIndex] === undefined)) {
      runIndex++;
    }
    const nextRun = runIndex < runs.length ? runs[runIndex] : null;
    const match = findNextHtmlOpener(cursor);

    if (!nextRun && !match) {
      visible += heading.slice(cursor);
      break;
    }

    if (nextRun && (!match || nextRun.index < match.index)) {
      const closer = runs[closers[runIndex]];
      const closerEnd = closer.index + closer[0].length;
      let inner = heading.slice(nextRun.index + nextRun[0].length, closer.index)
        .replace(/\r\n|\n|\r/g, ' ');
      if (inner.startsWith(' ') && inner.endsWith(' ') && /[^ ]/.test(inner)) inner = inner.slice(1, -1);
      visible += heading.slice(cursor, nextRun.index) + '\x01' + spans.length + '\x02';
      spans.push(inner);
      rawSpans.push(heading.slice(nextRun.index, closerEnd));
      cursor = closerEnd;
      runIndex = closers[runIndex] + 1;
      if (match && match.index < closerEnd) {
        nextMatch = null;
        htmlStarts.lastIndex = Math.max(htmlStarts.lastIndex, closerEnd);
      }
    } else {
      if (match[0] === '<!--') {
        const closer = heading.indexOf('-->', match.index + 4);
        if (closer < 0) {
          hasClosingComment = false;
          nextMatch = null;
          continue;
        }
        visible += heading.slice(cursor, match.index);
        cursor = closer + 3;
        nextMatch = null;
        htmlStarts.lastIndex = Math.max(htmlStarts.lastIndex, cursor);
      } else {
        const end = parseHtmlTagEnd(heading, match.index, match[0].length, tick);
        if (end <= match.index) {
          nextMatch = null;
          continue;
        }
        visible += heading.slice(cursor, match.index);
        cursor = end;
        nextMatch = null;
        htmlStarts.lastIndex = Math.max(htmlStarts.lastIndex, cursor);
      }
    }
  }

  return visible;
}
function headingSlug(heading, definedRefs = new Set()) {
  // Parse markup before decoding entities: encoded brackets and angle signs
  // are rendered text, never structural link or HTML delimiters.
  const spans = [], rawSpans = [];
  const protectedHeading = protectHeadingCode(heading, spans, rawSpans);
  // Unmatched code runs mixed with HTML leave slug interpretation uncertain.
  if (protectedHeading.includes('`') && /<[^>]*>/.test(protectedHeading)) return null;
  // Closed comments render no heading text. Code spans are already protected
  // by placeholders, so comment-shaped code content remains literal.
  const withoutComments = stripClosedHeadingComments(protectedHeading);
  let withoutTags = '', tagEnd = 0;
  for (const tag of htmlTagRanges(withoutComments)) {
    withoutTags += withoutComments.slice(tagEnd, tag.start);
    tagEnd = tag.end;
  }
  withoutTags += withoutComments.slice(tagEnd);
  const resolveHeadingLabel = label =>
    referenceLabel(label.replace(/\x01(\d+)\x02/g, (_m, idx) => rawSpans[Number(idx)] ?? ''));
  const headingRefs = {
    has(label) {
      return definedRefs.has(resolveHeadingLabel(label));
    },
  };
  const scannedLinks = scanBracketLinks(withoutTags, [], false, headingRefs);
  const linkSyntax = [
    ...scannedLinks.inlines,
    ...scannedLinks.fullRefs.filter(link => headingRefs.has(link.label)),
  ].flatMap(link => [{ start: link.opener, end: link.opener + 1 },
    { start: link.labelEnd ?? link.suffixStart - 1, end: link.end }])
    .sort((a, b) => a.start - b.start);
  let rendered = '', cursor = 0;
  for (const range of linkSyntax) {
    if (range.start > cursor) rendered += withoutTags.slice(cursor, range.start);
    cursor = Math.max(cursor, range.end);
  }
  rendered += withoutTags.slice(cursor);
  let uncertain = false;
  // Escapes and entities are one token stream; an escaped ampersand ('\&') must
  // not be decoded as an HTML entity delimiter.
  rendered = rendered.replace(/\\([!-/:-@\[-`{-~ ])|&(?:#(?:[xX][0-9a-fA-F]+|[0-9]+)|[A-Za-z][A-Za-z0-9]+);/g, (match, escaped) => {
    if (escaped !== undefined) return match;
    try { return decodeLinkEntities(match); }
    catch { uncertain = true; return ''; }
  });
  if (uncertain) return null;
  return rendered.replace(/\x01(\d+)\x02/g, (_match, index) => spans[Number(index)] || '')
    .replace(/\\([!-/:-@\[-`{-~ ])/g, '$1')
    .replace(/[\x60*_~]/g, '')
    .toLowerCase()
    .replace(/\t/g, ' ')
    .replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, '')
    .trim().replace(/ +/g, '-');
}

function markdownContainer(raw, paragraphOpen = false) {
  // Keep the opening container shape so HTML blocks stop masking when their
  // blockquote/list ends. Deep nesting exceeds this pilot's parser bound.
  let content = raw, quoteDepth = 0, listIndent = 0;
  const containers = [];
  for (let hop = 0; hop < 4; hop++) {
    const before = content;
    const quote = /^ {0,3}>[ \t]?/.exec(content);
    if (quote) {
      quoteDepth++;
      containers.push({ kind: 'quote' });
      content = content.slice(quote[0].length);
    }
    const list = /^ {0,3}(?:[-+*]|(\d{1,9})[.)])[ \t]+/.exec(content);
    if (list && (!paragraphOpen || !list[1] || list[1] === '1')) {
      listIndent += list[0].length;
      containers.push({ kind: 'list', indent: list[0].length });
      content = content.slice(list[0].length);
    }
    if (content === before) break;
  }
  const unconsumedContainer = paragraphOpen
    ? /^ {0,3}(?:>|(?:[-+*]|1[.)])[ \t]+)/.test(content)
    : /^ {0,3}(?:>|(?:[-+*]|\d{1,9}[.)])[ \t]+)/.test(content);
  if (unconsumedContainer) failParserBound();
  return { content, quoteDepth, listIndent, containers };
}
function headingContainerContent(raw, paragraphOpen = false) {
  return markdownContainer(raw, paragraphOpen).content;
}
function continuingHeadingContainer(shape, raw) {
  let content = raw;
  for (const part of shape.containers) {
    if (part.kind === 'quote') {
      const prefix = /^ {0,3}>[ \t]?/.exec(content);
      if (!prefix) return { continues: false };
      content = content.slice(prefix[0].length);
    } else {
      if (!content.startsWith(' '.repeat(part.indent))) return { continues: false };
      content = content.slice(part.indent);
    }
  }
  return { continues: true, content };
}
function headingsIn(text, original = text) {
  // Use masked text to decide which lines are headings, and the original
  // line to retain rendered inline-code text for baseline anchor slugs.
  const originalLines = original.split(/\r\n|\n|\r/);
  const found = new Set(), occurrences = new Map();
  // Only defined reference-style links contribute their rendered link text.
  // Undefined [text][id] remains literal heading text.
  const lines = text.split('\n');
  const lineStarts = new Array(lines.length);
  let curOffset = 0;
  for (let i = 0; i < lines.length; i++) {
    lineStarts[i] = curOffset;
    curOffset += lines[i].length + 1;
  }
  const definitionLines = new Set();
  const definedRefs = new Set();
  // Reference definitions in fenced code or other masked content are not live.
  const definitionText = normalizeReferenceContainers(text);
  const rawDefinitionText = normalizeReferenceContainers(original);
  const lastDefinitionClose = definitionText.lastIndexOf(']:');
  let priorDefinition = null, definitionCount = 0, defLine = 0;
  for (const ref of text.matchAll(/^ {0,3}(?:>[ \t]?){0,4}(?:(?:[-+*]|\d{1,9}[.)])[ \t]+)?\[/gm)) {
    if (priorDefinition && ref.index < priorDefinition.end) continue;
    if (!referenceDefinitionCanStart(text, ref.index, priorDefinition)) continue;
    const bracket = ref.index + ref[0].length - 1;
    const parsed = parseReferenceDefinition(definitionText, bracket, lastDefinitionClose, rawDefinitionText);
    if (parsed) {
      if (++definitionCount > 10000) failParserBound();
      priorDefinition = { start: ref.index, end: parsed.end };
      definedRefs.add(referenceLabel(parsed.label));
      while (defLine < lines.length && lineStarts[defLine] + lines[defLine].length < ref.index) {
        defLine++;
      }
      while (defLine < lines.length && lineStarts[defLine] < parsed.end) {
        definitionLines.add(defLine);
        defLine++;
      }
      if (defLine > 0) defLine--;
    }
  }
  const addSlug = heading => {
    const slug = headingSlug(heading, definedRefs);
    if (slug === null) { found.add(UNCERTAIN_HEADING_ENTITY); return; }
    if (!slug) return;
    // GitHub allocates duplicate suffixes globally. An explicit "foo-1"
    // can occupy the suffix of a later duplicate "foo".
    let suffix = occurrences.get(slug) || 0;
    let candidate = suffix ? slug + '-' + suffix : slug;
    while (found.has(candidate)) {
      if (++suffix > 10000) {
        found.add(UNCERTAIN_HEADING_ENTITY); // Bounded, fail closed.
        return;
      }
      candidate = slug + '-' + suffix;
    }
    found.add(candidate);
    occurrences.set(slug, suffix + 1);
  };
  // A complete leading YAML front-matter block is metadata, not a setext
  // heading. An unmatched opener is not masked.
  let frontMatterEnd = -1;
  if (lines[0] === '---') {
    for (let j = 1; j < lines.length; j++) {
      if (/^(?:---|\.\.\.)[ \t]*$/.test(lines[j])) {
        frontMatterEnd = j;
        break;
      }
    }
  }
  let listIndent = null;
  for (let i = 0; i < lines.length; i++) {
    if (frontMatterEnd >= 0 && i <= frontMatterEnd) continue;
    const line = lines[i];
    const originalLine = originalLines[i] ?? line;
    const activeListIndent = listIndent;
    const lineInList = activeListIndent !== null && line.startsWith(' '.repeat(activeListIndent));
    const containerLine = lineInList ? line.slice(activeListIndent) : line;
    const origContainerLine = lineInList && originalLine.startsWith(' '.repeat(activeListIndent))
      ? originalLine.slice(activeListIndent)
      : originalLine;
    const container = markdownContainer(containerLine);
    if (container.listIndent) {
      listIndent = (lineInList ? activeListIndent : 0) + container.listIndent;
    } else if (!/^[ \t]*$/.test(line) && listIndent !== null && !line.startsWith(' '.repeat(listIndent))) {
      listIndent = null;
    }
    const atx = container.content
      .match(/^ {0,3}#{1,6}[ \t]+(.+?)(?:[ \t]+#+[ \t]*)?$/);
    if (atx) {
      const source = markdownContainer(origContainerLine).content
        .match(/^ {0,3}#{1,6}[ \t]+(.+?)(?:[ \t]+#+[ \t]*)?$/);
      addSlug(source ? source[1] : atx[1]);
    } else if (i > 0 && /^ {0,3}(?:=+|-+)[ \t]*$/.test(container.content)) {
      const previous = lines[i - 1];
      const prevParagraphOpen = i >= 2 && !/^[ \t]*$/.test(lines[i - 2]) &&
        !definitionLines.has(i - 2) &&
        !/^ {0,3}#{1,6}(?:[ \t]|$)/.test(headingContainerContent(lines[i - 2])) &&
        !/^ {0,3}(?:=+|-+)[ \t]*$/.test(headingContainerContent(lines[i - 2])) &&
        !/^ {0,3}(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})$/.test(headingContainerContent(lines[i - 2]));
      const previousShape = markdownContainer(previous, prevParagraphOpen);
      const previousContent = previousShape.content;
      const sameParagraph = candidate => {
        const continuation = continuingHeadingContainer(previousShape, candidate);
        return continuation.continues &&
          (previousShape.containers.length || !markdownContainer(candidate).containers.length);
      };
      if (!definitionLines.has(i - 1) && sameParagraph(line) && !/^[ \t]*$/.test(previousContent) &&
          !/^ {0,3}#{1,6}(?:[ \t]|$)/.test(previousContent)) {
        // A setext heading spans the entire immediately preceding paragraph,
        // not just the final line above the underline.
        let begin = i - 1;
        while (begin > 0 && !definitionLines.has(begin - 1) && sameParagraph(lines[begin - 1]) &&
          !/^[ \t]*$/.test(headingContainerContent(lines[begin - 1])) &&
          !/^ {0,3}(?:#{1,6}(?:[ \t]|$)|[-+*][ \t]|1[.)][ \t])/.test(headingContainerContent(lines[begin - 1])) &&
          !/^ {0,3}(?:=+|-+)[ \t]*$/.test(headingContainerContent(lines[begin - 1]))) begin--;
        addSlug(originalLines.slice(begin, i).map((x, idx) =>
          headingContainerContent(x, idx > 0 || (begin > 0 && prevParagraphOpen)).replace(/^[ \t]+|[ \t]+$/g, '')).join(' '));
      }
    }
    // Capture complete tag first, then find one valid quoted/unquoted ID.
    // A single tag regex avoids overlapping attribute backtracking.
  }
  // Parse real attributes, including multiline tags; quoted values cannot
  // introduce a fake id attribute. Code/comment masks remain authoritative.
  for (const range of htmlTagRanges(text)) {
    const tag = text.slice(range.start, range.end);
    const tagMatch = /^<\/?[A-Za-z][A-Za-z0-9-]*/.exec(tag);
    if (!tagMatch) continue;
    const attrs = /([A-Za-z_:][A-Za-z0-9_.:-]*)(?:[ \t\r\n]*=[ \t\r\n]*(?:"([^"]*)"|'([^']*)'|([^\t\r\n "'=<>`]+)))?/g;
    attrs.lastIndex = tagMatch[0].length;
    let attr;
    while ((attr = attrs.exec(tag))) {
      if (attr[1].toLowerCase() !== 'id') continue;
      try { found.add(decodeLinkEntities(attr[2] ?? attr[3] ?? attr[4] ?? '')); }
      catch { found.add(UNCERTAIN_HEADING_ENTITY); }
      break; // HTML uses the first attribute with a given name.
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
const NUMERIC_ENTITY_REPLACEMENTS = Object.freeze({
  0x80: '\u20ac', 0x82: '\u201a', 0x83: '\u0192', 0x84: '\u201e', 0x85: '\u2026',
  0x86: '\u2020', 0x87: '\u2021', 0x88: '\u02c6', 0x89: '\u2030', 0x8a: '\u0160',
  0x8b: '\u2039', 0x8c: '\u0152', 0x8e: '\u017d', 0x91: '\u2018', 0x92: '\u2019',
  0x93: '\u201c', 0x94: '\u201d', 0x95: '\u2022', 0x96: '\u2013', 0x97: '\u2014',
  0x98: '\u02dc', 0x99: '\u2122', 0x9a: '\u0161', 0x9b: '\u203a', 0x9c: '\u0153',
  0x9e: '\u017e', 0x9f: '\u0178',
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
      if (Object.hasOwn(NUMERIC_ENTITY_REPLACEMENTS, number)) {
        return NUMERIC_ENTITY_REPLACEMENTS[number];
      }
      if (number >= 0x80 && number <= 0x9f) {
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

function decodeDestinationText(value) {
  // Escapes and entities are one token stream; '\&' must not create an entity.
  return value.replace(/\\([!-/:-@\[-`{-~ ])|&(?:#(?:[xX][0-9a-fA-F]+|[0-9]+)|[A-Za-z][A-Za-z0-9]+);/g,
    (token, escaped) => escaped === undefined ? decodeLinkEntities(token) : escaped);
}

function destination(raw) {
  const value = raw.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
  if (value.startsWith('<')) {
    let end = -1;
    for (let i = 1; i < value.length; i++) {
      if (value[i] === '\\') { i++; continue; }
      if (value[i] === '>') { end = i; break; }
    }
    if (end < 0) throw new Error('Malformed angle-wrapped link');
    return decodeDestinationText(value.slice(1, end));
  }
  return decodeDestinationText((value.match(/^(?:\\.|[^\x00-\x20\x7f])+/) || [''])[0]);
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
  const repoRelative = path.relative(root, path.resolve(root, rel)).split(path.sep).join('/');
  // `refersToDeletedMarkdown()` reached this path after a MERGE anchor-cache
  // miss exhausted its cumulative budget. Do not reparse that untrusted file
  // through the ordinary link checker.
  if (mergeHeadingBudgetExhaustedTargets.has(repoRelative)) {
    fail(safe(source) + ': invalid local link ' + safe(target) + at);
    return;
  }
  try {
    const resolved = localFile(rel), stat = fs.statSync(resolved);
    if (!stat.isFile() && !stat.isDirectory()) throw new Error('Not a file');
    // Keep the lexical extension check for Markdown paths retargeted to text,
    // while still validating a non-Markdown alias that resolves to Markdown.
    if (anchor && stat.isFile() &&
        (rel.toLowerCase().endsWith('.md') || resolved.toLowerCase().endsWith('.md'))) {
      if (!headingsFor(resolved).has(anchor)) throw new Error('Missing Markdown anchor');
    } else if (anchor && stat.isDirectory()) throw new Error('Directory anchor unsupported');
  } catch { fail(safe(source) + ': invalid local link ' + safe(target) + at); }
}

// Target matching uses lexical paths because the target is absent in the merge.
// Resolve surviving directory symlink aliases, never paths outside the checkout.
// Invalid pre-existing anchors were not introduced by this deletion and are skipped.
const baseTargetCache = new Map();
const baseHeadingCache = new Map();
const MAX_BASE_HEADING_CACHE_FILES = 2;
const MAX_BASE_HEADING_PARSES = 64;
const MAX_BASE_HEADING_PARSE_BYTES = 16 * 1024 * 1024;
let baseHeadingParses = 0, baseHeadingParsedBytes = 0;
const regularToSymlink = new Set();
const mergeHeadingCache = new Map();
const MAX_MERGE_HEADING_CACHE_FILES = 2;
const MAX_MERGE_HEADING_PARSES = 64;
const MAX_MERGE_HEADING_PARSE_BYTES = 16 * 1024 * 1024;
let mergeHeadingParses = 0, mergeHeadingParsedBytes = 0;
const mergeHeadingBudgetExhaustedTargets = new Set();
function mergeSymlinkTargetValid(relative, anchor) {
  try {
    // MERGE is untrusted: localFile() rejects symlinks escaping repository.
    const resolved = localFile(relative);
    const stat = fs.statSync(resolved);
    if (!stat.isFile()) return false;
    if (!anchor) return true; // A surviving valid path is not deleted.
    // Only recognize a preserved anchor after bounded Markdown parsing.
    if (stat.size > 1024 * 1024) return false;
    let headings = mergeHeadingCache.get(resolved);
    if (!headings) {
      if (mergeHeadingParses >= MAX_MERGE_HEADING_PARSES ||
          mergeHeadingParsedBytes + stat.size > MAX_MERGE_HEADING_PARSE_BYTES) {
        mergeHeadingBudgetExhaustedTargets.add(relative);
        return false;
      }
      mergeHeadingParses++;
      mergeHeadingParsedBytes += stat.size;
      headings = headingsFor(resolved);
      if (mergeHeadingCache.size >= MAX_MERGE_HEADING_CACHE_FILES) {
        mergeHeadingCache.delete(mergeHeadingCache.keys().next().value);
      }
      mergeHeadingCache.set(resolved, headings);
    }
    return headings.has(anchor);
  } catch { return false; } // Missing, dangling, escaping or invalid target.
}
const baseTargetInProgress = new Set();
function baseTargetValid(relative, anchor, isMarkdown = relative.toLowerCase().endsWith('.md')) {
  const key = JSON.stringify([relative, anchor, Boolean(isMarkdown)]);
  if (baseTargetCache.has(key)) return baseTargetCache.get(key);
  if (baseTargetInProgress.has(key)) return false; // Cyclic base symlink: already invalid.
  if (baseTargetCache.size > 1000 || baseTargetInProgress.size >= 8) {
    throw new Error('Too many distinct/cyclic deleted link destinations');
  }
  if (anchor && baseHeadingCache.has(relative)) {
    const headings = baseHeadingCache.get(relative);
    const valid = headings.has(anchor) || headings.has(UNCERTAIN_HEADING_ENTITY);
    baseTargetCache.set(key, valid);
    return valid;
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
        valid = blobSize > 1024 * 1024 || (isMarkdown &&
          (() => {
             let headings = baseHeadingCache.get(relative);
             if (!headings) {
               // Eviction bounds retained memory, while this cumulative budget
               // bounds repeated Git reads and parses after cache misses.
               if (baseHeadingParses >= MAX_BASE_HEADING_PARSES ||
                   baseHeadingParsedBytes + blobSize > MAX_BASE_HEADING_PARSE_BYTES) {
                 throw new Error('Base heading parse budget exceeded; fail closed');
               }
               baseHeadingParses++;
               baseHeadingParsedBytes += blobSize;
               const original = git(['show', base + ':' + relative], true).toString('utf8');
               headings = headingsIn(removeCode(original), original);
               if (baseHeadingCache.size >= MAX_BASE_HEADING_CACHE_FILES) {
                 baseHeadingCache.delete(baseHeadingCache.keys().next().value);
               }
               baseHeadingCache.set(relative, headings);
             }
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
          const canonical = resolveBaseParentAliases(resolved);
          if (withinRoot(canonical)) {
            const targetRel = path.relative(root, canonical).split(path.sep).join('/');
            valid = baseTargetValid(targetRel, anchor, isMarkdown || targetRel.toLowerCase().endsWith('.md'));
          }
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
function extractDestinationFilenamePart(raw) {
  let text = raw.trim();
  if (text.startsWith('<')) {
    let end = -1;
    for (let i = 1; i < text.length; i++) {
      if (text[i] === '\\') { i++; continue; }
      if (text[i] === '>') { end = i; break; }
    }
    text = end > 0 ? text.slice(1, end) : text.slice(1).replace(/>\s*$/, '');
  }
  let i = 0;
  while (i < text.length) {
    if (text[i] === '\\' && i + 1 < text.length) {
      i += 2;
      continue;
    }
    if (text[i] === '&') {
      const ent = /^&(?:#(?:[xX][0-9a-fA-F]+|[0-9]+)|[A-Za-z][A-Za-z0-9]+);/.exec(text.slice(i));
      if (ent) {
        i += ent[0].length;
        continue;
      }
    }
    if (text[i] === '?' || text[i] === '#') {
      return text.slice(0, i);
    }
    i++;
  }
  return text;
}

function couldUnparsedDestinationNameDeleted(source, raw, deleted) {
  if (!deleted.size) return false;
  const value = extractDestinationFilenamePart(raw);
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return false;
  let cleanFilePart = null;
  try {
    cleanFilePart = decodeDestinationText((value.match(/^(?:\\.|[^\x00-\x20\x7f])+/) || [''])[0]);
  } catch {
    cleanFilePart = null;
  }
  if (cleanFilePart !== null) {
    let filename;
    try { filename = decodeURIComponent(cleanFilePart); } catch { return true; }
    if (!filename || filename.includes('\0') || filename.includes('\\')) return true;
    const absolute = filename.startsWith('/')
      ? path.resolve(root, '.' + filename)
      : path.resolve(root, path.dirname(source), filename);
    if (!withinRoot(absolute)) return false;
    const paths = [absolute];
    const canonicalBase = resolveBaseParentAliases(absolute);
    if (withinRoot(canonicalBase)) paths.push(canonicalBase);
    const namesDeleted = paths.some(candidate => {
      if (!withinRoot(candidate)) return false;
      const relative = path.relative(root, candidate).split(path.sep).join('/');
      return deleted.has(relative);
    });
    if (!namesDeleted) return false;
    return true; // Target IS in deleted, but unparseable query/fragment makes validation fail-closed.
  }
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
  if (decoded.includes('\x01') &&
      (/(?:^|[\/\x01])\.\.(?:[\/\x01]|$)/.test(decoded) ||
       /%(?:2e|2f|5c)/i.test(decoded))) return true;
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
    if (!deleted.has(relative) || !baseTargetValid(relative, anchor)) return false;
    // A regular Markdown file replaced by a symlink is not a broken link
    // if the resolved MERGE file still contains the pre-existing anchor.
    if (!regularToSymlink.has(relative)) return true;
    const mergeTargetValid = mergeSymlinkTargetValid(relative, anchor);
    return !mergeTargetValid;
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

const PARSER_BOUND = 'Markdown parser bound exceeded; fail closed';
const LINK_DEST_LIMIT = 4096;
const MAX_DEST_DEPTH = 3;
const MAX_BRACKET_DEPTH = 32;

function failParserBound() {
  throw new Error(PARSER_BOUND);
}

function destinationWindow(text, start) {
  return Math.min(text.length, start + LINK_DEST_LIMIT);
}

function separatorExceeded(index, limit, text) {
  if (index >= limit && limit < text.length) failParserBound();
}

// Spaces, tabs, and at most one line ending. A blank line rejects the link.
function skipLinkSeparator(text, index, limit) {
  const origin = index;
  let sawBreak = false;
  while (index < limit) {
    const ch = text[index];
    if (ch === ' ' || ch === '\t') { index++; continue; }
    if (ch === '\n') {
      if (sawBreak) return null;
      let probe = index + 1;
      while (probe < limit && (text[probe] === ' ' || text[probe] === '\t')) probe++;
      if (probe < limit && text[probe] === '\n') return null;
      if (probe >= limit && limit < text.length) failParserBound();
      sawBreak = true;
      index++;
      continue;
    }
    break;
  }
  separatorExceeded(index, limit, text);
  return { index, consumed: index > origin };
}

function readAngleDestination(text, index, limit) {
  const start = index;
  index++;
  while (index < limit) {
    if (text[index] === '\\') {
      if (index + 1 >= limit) {
        separatorExceeded(index + 1, limit, text);
        return null;
      }
      if (text[index + 1] === '\n') return null;
      index += /[!-/:-@\[-`{-~]/.test(text[index + 1]) ? 2 : 1;
      continue;
    }
    if (text[index] === '\n' || text[index] === '<') return null;
    if (text[index] === '>') return { raw: text.slice(start, index + 1), end: index + 1 };
    index++;
  }
  separatorExceeded(index, limit, text);
  return null;
}

function readBareDestination(text, index, limit) {
  const start = index;
  let depth = 0;
  while (index < limit) {
    const ch = text[index];
    if (ch === '\\') {
      if (index + 1 >= limit) {
        separatorExceeded(index + 1, limit, text);
        return null;
      }
      // CommonMark escapes only ASCII punctuation. A backslash cannot turn
      // a bare destination's space into a path character.
      index += /[!-/:-@\[-`{-~]/.test(text[index + 1]) ? 2 : 1;
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch < ' ') break;
    if (ch === '(') {
      if (++depth > MAX_DEST_DEPTH) failParserBound();
    } else if (ch === ')') {
      if (depth === 0) break;
      depth--;
    }
    index++;
  }
  if (index === start) return null;
  if (depth !== 0) {
    separatorExceeded(index, limit, text);
    return null;
  }
  separatorExceeded(index, limit, text);
  return { raw: text.slice(start, index), end: index };
}

function readLinkTitle(text, index, limit) {
  const opener = text[index];
  const closer = opener === '(' ? ')' : opener;
  index++;
  while (index < limit) {
    if (text[index] === '\\') {
      if (index + 1 >= limit) {
        separatorExceeded(index + 1, limit, text);
        return null;
      }
      // Only ASCII punctuation is escapable. In particular, do not skip a
      // following newline before the blank-paragraph boundary check.
      index += /[!-/:-@\[-`{-~]/.test(text[index + 1]) ? 2 : 1;
      continue;
    }
    if (text[index] === '\n') {
      let probe = index + 1;
      while (probe < limit && (text[probe] === ' ' || text[probe] === '\t')) probe++;
      if (probe >= limit || text[probe] === '\n') {
        separatorExceeded(probe, limit, text);
        return null;
      }
      index++;
      continue;
    }
    if (opener === '(' && text[index] === '(') return null;
    if (text[index] === closer) return { end: index + 1 };
    index++;
  }
  separatorExceeded(index, limit, text);
  return null;
}

function readDestinationAt(text, index, limit) {
  if (index >= limit) {
    separatorExceeded(index, limit, text);
    return null;
  }
  if (text[index] === '<') return readAngleDestination(text, index, limit);
  return readBareDestination(text, index, limit);
}

// Inline link tail begins at the '(' immediately after link text.
// Returns null for malformed syntax so an incomplete opener can stay a shortcut.
function parseInlineTail(text, parenIndex) {
  const start = parenIndex + 1;
  const limit = destinationWindow(text, start);
  const lead = skipLinkSeparator(text, start, limit);
  if (!lead) return null;
  let index = lead.index;
  if (text[index] === ')') return { raw: text.slice(start, index), end: index + 1 };
  const dest = readDestinationAt(text, index, limit);
  if (!dest) return null;
  index = dest.end;
  const afterDest = skipLinkSeparator(text, index, limit);
  if (!afterDest) return null;
  index = afterDest.index;
  if (afterDest.consumed && (text[index] === '"' || text[index] === "'" || text[index] === '(')) {
    const title = readLinkTitle(text, index, limit);
    if (!title) return null;
    const afterTitle = skipLinkSeparator(text, title.end, limit);
    if (!afterTitle) return null;
    index = afterTitle.index;
  }
  if (text[index] !== ')') {
    separatorExceeded(index, limit, text);
    return null;
  }
  return { raw: text.slice(start, index), end: index + 1 };
}

function parseReferenceLabelAt(text, bracketIndex) {
  if (text[bracketIndex] !== '[') return null;
  const start = bracketIndex + 1;
  let index = start;
  while (index < text.length) {
    if (text[index] === '\\') { index += 2; continue; }
    if (text[index] === '[' || (text[index] === '\n' &&
        /^[ \t]*\n/.test(text.slice(index + 1)))) return null;
    if (text[index] === ']') {
      const label = text.slice(start, index);
      if (label.length > LINK_LABEL_LIMIT) failParserBound();
      if (label.length && !/[^ \t\r\n]/.test(label)) return null;
      return { label, end: index + 1 };
    }
    index++;
    if (index - start > LINK_LABEL_LIMIT) failParserBound();
  }
  return null;
}

function linkBlockBoundaries(text, sourceText = text) {
  const boundaries = [];
  let offset = 0, quoteDepth = 0, listIndent = null, priorSingleLineBlock = false, priorBlank = true;
  let paragraphOpen = false;
  const sourceLines = (sourceText ?? text).split('\n');
  const lines = text.split('\n');
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const raw = lines[lineIndex];
    const sourceRaw = sourceLines[lineIndex] ?? raw;
    const quote = /^ {0,3}(?:>[ \t]?){1,4}/.exec(raw);
    const depth = quote ? (quote[0].match(/>/g) || []).length : 0;
    let content = raw.slice(quote?.[0].length || 0);
    const continuationIndent = listIndent !== null && content.startsWith(' '.repeat(listIndent))
      ? listIndent : 0;
    if (continuationIndent) content = content.slice(continuationIndent);
    const list = /^ {0,3}([-+*]|\d{1,9}[.)])[ \t]+(?=[^ \t])/.exec(content);
    // Only an ordered list starting at 1 can interrupt an ordinary paragraph.
    const listStartsBlock = list && ((listIndent !== null && !continuationIndent) || priorBlank || priorSingleLineBlock ||
      /^[-+*]$|^1[.)]$/.test(list[1]));
    const leaf = listStartsBlock ? content.slice(list[0].length) : content;
    const atx = /^ {0,3}#{1,6}(?:[ \t]|$)/.test(leaf);
    const setext = /^ {0,3}(?:=+|-+)[ \t]*$/.test(leaf);
    const thematic = /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})$/.test(leaf);
    const isBlank = /^[ \t]*$/.test(sourceRaw.slice(quote?.[0].length || 0));
    const isInterruption = listStartsBlock || atx || setext || thematic;
    const isLazy = paragraphOpen && !isBlank && !isInterruption && depth < quoteDepth;
    const activeQuoteDepth = isLazy ? quoteDepth : depth;
    if (priorSingleLineBlock || isBlank || depth > quoteDepth || isInterruption) boundaries.push(offset);
    priorSingleLineBlock = atx || setext || thematic;
    priorBlank = isBlank;
    quoteDepth = activeQuoteDepth;
    paragraphOpen = !isBlank && !isInterruption && !priorSingleLineBlock;
    if (listStartsBlock) listIndent = continuationIndent + list[0].length;
    else if (!continuationIndent && !isBlank) listIndent = null;
    offset += raw.length + 1;
  }
  return boundaries;
}
// One forward pass. Images do not deactivate an enclosing link, so a badge
// wrapped in a link reports both destinations. A nested link keeps the inner
// destination and leaves the outer brackets inactive.
function scanBracketLinks(rawText, masks = [], collectShortcuts = false, definedRefs = null, originalText = null, sourceText = null) {
  const inlines = [], fullRefs = [], unresolvedFullRefs = [], shortcuts = [];
  const stack = [];
  const boundaries = linkBlockBoundaries(rawText, sourceText);
  const text = normalizeReferenceContainers(rawText);
  let nextBoundary = 0;
  for (let i = 0; i < text.length; i++) {
    while (nextBoundary < boundaries.length && boundaries[nextBoundary] <= i) {
      stack.length = 0;
      nextBoundary++;
    }
    if (inRanges(masks, i)) continue;
    if (text[i] === '\\') {
      if (/[!-/:-@\[-`{-~]/.test(text[i + 1])) i++;
      continue;
    }
    if (text[i] === '[') {
      if (stack.length >= MAX_BRACKET_DEPTH) failParserBound();
      stack.push({ index: i, active: true,
        image: i > 0 && text[i - 1] === '!' && !escapedAt(text, i - 1) });
      continue;
    }
    if (text[i] !== ']' || !stack.length) continue;
    const opener = stack.pop();
    if (!opener.active) continue;
    if (i - opener.index - 1 > LINK_LABEL_LIMIT) failParserBound();
    const image = opener.index > 0 && text[opener.index - 1] === '!' &&
      !escapedAt(text, opener.index - 1);
    const index = image ? opener.index - 1 : opener.index;
    if (text[i + 1] === '(') {
      const parsed = parseInlineTail(text, i + 1);
      if (parsed && parsed.end <= (boundaries[nextBoundary] ?? text.length)) {
        inlines.push({ index, opener: opener.index, labelEnd: i, raw: parsed.raw, end: parsed.end });
        if (!image) for (const item of stack) if (!item.image) item.active = false;
        i = parsed.end - 1;
        continue;
      }
    }
    let hasFullRefFollower = false;
    if (text[i + 1] === '[') {
      const ref = parseReferenceLabelAt(text, i + 1);
      if (ref && ref.end <= (boundaries[nextBoundary] ?? text.length)) {
        hasFullRefFollower = true;
        const textLabel = (originalText ?? text).slice(opener.index + 1, i);
        const refLabel = (originalText ?? text).slice(i + 2, ref.end - 1);
        const label = ref.label.length ? refLabel : textLabel;
        const match = { index, opener: opener.index, label, end: ref.end, suffixStart: i + 1 };
        if (definedRefs?.has(referenceLabel(label))) {
          fullRefs.push(match);
          if (!image) {
            for (const item of stack) if (!item.image) item.active = false;
          }
          i = ref.end - 1;
          continue;
        }
        unresolvedFullRefs.push(match);
      }
    }
    if (!hasFullRefFollower) {
      const shortcut = parseReferenceLabelAt(text, opener.index);
      if (shortcut?.end === i + 1) {
        const label = (originalText ?? text).slice(opener.index + 1, i);
        if (collectShortcuts) {
          if (shortcuts.length >= 10000) failParserBound();
          shortcuts.push({ index, opener: opener.index, label, end: i + 1 });
        }
        if (!image && definedRefs?.has(referenceLabel(label))) {
          for (const item of stack) if (!item.image) item.active = false;
        }
      }
    }
  }
  return { inlines, fullRefs, unresolvedFullRefs, shortcuts };
}

function finishReferenceLine(text, index) {
  while (text[index] === ' ' || text[index] === '\t') index++;
  if (index < text.length && text[index] !== '\n') return null;
  return index < text.length ? index + 1 : index;
}

function parseReferenceDefinition(text, bracketIndex, lastClose, rawText = text) {
  const start = bracketIndex + 1;
  // A bare unmatched opener is prose, including long escaped stress input.
  if (lastClose < start) return null;
  const parsedLabel = parseReferenceLabelAt(text, bracketIndex);
  if (!parsedLabel || !parsedLabel.label || text[parsedLabel.end] !== ':') return null;
  const label = rawText ? rawText.slice(start, parsedLabel.end - 1) : parsedLabel.label;
  let index = parsedLabel.end + 1;
  const limit = destinationWindow(text, index);
  const lead = skipLinkSeparator(text, index, limit);
  if (!lead) return null;
  const dest = readDestinationAt(text, lead.index, limit);
  if (!dest) return null;
  // A following line is part of the definition only when it continues a title.
  // Otherwise the definition ends on the destination line, even if the next
  // line is blank or is another definition.
  const afterDest = skipLinkSeparator(text, dest.end, limit);
  let tail = dest.end;
  if (afterDest && afterDest.consumed &&
      (text[afterDest.index] === '"' || text[afterDest.index] === "'" || text[afterDest.index] === '(')) {
    const title = readLinkTitle(text, afterDest.index, limit);
    if (!title || finishReferenceLine(text, title.end) === null) {
      // A malformed title on a later line does not erase a complete definition.
      if (!text.slice(dest.end, afterDest.index).includes('\n')) return null;
    } else tail = title.end;
  }
  const lineEnd = finishReferenceLine(text, tail);
  if (lineEnd === null) return null;
  return { label, destination: dest.raw, end: lineEnd };
}

function normalizeReferenceContainers(text) {
  // Preserve offsets and line counts while removing blockquote prefixes from
  // continuation destinations, titles and wrapped labels.
  return text.replace(/^ {0,3}(?:>[ \t]?){1,4}/gm, prefix => ' '.repeat(prefix.length));
}

function referenceDefinitionCanStart(text, offset, last) {
  const end = text.lastIndexOf('\n', offset - 1);
  if (end < 0) return true;
  const start = text.lastIndexOf('\n', end - 1) + 1;
  if (last && start >= last.start && end <= last.end) return true;
  const prior = text.slice(start, end).replace(/^ {0,3}(?:>[ \t]?){0,4}/, '');
  const priorInQuote = /^ {0,3}>/.test(text.slice(start, end));
  const currentInQuote = /^ {0,3}>/.test(text.slice(text.lastIndexOf('\n', offset - 1) + 1, offset));
  if (currentInQuote && !priorInQuote) return true;
  // CommonMark blank lines contain ASCII spaces/tabs only; NBSP is text.
  if (/^[ \t]*$/.test(prior) || /^#{1,6}(?:[ \t]+|[ \t]*$)/.test(prior)) return true;
  if (/^(?:[-+*]|\d{1,9}[.)])[ \t]+/.test(prior)) return true;
  if (/^ {0,3}(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})$/.test(prior)) return true;
  if (/^(?:=+|-+)[ \t]*$/.test(prior)) {
    // A setext underline only interrupts a paragraph when it actually has a
    // preceding paragraph line. A leading `=` is ordinary text, so allowing a
    // following definition would hide any Markdown-looking destination.
    const headingEnd = start - 1;
    if (headingEnd < 0) return false;
    const headingStart = text.lastIndexOf('\n', headingEnd - 1) + 1;
    const heading = text.slice(headingStart, headingEnd)
      .replace(/^ {0,3}(?:>[ \t]?){0,4}/, '');
    const htmlBlock = /^ {0,3}(?:<!--|<\?|<![A-Z]|<!\[CDATA\[|<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|nav|noframes|ol|optgroup|option|output|p|param|pre|script|search|section|style|summary|table|tbody|td|textarea|tfoot|th|thead|title|tr|track|ul)(?=[ \t/>]|$))/i;
    return Boolean(heading) && !/^[ \t]*$/.test(heading) &&
      !htmlBlock.test(heading) &&
      !/^ {0,3}(?:#{1,6}(?:[ \t]|$)|>|(?:[-+*]|\d{1,9}[.)])[ \t]+|`{3,}|~{3,})/.test(heading) &&
      !/^\[(?:\\.|[^\]\\\n]){1,512}\]:[ \t]+/.test(heading);
  }
  return /^\[(?:\\.|[^\]\\\n]){1,512}\]:[ \t]+/.test(prior);
}

// Ignore Markdown-looking candidates inside a parsed inline HTML tag, but
// leave text BETWEEN tags visible. Respect quotes around attributes and limit
// each tag scan so malformed PR input cannot force unbounded work.
function htmlTagRanges(text) {
  const ranges = [], starts = /<\/?[A-Za-z][A-Za-z0-9-]*|<\?|<!\[CDATA\[|<![A-Z]+/g;
  let scanned = 0;
  const maxScanned = Math.min(4 * text.length + 4096, 2 * 1024 * 1024);
  const tick = () => {
    if (++scanned > maxScanned) {
      throw new Error('Malformed inline HTML scan budget exceeded; fail closed');
    }
  };
  let nextPiCloser = -2, nextCdataCloser = -2, nextDeclCloser = -2;
  for (const start of text.matchAll(starts)) {
    const begin = start.index;
    if (escapedAt(text, begin)) continue; // Escaped '<' is literal prose.
    if (ranges.length && begin < ranges.at(-1).end) continue;
    tick();
    if (start[0] === '<?') {
      if (nextPiCloser !== -1) {
        if (nextPiCloser < begin + 2) nextPiCloser = text.indexOf('?>', begin + 2);
        if (nextPiCloser >= 0) {
          if (!hasInterveningBlockBoundary(text, begin, nextPiCloser)) {
            ranges.push({ start: begin, end: nextPiCloser + 2 });
          }
        }
      }
      continue;
    }
    if (start[0] === '<![CDATA[') {
      if (nextCdataCloser !== -1) {
        if (nextCdataCloser < begin + 9) nextCdataCloser = text.indexOf(']]>', begin + 9);
        if (nextCdataCloser >= 0) {
          if (!hasInterveningBlockBoundary(text, begin, nextCdataCloser)) {
            ranges.push({ start: begin, end: nextCdataCloser + 3 });
          }
        }
      }
      continue;
    }
    if (start[0].startsWith('<!')) {
      if (/^[\s/]/.test(text[begin + start[0].length] || '')) {
        if (nextDeclCloser !== -1) {
          if (nextDeclCloser < begin + 2) nextDeclCloser = text.indexOf('>', begin + 2);
          if (nextDeclCloser >= 0) {
            if (!hasInterveningBlockBoundary(text, begin, nextDeclCloser)) {
              ranges.push({ start: begin, end: nextDeclCloser + 1 });
            }
          }
        }
      }
      continue;
    }
    if (!/[\s/>]/.test(text[begin + start[0].length] || '')) continue;
    const end = parseHtmlTagEnd(text, begin, start[0].length, tick);
    if (end > begin && !hasInterveningBlockBoundary(text, begin, end)) ranges.push({ start: begin, end });
  }
  return ranges;
}

// CommonMark open/close tags only mask links after attribute grammar succeeds.
// An invalid tag is not a tag: its interior stays visible to the link scanner.
// Characters are still counted toward the scan budget so hostile input fails closed.
function parseHtmlTagEnd(text, begin, nameLength, tick) {
  const limit = Math.min(text.length, begin + 4096);
  let index = begin + nameLength;
  const closing = text[begin + 1] === '/';
  function invalidate() {
    while (index < limit) {
      tick();
      const ch = text[index++];
      if (ch === '\n' || ch === '>') return -1;
    }
    return -1;
  }
  function skipAttrSpace() {
    let sawBreak = false, consumed = false;
    while (index < limit) {
      const ch = text[index];
      if (ch === ' ' || ch === '\t') { tick(); index++; consumed = true; continue; }
      if (ch === '\n') {
        if (sawBreak) return consumed;
        const nextNl = text.indexOf('\n', index + 1);
        const line = text.slice(index + 1, nextNl === -1 ? text.length : nextNl);
        if (/^[ \t]*\r?$/.test(line) || isBlockInterruption(line)) return consumed;
        tick(); index++; sawBreak = true; consumed = true; continue;
      }
      return consumed;
    }
    return consumed;
  }
  if (closing) {
    skipAttrSpace();
    if (index >= limit) {
      if (limit < text.length) failParserBound();
      return -1;
    }
    tick();
    return text[index] === '>' ? index + 1 : invalidate();
  }
  for (;;) {
    const beforeSpace = index;
    const consumed = skipAttrSpace();
    if (index >= limit) {
      if (limit < text.length) failParserBound();
      return -1;
    }
    if (text[index] === '>') { tick(); return index + 1; }
    if (text[index] === '/' && text[index + 1] === '>') { tick(); return index + 2; }
    if (!consumed || index === beforeSpace) return invalidate();
    if (!/[A-Za-z_:]/.test(text[index] || '')) return invalidate();
    tick();
    index++;
    while (index < limit && /[A-Za-z0-9_.:-]/.test(text[index])) { tick(); index++; }
    if (index >= limit) {
      if (limit < text.length) failParserBound();
      return invalidate();
    }
    const afterName = index;
    skipAttrSpace();
    if (text[index] !== '=') { index = afterName; continue; }
    tick();
    index++;
    if (index >= limit) return invalidate();
    skipAttrSpace();
    if (index >= limit) return invalidate();
    const quote = text[index];
    if (quote === '"' || quote === "'") {
      tick();
      index++;
      while (index < limit && text[index] !== quote) {
        if (text[index] === '\n') {
          const nextNl = text.indexOf('\n', index + 1);
          const line = text.slice(index + 1, nextNl === -1 ? text.length : nextNl);
          if (/^[ \t]*\r?$/.test(line) || isBlockInterruption(line)) return -1;
        }
        tick(); index++;
      }
      if (text[index] !== quote) return invalidate();
      tick();
      index++;
      continue;
    }
    const valueStart = index;
    while (index < limit && !/[\t\n\r "'=<>`]/.test(text[index])) { tick(); index++; }
    if (index === valueStart) return invalidate();
  }
}
function inRanges(ranges, offset) {
  let low = 0, high = ranges.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (ranges[mid].start <= offset) low = mid + 1;
    else high = mid;
  }
  return low > 0 && offset < ranges[low - 1].end;
}

function uriAutolinkRanges(text) {
  const ranges = [];
  for (const match of text.matchAll(/<[A-Za-z][A-Za-z0-9+.-]{1,31}:[^<>\s]*>/g)) {
    if (!escapedAt(text, match.index)) {
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }
  }
  return ranges;
}
function validateMarkdown(filename, deletedTargets = null, budget = null) {
  let resolved;
  try { resolved = localFile(filename); } catch { fail(safe(filename) + ': missing/unsafe Markdown'); return; }
  const stat = fs.statSync(resolved);
  if (!stat.isFile() || stat.size > 1024 * 1024) { fail(safe(filename) + ': unsupported file or >1MiB'); return; }
  if (budget && (budget.bytes -= stat.size) < 0) throw new Error('Inbound Markdown scan byte budget exceeded');
  const rawFileText = fs.readFileSync(resolved, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const text = removeCode(rawFileText);
  const definitionText = normalizeReferenceContainers(text);
  const rawDefinitionText = normalizeReferenceContainers(rawFileText);
  const lastDefinitionClose = definitionText.lastIndexOf(']:');
  const lineOf = lineLookup(text);
  const inlineHtmlRanges = htmlTagRanges(text);
  const autolinkRanges = uriAutolinkRanges(text);
  const refs = new Map(), definitionLabelOffsets = new Set(), definitionRanges = [];
  function definitionCanStartAt(offset) {
    // Definitions cannot interrupt an open paragraph. The bounded pilot
    // supports up to four blockquote markers before a definition.
    return referenceDefinitionCanStart(text, offset, definitionRanges.at(-1));
  }
  // Definitions may place a destination or title on the following line.
  // Paragraph and first-definition rules still apply. A blank line or a
  // suffix after the title means this line is not a definition.
  const definitionPrefix = /^( {0,3}(?:>[ \t]?){0,4}(?:(?:[-+*]|\d{1,9}[.)])[ \t]+)?)/;
  let scanAt = 0, listContinuationIndent = null;
  while (scanAt < text.length) {
    const lineBreak = text.indexOf('\n', scanAt);
    const lineLimit = lineBreak < 0 ? text.length : lineBreak;
    const line = text.slice(scanAt, lineLimit);
    const list = /^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+/.exec(line);
    if (list) listContinuationIndent = list[0].length;
    else if (!/^[ \t]*$/.test(line) && listContinuationIndent !== null &&
        !line.startsWith(' '.repeat(listContinuationIndent))) listContinuationIndent = null;
    const continuation = !list && listContinuationIndent !== null &&
      line.startsWith(' '.repeat(listContinuationIndent)) ? listContinuationIndent : 0;
    const prefix = definitionPrefix.exec(line.slice(continuation));
    const bracket = scanAt + continuation + (prefix ? prefix[0].length : 0);
    if (prefix && /^ {0,3}>/.test(text.slice(bracket, lineLimit))) failParserBound();
    let advanced = false;
    if (prefix && text[bracket] === '[' && !escapedAt(text, bracket) &&
        !inRanges(inlineHtmlRanges, scanAt) && !inRanges(autolinkRanges, scanAt) &&
        definitionCanStartAt(scanAt)) {
      const parsed = parseReferenceDefinition(definitionText, bracket, lastDefinitionClose, rawDefinitionText);
      if (parsed && !parsed.label.startsWith('^')) { // GFM footnote, not URL reference.
        if (definitionRanges.length >= 10000) failParserBound();
        definitionRanges.push({ start: scanAt, end: parsed.end });
        definitionLabelOffsets.add(bracket);
        const id = referenceLabel(parsed.label);
        if (!refs.has(id)) { // First definition of each label wins.
          if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
          refs.set(id, { destination: parsed.destination, line: lineOf(scanAt) });
          if (!deletedTargets) checkLink(filename, parsed.destination, lineOf(scanAt));
        }
        scanAt = parsed.end;
        advanced = true;
      }
    }
    if (!advanced) scanAt = lineBreak < 0 ? text.length : lineBreak + 1;
  }
  // Labels are capped at 512, destinations at 4096, and parenthesis nesting
  // at three levels. Exceeding a cap fails closed instead of ignoring a link.
  const masks = [...inlineHtmlRanges, ...autolinkRanges, ...definitionRanges]
    .sort((a, b) => a.start - b.start || a.end - b.end);
  let maskEnd = 0;
  for (const range of masks) { maskEnd = Math.max(maskEnd, range.end); range.end = maskEnd; }
  const structures = scanBracketLinks(text, masks, Boolean(deletedTargets), new Set(refs.keys()), rawDefinitionText, rawFileText);
  const inlineOpeners = new Set(), inlineRanges = [];
  for (const match of structures.inlines) {
    if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
    if (escapedAt(text, match.opener) || inRanges(inlineHtmlRanges, match.index) ||
        inRanges(autolinkRanges, match.index)) continue;
    inlineOpeners.add(match.opener);
    if (inlineRanges.length >= 10000) throw new Error('Inline Markdown range budget exceeded');
    inlineRanges.push({ start: match.index, end: Math.max(match.end,
      inlineRanges.at(-1)?.end || 0) });
    if (!deletedTargets || refersToDeletedMarkdown(filename, match.raw, deletedTargets)) {
      checkLink(filename, match.raw, lineOf(match.index));
    }
  }
  inlineRanges.sort((a, b) => a.start - b.start || a.end - b.end);
  let coveredUntil = 0;
  for (const range of inlineRanges) {
    coveredUntil = Math.max(coveredUntil, range.end);
    range.end = coveredUntil;
  }
  // Reference-shaped text inside a parsed inline destination/title is not
  // rendered as a reference; avoid false failures on deleted targets.
  function insideInline(offset) {
    let low = 0, high = inlineRanges.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (inlineRanges[mid].start <= offset) low = mid + 1;
      else high = mid;
    }
    return low > 0 && offset < inlineRanges[low - 1].end;
  }
  const used = new Set(), referenceSuffixStarts = new Set(), referenceOpeners = new Set();
  for (const match of structures.fullRefs) {
    if (insideInline(match.index) || inRanges(inlineHtmlRanges, match.index) ||
        inRanges(autolinkRanges, match.index)) continue;
    // Consume an explicit reference's second [label] even if its first
    // bracket is escaped. Other text ending with ']' is not a reference.
    referenceSuffixStarts.add(match.suffixStart);
    if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
    if (escapedAt(text, match.opener)) continue;
    referenceOpeners.add(match.opener);
    const id = referenceLabel(match.label);
    if (deletedTargets) used.add(id);
    else if (!refs.has(id)) {
      fail(safe(filename) + ': undefined reference label ' + safe(id) + ' [' + safe(filename) + ':' + lineOf(match.index) + ']');
    }
  }
  if (!deletedTargets) {
    // Undefined full references are literal text for deletion matching, but
    // changed Markdown keeps the existing syntax diagnostic.
    for (const match of structures.unresolvedFullRefs) {
      if (insideInline(match.index) || inRanges(inlineHtmlRanges, match.index) ||
          inRanges(autolinkRanges, match.index) || escapedAt(text, match.opener)) continue;
      const id = referenceLabel(match.label);
      fail(safe(filename) + ': undefined reference label ' + safe(id) +
        ' [' + safe(filename) + ':' + lineOf(match.index) + ']');
    }
  }
  // An escaped '[' is not a reference opener, but it still consumes the
  // following full-reference label so that label is not a shortcut.
  for (const match of text.matchAll(/\\\[(?:\\.|[^\[\]\\\n]){0,512}\]\[/g)) {
    referenceSuffixStarts.add(match.index + match[0].length - 1);
  }
  if (deletedTargets) {
    // Standard shortcut references: [label] or ![alt] when a definition exists.
    // Ignore definitions, explicit/inline link openers, and backslash literals.
    for (const match of structures.shortcuts) {
      if (inRanges(definitionRanges, match.index) || insideInline(match.index) || inRanges(inlineHtmlRanges, match.index) ||
        inRanges(autolinkRanges, match.index)) continue;
      if (budget && --budget.links < 0) throw new Error('Inbound link budget exceeded');
      if (escapedAt(text, match.opener)) continue;
      if (referenceSuffixStarts.has(match.index)) continue;
      if (definitionLabelOffsets.has(match.index) || inlineOpeners.has(match.opener) ||
          referenceOpeners.has(match.opener)) continue;
      const id = referenceLabel(match.label);
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
  const changedBudget = { bytes: 32 * 1024 * 1024, links: 10000 };
  for (const doc of docs) validateMarkdown(doc, null, changedBudget);
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
  // Git reports regular-blob -> symlink replacement as T rather than D.
  // Scan unchanged consumers against those old BASE targets as well.
  const typeBytes = git(['diff', '--name-only', '-z', '--diff-filter=T',
    base, merge, '--'], true);
  const typeText = typeBytes.toString('utf8');
  if (!Buffer.from(typeText, 'utf8').equals(typeBytes)) {
    throw new Error('Non-UTF8 Git typechange path unsupported; fail closed');
  }
  for (const name of typeText.split('\0').filter(x => /\.md$/i.test(x))) {
    const oldMode = git(['ls-tree', base, '--', ':(literal)' + name]);
    const newMode = git(['ls-tree', merge, '--', ':(literal)' + name]);
    if (/^100(?:644|755) blob [0-9a-f]{40}\t/.test(oldMode) &&
        /^120000 blob [0-9a-f]{40}\t/.test(newMode)) regularToSymlink.add(name);
  }
  const deletedSet = new Set([...deleted, ...regularToSymlink]);
  if (deletedSet.size > 100) throw new Error('Too many removed/retargeted Markdown targets for bounded pilot');
  let inboundScanned = 0;
  if (deletedSet.size) {
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
  if (!docs.length && !deletedSet.size) notices.push('NO DOC FILES: whitespace checked, link check not applicable');
  notices.push('External URLs and advanced/nested Markdown syntax: NOT RUN');
  console.log('docs-integrity: changed_files=' + names.length + ' markdown_files=' + docs.length
    + ' deleted_markdown_files=' + deleted.length + ' typechanged_markdown_files=' + regularToSymlink.size
    + ' inbound_scanned=' + inboundScanned);
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
