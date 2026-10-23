#!/usr/bin/env node
/**
 * Issue #19: offline, synthetic docs-integrity checker fixtures.
 * Manual invocation only: node tools/ci/tests/docs-integrity-fixtures.mjs
 * No packages, network, GitHub tokens, production data, or workflow changes.
 * Local subprocess evidence only, NOT a GitHub Actions Gate B negative run.
 * Filesystem-dependent fixtures explicitly SKIP when their premise is unavailable.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const checker = fileURLToPath(new URL('../docs-integrity.mjs', import.meta.url));

// Isolate even the initial Git environment discovery from hostile user config.
// Git for Windows cannot reliably open Node's '\\\\.\\nul' device path as a
// config file. Git explicitly documents '/dev/null' as a config skip path,
// including when invoked from native Windows Node.js.
const emptyGitConfigPath = process.platform === 'win32' ? '/dev/null' : os.devNull;

const discoveryEnv = {
  ...process.env,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: emptyGitConfigPath,
  GIT_CONFIG_SYSTEM: emptyGitConfigPath,
  GIT_CONFIG_COUNT: '0',
  GIT_CONFIG_PARAMETERS: '',
};
delete discoveryEnv.GIT_CONFIG;
// Git documents these names as local to a repository. Prevent a caller's hook
// or shell from redirecting fixture commands to another repository.
const localVarsResult = spawnSync('git', ['rev-parse', '--local-env-vars'], {
  encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024,
  env: discoveryEnv,
});
if (localVarsResult.error || localVarsResult.status !== 0) {
  const detail = localVarsResult.error?.message || localVarsResult.stderr?.trim() ||
    'exit status ' + String(localVarsResult.status);
  throw new Error('Cannot obtain Git repository-local environment variables: ' + detail.slice(0, 280));
}
const localGitVars = localVarsResult.stdout.split(/\r?\n/).filter(Boolean);

function run(bin, args, cwd, expectSuccess = true, timeout = 20000) {
  // GIT_CONFIG changes where `git config` writes. It must not leak into synthetic repos.
  const env = { ...process.env };
  for (const name of localGitVars) delete env[name];
  // Never initialize synthetic repositories from inherited hooks/config templates.
  delete env.GIT_TEMPLATE_DIR;
  // Git author/committer overrides take precedence over local user.name/email.
  for (const name of [
    'GIT_AUTHOR_NAME', 'GIT_AUTHOR_EMAIL', 'GIT_AUTHOR_DATE',
    'GIT_COMMITTER_NAME', 'GIT_COMMITTER_EMAIL', 'GIT_COMMITTER_DATE',
  ]) delete env[name];
  const result = spawnSync(bin, args, {
    cwd,
    encoding: 'utf8',
    timeout,
    maxBuffer: 1024 * 1024,
    env: {
      ...env,
      // Ignore machine/user Git signing, hooks and credential configuration.
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_GLOBAL: emptyGitConfigPath,
      GIT_CONFIG_SYSTEM: emptyGitConfigPath,
      GIT_CONFIG_COUNT: '0',
      GIT_CONFIG_PARAMETERS: '',
    },
  });
  if (result.error) throw result.error;
  if (expectSuccess && result.status !== 0) {
    throw new Error(`${bin} ${args[0]} failed: ${result.stderr || result.stdout}`);
  }
  return result;
}

function git(cwd, ...args) {
  // Also neutralize explicitly configured repo hooks/signing; never invoke PR scripts.
  return run('git', [
    '-c', 'commit.gpgSign=false',
    '-c', `core.hooksPath=${path.join(cwd, '.nonexistent-fixture-hooks')}`,
    ...args,
  ], cwd).stdout.trim();
}

const fixtures = [
  ...[
    ['review: heading attribute comment marker preserves real anchor', '[old](Target.md#helloworld)', false,
      '# <span title="<!--">Hello</span><!-- -->World\n'],
    ['review: heading attribute does not invent another anchor', '[old](Target.md#span-titleworld)', true,
      '# <span title="<!--">Hello</span><!-- -->World\n'],
    ['review: double-backtick heading keeps entity literal', '[old](Target.md#amp)', false,
      '# ``&amp;``\n'],
    ['review: longer heading code span keeps inner ticks and entity literal', '[old](Target.md#amp)', false,
      '# ``` `&amp;` ```\n'],
    ['review: double-backtick heading rejects missing anchor', '[old](Target.md#missing)', true,
      '# ``&amp;``\n'],
    ['review: heading code span keeps comment-shaped text', '[old](Target.md#--hidden--)', false,
      '# ``<!--hidden-->``\n'],
    ['review: heading HTML owns attribute backticks before code spans',
      '[old](Target.md#helloworld-text)', false,
      '# <span title="``">Hello</span><!-- -->World ``Text``\n'],
    ['review: heading HTML backticks do not invent another anchor',
      '[old](Target.md#span-titlehelloworld-text)', true,
      '# <span title="``">Hello</span><!-- -->World ``Text``\n'],
    ['review: thousands of valid code spans in heading with trailing comment opener',
      '[old](Target.md#fast-target)', false,
      '# <span id="fast-target"></span> ' + '`code` '.repeat(2000) + 'final ``token`` <!--\n'],
    ['review: thousands of valid code spans reject invalid anchor',
      '[old](Target.md#missing-target)', true,
      '# <span id="fast-target"></span> ' + '`code` '.repeat(2000) + 'final ``token`` <!--\n'],
    ['review: matched HTML comments interspersed with code spans in heading',
      '[old](Target.md#code-final-token)', false,
      '# `code` <!-- matched note --> final ``token``\n'],
    ['review: multiple backtick delimiter lengths with HTML attributes',
      '[old](Target.md#start-one-two-three-four)', false,
      '# <span title="```">Start</span> `one` ``two`` ```three``` ````four````\n'],
    ['review: multiple backtick delimiter lengths reject invalid anchor',
      '[old](Target.md#start-one-two-missing)', true,
      '# <span title="```">Start</span> `one` ``two`` ```three``` ````four````\n'],
    ['review: attribute backticks approaching parser bound are owned by HTML tag',
      '[old](Target.md#hello)', false,
      '# <span title="' + '`'.repeat(4000) + '">Hello</span>\n'],
    ['review: attribute backticks approaching parser bound reject invented anchor',
      '[old](Target.md#span-titlehello)', true,
      '# <span title="' + '`'.repeat(4000) + '">Hello</span>\n'],
    ['review: code-owned comment opener leaves subsequent HTML comment active',
      '[old](Target.md#---helloworld-code)', false,
      '# `<!--` Hello<!-- `hidden -->World `code`\n'],
    ['review: code-owned comment opener rejects invalid heading anchor',
      '[old](Target.md#---hello---hidden---world-code)', true,
      '# `<!--` Hello<!-- `hidden -->World `code`\n'],
    ['review: code span containing comment opener preserves heading anchor',
      '[old](Target.md#---token)', false,
      '# `<!--` Token\n'],
    ['review: code span containing comment opener rejects missing prefix anchor',
      '[old](Target.md#token)', true,
      '# `<!--` Token\n'],
    ['review: backticks inside heading comment do not steal subsequent ticks',
      '[old](Target.md#hello-world)', false,
      '# <!-- `hidden` --> Hello `World`\n'],
    ['review: backticks inside heading comment reject commented anchor',
      '[old](Target.md#hidden)', true,
      '# <!-- `hidden` --> Hello `World`\n'],
    ['review: repeated unmatched comment openers with code spans retain literal slug',
      '[old](Target.md#code----------final)', false,
      '# `code` <!-- <!-- <!-- final\n'],
    ['review: mixed delimiter lengths and comment openers preserve code spans',
      '[old](Target.md#one-two-three)', false,
      '# `one` <!-- comment --> ``two`` <!-- comment2 --> ```three```\n'],
    ['review: mixed delimiter lengths and comment openers reject commented anchor',
      '[old](Target.md#one-comment-two)', true,
      '# `one` <!-- comment --> ``two`` <!-- comment2 --> ```three```\n'],
    ['review: ATX heading interrupts link label', '[x\n# z](../README.md "title [old](Target.md)")', false],
    ['review: blockquote interrupts link label', '[x\n> z](../README.md "title [old](Target.md)")', false],
    ['review: unordered list interrupts link label', '[x\n- z](../README.md "title [old](Target.md)")', false],
    ['review: ordered list starting at one interrupts link label', '[x\n1. z](../README.md "title [old](Target.md)")', false],
    ['review: setext underline interrupts link label', '[x\n===\nz](../README.md "title [old](Target.md)")', false],
    ['review: thematic break interrupts link label', '[x\n***\nz](../README.md "title [old](Target.md)")', false],
    ['review: ATX heading end interrupts link label', '# [x\nz](../README.md "title [old](Target.md)")', false],
    ['review: quoted heading interrupts link label', '> [x\n> # z](../README.md "title [old](Target.md)")', false],
    ['review: ordinary soft break keeps link label', '[x\nz](../README.md "title [old](Target.md)")', true],
    ['review: later ordered marker keeps paragraph link label', '[x\n2. z](../README.md "title [old](Target.md)")', true],
    ['review: successive later ordered markers keep paragraph link label', '[x\n2. a\n3. z](../README.md "title [old](Target.md)")', true],
    ['review: ordered list starting after a blank interrupts link label', '10. [x\n11. z](../README.md "title [old](Target.md)")', false],
    ['review: blockquote continuation keeps link label', '> [x\n> z](../README.md "title [old](Target.md)")', true],
    ['review: list continuation keeps link label', '- [x\n  z](../README.md "title [old](Target.md)")', true],
    ['review: later ordered marker in list continuation keeps link label',
      '- [x\n  2. z](Target.md)', false],
    ['review: inline escaped ampersand stays literal', '[old](Target\\&amp;.md)', false,
      null, null, 'Target&amp;.md'],
    ['review: reference escaped ampersand stays literal', '[old][ref]\n\n[ref]: Target\\&amp;.md', false,
      null, null, 'Target&amp;.md'],
    ['review: angle escaped ampersand stays literal', '[old](<Target\\&amp;.md>)', false,
      null, null, 'Target&amp;.md'],
    ['review: reference angle escaped ampersand stays literal', '[old][ref]\n\n[ref]: <Target\\&amp;.md>', false,
      null, null, 'Target&amp;.md'],
    ['review: inline escaped ampersand does not retarget decoded entity', '[old](Target\\&amp;.md)', true,
      null, null, 'Target&.md'],
    ['review: inline encoded ampersand decodes once', '[old](Target&amp;amp;.md)', false,
      null, null, 'Target&amp;.md'],
    ['review: escaped ampersand in heading preserves literal anchor text',
      '[old](Target.md#aampb)', false, '# A\\&amp;B\n'],
    ['review: escaped ampersand in heading rejects decoded entity anchor',
      '[old](Target.md#ab)', true, '# A\\&amp;B\n'],
    ['review: unescaped entity in heading decodes to character anchor',
      '[old](Target.md#ab)', false, '# A&amp;B\n'],
    ['review: unescaped entity in heading rejects unrendered literal text anchor',
      '[old](Target.md#aampb)', true, '# A&amp;B\n'],
    ['review: escaped numeric entity in heading preserves literal digits anchor',
      '[old](Target.md#a66)', false, '# A\\&#66;\n'],
    ['review: double-escaped backslash before entity decodes entity',
      '[old](Target.md#ab)', false, '# A\\\\&amp;B\n'],
    ['review: triple-escaped backslash before entity preserves literal ampersand',
      '[old](Target.md#aampb)', false, '# A\\\\\\&amp;B\n'],
    ['review: unclosed inline comment before blank line does not hide link',
      'text <!--\n\n[old](Target.md)\n-->\n', false],
    ['review: closing HTML block tag masks until blank line',
      '</div>\n[old](Target.md)\n', true],
    ['review: numeric character reference maps to target filename',
      '[old](Target&#128;.md)\n[old2](Target&#x80;.md)\n', false, null, null, 'Target€.md'],
    ['review: same-line inline comment masks contained link',
      'text <!-- [old](Target.md) -->\n', true],
    ['review: closing pre tag ends on blank line leaving following link active',
      '</pre>\n\n[old](Target.md)\n', false],
    ['review: setext heading ignores preceding reference definition',
      '[old](Target.md#heading)\n', false, '[ref]: https://example.invalid\nHeading\n===\n'],
    ['review: fragment entity uncertainty on surviving target does not block deletion',
      '[unrelated](../README.md#&Aopf;)\n', true],
    ['review: fragment entity uncertainty on deleted target fails closed',
      '[old](Target.md#&Aopf;)\n', false, null, 'Unparseable inbound destination'],
    ['review: numeric entity in destination filename preserved before fragment',
      '[old](Target&#46;md#&Aopf;)\n', false, '# Target\n<span id="𝔸"></span>\n', 'Unparseable inbound destination'],
    ['review: standalone type-7 HTML block masks contained link',
      '<span>\n[old](Target.md)\n</span>\n', true],
    ['review: fence literal contents with deep container characters does not exceed parser bound',
      '```\n> > > > > example\n```\n', true],
    ['review: heading ends paragraph allowing subsequent type-7 html block',
      'paragraph\n# Heading\n<span>\n[old](Target.md)\n</span>\n', true],
    ['review: inline processing instruction masks contained link',
      'text <? [old](Target.md) ?>\n', true],
    ['review: inline cdata section masks contained link',
      'text <![CDATA[ [old](Target.md) ]]\>\n', true],
    ['review: inline declaration masks contained link',
      'text <!DECL [old](Target.md)>\n', true],
    ['review: self-closing script tag is inline HTML leaving following link active',
      '<script/> [old](Target.md)\n', false],
    ['review: block comment closing line masks contained link',
      '<!-- note --> [old](Target.md)\n', true],
    ['review: multiline block comment closing line masks contained link',
      '<!-- note\n--> [old](Target.md)\n', true],
    ['review: inline comment allows subsequent link on same line',
      'text <!-- note --> [old](Target.md)\n', false],
    ['review: mixed marker thematic break candidate does not mask following indented link',
      'paragraph\n*-*\n    [old](Target.md)\n', false],
    ['review: mixed marker dash-asterisk does not mask following indented link',
      'paragraph\n-*-\n    [old](Target.md)\n', false],
    ['review: matched marker thematic break control masks following indented link',
      'paragraph\n***\n    [old](Target.md)\n', true],
    ['review: matched dash thematic break control masks following indented link',
      'paragraph\n---\n    [old](Target.md)\n', true],
    ['review: matched underscore thematic break control masks following indented link',
      'paragraph\n___\n    [old](Target.md)\n', true],
    ['review: repeated unmatched processing instruction openers remain bounded and detect deletion',
      'text ' + '<?'.repeat(2048) + '\n[old](Target.md)\n', false],
    ['review: repeated unmatched cdata openers remain bounded and detect deletion',
      'text ' + '<![CDATA[]] '.repeat(2048) + '\n[old](Target.md)\n', false],
    ['review: repeated unmatched declaration openers remain bounded and detect deletion',
      'text ' + '<!DECL '.repeat(2048) + '\n[old](Target.md)\n', false],
    ['review: wrapped blockquote reference label detects deleted target',
      '> [old][ref\n> label]\n>\n> [ref label]: Target.md\n', false],
    ['review: wrapped blockquote shortcut reference detects deleted target',
      '> [ref\n> label]\n>\n> [ref label]: Target.md\n', false],
    ['review: wrapped blockquote collapsed reference detects deleted target',
      '> [ref\n> label][]\n>\n> [ref label]: Target.md\n', false],
    ['review: single-line blockquote reference label control detects deleted target',
      '> [old][ref label]\n>\n> [ref label]: Target.md\n', false],
    ['review: unquoted wrapped reference label control detects deleted target',
      '[old][ref\nlabel]\n\n[ref label]: Target.md\n', false],
    ['review: blockquote indented code masks pseudo-link',
      '>     [old](Target.md)\n', true],
    ['review: blockquote unindented link stays active',
      '> [old](Target.md)\n', false],
    ['review: blockquote three-space indented link stays active',
      '>   [old](Target.md)\n', false],
    ['review: escaped backtick in run preserves code span and live link',
      '\\``` code `` [old](Target.md) ``\n', false],
    ['review: setext heading with literal hashtag exposes valid anchor',
      '[old](Target.md#hashtag)', false, '#hashtag\n===\n'],
    ['review: setext heading with hashtag rejects missing anchor',
      '[old](Target.md#missing)', true, '#hashtag\n===\n'],
    ['review: non-interrupting ordered marker inside code span keeps span active',
      'paragraph with `code\n2. [old](Target.md)\nstill code`\n', true],
    ['review: interrupting ordered marker starting at one ends code span',
      'paragraph with `code\n1. [old](Target.md)\nstill code`\n', false],
    ['review: blockquote lazy continuation retains link',
      '> [old\ncontinued\n> text](Target.md)\n', false],
    ['review: blockquote blank line ends link',
      '> [old\n\n> text](Target.md)\n', true],
    ['review: blockquote lazy continuation with all lines quoted',
      '> [old\n> continued\n> text](Target.md)\n', false],
    ['review: suppress shortcut fallback before undefined reference label',
      '[old][missing]\n\n[old]: Target.md\n', true],
    ['review: full reference before defined reference label',
      '[old][actual]\n\n[actual]: Target.md\n', false],
    ['review: standalone shortcut reference detects deletion',
      '[old]\n\n[old]: Target.md\n', false],
    ['review: inline HTML span mask terminates at ATX heading',
      'text <span title="\n# [old](Target.md)\n">\n', false],
    ['review: inline processing instruction mask terminates at ATX heading',
      'text <?\n# [old](Target.md)\n?>\n', false],
    ['review: inline CDATA mask terminates at ATX heading',
      'text <![CDATA[\n# [old](Target.md)\n]]>\n', false],
    ['review: inline declaration mask terminates at ATX heading',
      'text <!DOCTYPE\n# [old](Target.md)\n>\n', false],
    ['review: inline HTML attribute masks pseudo-link on ordinary text',
      'text <span title="\n[old](Target.md)\n">\n', true],
    ['review: reference definition preserves backticks in label',
      '[a `y`]\n\n[a `x`]: Other.md\n[a `y`]: Target.md\n', false],
    ['review: reference definition does not retarget distinct backtick label',
      '[a `x`]\n\n[a `x`]: Other.md\n[a `y`]: Target.md\n', true],
    ['review: full reference preserves backticks in target label',
      '[text][a `y`]\n\n[a `x`]: Other.md\n[a `y`]: Target.md\n', false],
    ['review: collapsed reference preserves backticks in label',
      '[a `y`][]\n\n[a `x`]: Other.md\n[a `y`]: Target.md\n', false],
    ['review: fenced block followed by reference definition preserves offsets',
      '```\nfenced\n```\n[old]\n\n[old]: Target.md\n', false],
    ['review: front matter followed by reference definition preserves offsets',
      '---\nkey: value\n---\n[old]\n\n[old]: Target.md\n', false],
    ['review: non-interrupting ordered text in setext heading exposes anchor',
      '[old](Target.md#text-2-heading)', false, 'text\n2. Heading\n===\n'],
    ['review: non-interrupting ordered text setext heading rejects missing anchor',
      '[old](Target.md#wrong)', true, 'text\n2. Heading\n===\n'],
    ['review: interrupting ordered marker at one starts list not setext',
      '[old](Target.md#text-1-heading)', true, 'text\n1. Heading\n===\n'],
    ['review: backtick in link title does not mask following link',
      '[x](https://example.invalid "title `") [old](Target.md) `\n', false],
    ['review: comment opener in link title does not mask following link',
      '[x](https://example.invalid "title <!--") [old](Target.md)\n', false],
    ['review: backtick in reference definition title does not mask following link',
      '[x]: https://example.invalid "title `"\n[old](Target.md) `\n', false],
    ['review: type-1 HTML block ends on style closer after script opener',
      '<script>\n</style>\n[old](Target.md)\n', false],
    ['review: type-1 HTML block ends on pre closer after style opener',
      '<style>\n</pre>\n[old](Target.md)\n', false],
    ['review: type-1 HTML block ends on textarea closer after pre opener',
      '<pre>\n</textarea>\n[old](Target.md)\n', false],
    ['review: three-line inline code span inside link label preserves link',
      '[a `\none\nmiddle\nthree\n` b](Target.md)\n', false],
    ['review: three-line inline comment inside link label preserves link',
      '[a <!--\none\nmiddle\nthree\n--> b](Target.md)\n', false],
    ['review: blank line inside three-line inline code span terminates link',
      '[a `\none\n\nthree\n` b](Target.md)\n', true],
    ['review: HTML block pre before reference link preserves offsets',
      '<pre>\nanything\n</pre>\n\n[old]\n\n[old]: Target.md\n', false],
    ['review: inline link followed by HTML attribute with backtick preserves link',
      '[x](https://example.invalid) <span title="`">x</span> [old](Target.md) `\n', false],
    ['review: multiline inline link title with backtick preserves following link',
      '[x](https://example.invalid "title `\nmore") [old](Target.md) `\n', false],
    ['review: multiline reference definition title with backtick preserves following link',
      '[x]: https://example.invalid "title `\nmore"\n[old](Target.md) `\n', false],
    ['review: non-interrupting ordered marker before pre tag in paragraph preserves link',
      'paragraph\n2. <pre>\n   [old](Target.md)\n   </pre>\n', false],
    ['review: code span across lazy blockquote line masks link',
      '> paragraph `code\n[old](Target.md)\nend`\n', true],
    ['review: inline comment across lazy blockquote line masks link',
      '> paragraph <!--\n[old](Target.md)\n-->\n', true],
    ['review: reference definition cannot interrupt paragraph in blockquote',
      '> paragraph\n> [x]: ../README.md "[old](Target.md)"\n', false],
    ['review: reference definition can start after blank line in blockquote',
      '> paragraph\n>\n> [old]: Target.md\n\n[old]\n', false],
    ['review: heading full reference with backticks in label resolves anchor',
      '[old](Target.md#hello)', false, '# [Hello][a `x`]\n\n[a `x`]: ../README.md\n'],
    ['review: heading full reference with backticks rejects missing anchor',
      '[old](Target.md#wrong)', true, '# [Hello][a `x`]\n\n[a `x`]: ../README.md\n'],
    ['quoted heading interruption ends multiline code span', '> `code\n> # [old](Target.md)\n> code`', false],
    ['heading interruption ends quoted multiline code span', '> `code\n# [old](Target.md)\n> code`', false],
    ['list boundary ends multiline code span', '- `code\n[old](Target.md)\ncode`', false],
    ['blockquote blank boundary ends multiline code span', '> `code\n> \n> [old](Target.md)\n> code`', false],
    ['review: ATX heading unmatched backtick does not mask following link',
      '# `code\n[old](Target.md)\ncode`\n', false],
    ['review: quoted ATX heading unmatched backtick does not mask following link',
      '> # `code\n> [old](Target.md)\n> code`\n', false],
    ['review: list ATX heading unmatched backtick does not mask following link',
      '- # `code\n  [old](Target.md)\n  code`\n', false],
    ['review: ATX heading unmatched double backticks do not mask following link',
      '# ``code\n[old](Target.md)\ncode``\n', false],
    ['review: matched ATX heading code span preserves following link detection',
      '# `code`\n[old](Target.md)\n', false],
    ['review: paragraph multiline code span masks contained link',
      'paragraph with `code\n[old](Target.md)\nstill code`\n', true],
    ['review: list paragraph multiline code span masks contained link',
      '- paragraph with `code\n  [old](Target.md)\n  still code`\n', true],
    ['balanced reference heading slug keeps nested label', '[old](Target.md#hello-there)', false,
      '# [Hello [there]][ref]\n\n[ref]: https://example.invalid\n'],
    ['blank boundary ends multiline code span', '`code\n\n[old](Target.md)\ncode`', false],
    ['mixed list then quote fence ends with list', '- > ```md\n>   [old](Target.md)\n- > ```', false],
    ['multiline script opener closes on completion line', '<script\n></script>\n[old](Target.md)', false],
    ['setext paragraph stops at blockquote boundary', '[old](Target.md#foo)', false,
      'Outside\n> Foo\n> ---\n'],
    ['buffered HTML ID does not shift heading lines', '[old](Target.md#hello-there)', false,
      '<div\nid="kept">\n\n# Hello `There`\n'],
    ['many multiline tags stay inside scan budget', '[old](Target.md#kept)', false,
      '<div id="kept">\n\n' + ('<div\n' + 'a\n'.repeat(1900) + '>\n\n').repeat(50)],
    ['heading code span keeps entity literal', '[old](Target.md#amp)', false,
      '# `&amp;`\n'],
    ['escaped newline rejects angle destination fallback',
      '[old](<x\\\n>)\n\n[old]: Target.md', false],
    ['blockquote fence ends before unquoted link', '> ```md\n[old](Target.md)\n> ```', false],
    ['blockquote fence masks quoted pseudo-link', '> ```md\n> [old](Target.md)\n> ```', true],
    ['list opening fence ends before outside link', '- ```md\n[old](Target.md)\n  ```', false],
    ['multiline uppercase HTML ID remains an anchor', '[old](Target.md#kept)', false,
      '<div\nID="kept">hi</div>\n'],
    ['multiline lowercase HTML id remains an anchor', '[old](Target.md#kept)', false,
      '<div\nid="kept">hi</div>\n'],
    ['NBSP final setext text line keeps anchor', '[old](Target.md#foo)', false,
      'Foo\n\u00a0\n---\n'],
    ['blockquote setext underline keeps anchor', '[old](Target.md#foo)', false,
      '> Foo\n> ---\n'],
    ['list setext underline keeps anchor', '[old](Target.md#foo)', false,
      '- Foo\n  ---\n'],
    ['tab heading separator keeps hyphen', '[old](Target.md#hello-world)', false,
      '# Hello\tWorld\n'],
    ['comment ends with its blockquote', '> <!--\n[old](Target.md)\n> -->', false],
    ['comment stays masked in blockquote', '> <!--\n> [old](Target.md)\n> -->', true],
    ['comment ends with its list', '- <!--\n[old](Target.md)\n  -->', false],
    ['NBSP paragraph keeps indented link active', '\u00a0\n    [old](Target.md)', false],
    ['fenced code ends with its list', '- item\n  ```md\n  [hidden](Target.md)\n[old](Target.md)', false],
    ['fenced code stays masked in list', '- item\n  ```md\n  [old](Target.md)\n  ```', true],
    ['raw HTML uppercase ID remains an anchor', '[old](Target.md#kept)', false,
      '<div ID="kept">hi</div>\n'],
    ['special HTML block ends with its blockquote', '> <?xml\n[old](Target.md)', false],
    ['standard HTML block stays masked in blockquote',
      '> <script>\n> [old](Target.md)\n> </script>', true],
    ['standard HTML block ends with its blockquote',
      '> <script>\n[old](Target.md)', false],
    ['standard HTML block stays masked in list',
      '- <script>\n  [old](Target.md)\n  </script>', true],
    ['standard HTML block ends with its list',
      '- <script>\n[old](Target.md)', false],
    ['fifth heading container fails closed', '[old](Target.md#hello)', false,
      '> > > > > # Hello\n', 'parser'],
    ['NBSP paragraph cannot be interrupted by reference definition',
      '\u00a0\n[x]: Target.md\n\n[x]', true],
    ['bare destination cannot escape a space', '[old](Target\\ md.md)', true,
      null, null, 'Target md.md'],
    ['multiline shortcut reference detects deletion',
      '[ref\nlabel]\n\n[ref label]: Target.md', false],
    ['encoded angle heading text remains in slug', '[old](Target.md#hello-world)', false,
      '# &lt;Hello&gt; World\n'],
    ['escaped angle heading text remains in slug', '[old](Target.md#hello-world)', false,
      '# \\<Hello> World\n'],
    ['raw HTML heading tag is absent from slug', '[old](Target.md#hello-world)', true,
      '# <Hello> World\n'],
    ['raw HTML heading keeps surrounding text', '[old](Target.md#world)', false,
      '# <Hello> World\n'],
    ['encoded angle heading rejects unrelated anchor', '[old](Target.md#missing)', true,
      '# &lt;Hello&gt; World\n'],
    ['encoded close bracket stays within heading link label',
      '[old](Target.md#hello-there)', false,
      '# [Hello &#93; there](https://example.invalid)\n'],
    ['blockquote processing instruction masks pseudo-link',
      '> <?xml\n> [old](Target.md)\n> ?>', true],
    ['blockquote CDATA masks pseudo-link',
      '> <![CDATA[\n> [old](Target.md)\n> ]]>', true],
    ['list processing instruction masks pseudo-link',
      '- <?xml\n  [old](Target.md)\n  ?>', true],
    ['unknown separator entity traversal fails closed',
      '[old](foo&bsol;..&bsol;Target.md)', false, null, 'Unparseable inbound destination'],
    ['unrelated unknown entity stays nonblocking',
      '[u](foo&notSupportedHere;Other.md)', true],
    ['NBSP front matter opener leaves link active', '\u00a0---\n[old](Target.md)\n---', false],
    ['space front matter opener leaves link active', ' ---\n[old](Target.md)\n---', false],
    ['processing instruction masks pseudo-link', '<?xml\n[old](Target.md)\n?>', true],
    ['declaration masks pseudo-link', '<!DOCTYPE\n[old](Target.md)\n>', true],
    ['CDATA masks pseudo-link', '<![CDATA[\n[old](Target.md)\n]]>', true],
    ['link after processing instruction stays active', '<?xml\n?>\n[old](Target.md)', false],
    ['link after declaration stays active', '<!DOCTYPE\n>\n[old](Target.md)', false],
    ['link after CDATA stays active', '<![CDATA[\n]]>\n[old](Target.md)', false],
    ['NBSP setext suffix is not a heading', '[old](Target.md#foo)', true, 'Foo\n---\u00a0\n'],
    ['blank line invalidates inline label', '[old\n\ntext](Target.md)', true],
    ['whitespace blank line invalidates inline label', '[old\n \t\ntext](Target.md)', true],
    ['soft line break preserves inline label', '[old\ntext](Target.md)', false],
    ['balanced heading link anchor', '[old](Target.md#hello-there)', false,
      '# [Hello [there]](https://example.invalid)\n'],
    ['balanced heading image anchor', '[old](Target.md#hello-there)', false,
      '# ![Hello [there]](https://example.invalid/image.png)\n'],
    ['many fragments share one base heading parse',
      Array.from({ length: 400 }, (_, i) => `[old](Target.md#heading-${i})`).join('\n'), false,
      Array.from({ length: 400 }, (_, i) => `# Heading ${i}\n${'plain text '.repeat(190)}`).join('\n')],
    ['HTML bracket in outer link', '[outer <span title="]">](Target.md)', false],
    ['blockquote continuation destination', '[old][ref]\n\n> [ref]:\n> Target.md', false],
    ['wrapped full-reference label', '[old][ref\nlabel]\n\n[ref label]: Target.md', false],
    ['wrapped definition label', '[old][ref label]\n\n[ref\nlabel]: Target.md', false],
    ['blank wrapped label stays inactive', '[old][ref\n\nlabel]\n\n[ref label]: Target.md', true],
    ['nested image stays active', '![[inner](https://example.invalid)](Target.md)', false],
    ['invalid nested parenthesized title', '[old](Target.md (foo(bar))', true],
    ['reference title shortcut stays inactive', '[x]: ../README.md "[old]"\n[old]: Target.md', true],
    ['reference title full reference stays inactive', '[x]: ../README.md "[old][ref]"\n[ref]: Target.md', true],
    ['deep container fails closed', '[old][ref]\n\n> > > > > [ref]: Target.md', false, null, 'parser'],
    ['duplicate definition budget', '[x]:a\n'.repeat(140000), false, null, 'parser'],
    ['bad next-line title retains definition', '[old]\n\n[old]: Target.md\n"unclosed', false],
    ['next-line title garbage retains definition', '[old]\n\n[old]: Target.md\n"title" garbage', false],
    ['blank line terminates inline HTML', 'prefix <span title="x\n\n[old](Target.md)\n">', false],
    ['incomplete div opener masks block', '<div\n[old](Target.md)', true],
    ['incomplete pre opener masks block', '<pre\n[old](Target.md)\n</pre>', true],
    ['NBSP is not heading separator', '[old](Target.md#foo)', true, '#\u00a0Foo\n'],
    ['quoted fake id does not hide real id', '[old](Target.md#real)', false, '<span title=\' id="fake"\' id="real">\n'],
    ['quoted fake id is not an anchor', '[old](Target.md#fake)', true, '<span title=\' id="fake"\' id="real">\n'],
    ['multiline HTML id', '[old](Target.md#real)', false, '<span\nid="real">\n'],
    ['heading uses multiline definition', '[old](Target.md#hello)', false, '# [Hello][ref]\n\n[ref]:\nhttps://example.invalid\n'],
    ['heading uses blockquote definition', '[old](Target.md#hello)', false, '# [Hello][ref]\n\n> [ref]: https://example.invalid\n'],
    ['NBSP destination retained', '[old](Target\u00a0name.md)', false, null, null, 'Target\u00a0name.md'],
  ].map(([name, consumer, pass, baseTarget, signal, deletedName]) => ({
    name, consumer, pass, baseTarget, deletedName, md: null, extra: 'review-regression',
    signal: pass ? undefined : signal || 'invalid local link',
    markdownCount: signal ? undefined : 0,
  })),
  { name: 'valid local link and anchor', md: '# New\n[ok](Target.md#hello-there)\n', pass: true },
  { name: 'trailing whitespace', md: '# Header  \n', pass: false, signal: 'Changed-line whitespace check failed' },
  { name: 'missing local file', md: '# New\n[missing](no-such-file.md)\n', pass: false, signal: 'invalid local link' },
  { name: 'incorrect filename case', md: '# New\n[case](target.md)\n', extra: 'case', pass: false, signal: 'invalid local link' },
  { name: 'missing Markdown anchor', md: '# New\n[anchor](Target.md#no-such-heading)\n', pass: false, signal: 'invalid local link' },
  { name: 'valid reference link', md: '# New\n[Target][one]\n\n[one]: Target.md#existing\n', pass: true },
  { name: 'undefined reference label', md: '# New\n[Target][undefined]\n', pass: false, signal: 'undefined reference label' },
  { name: 'defined reference to missing target', md: '# New\n[Target][broken]\n\n[broken]: no-such-reference-target.md\n', pass: false, signal: 'invalid local link' },
  { name: 'modified Markdown broken link', md: null, extra: 'modified', pass: false, signal: 'invalid local link', markdownCount: 1 },
  { name: 'renamed Markdown path', md: null, extra: 'renamed', pass: true, markdownCount: 1 },
  { name: 'diverged base deletion excluded from diff', md: '# New\n', extra: 'diverged', pass: true, markdownCount: 1 },
  { name: 'fenced-code exclusion', md: '# New\n```md\n[missing](does-not-exist.md)\n```\n', pass: true },
  { name: 'external URL excluded', md: '# New\n[remote](https://example.invalid/blocked)\n', pass: true },
  { name: 'path traversal to existing outside file', md: null, extra: 'traversal', pass: false, signal: 'invalid local link' },
  { name: 'bad percent encoding', md: '# New\n[bad](file%ZZ.md)\n', pass: false, signal: 'invalid URL encoding' },
  { name: 'root-absolute path rejected', md: '# New\n[absolute](/etc/passwd)\n', pass: false, signal: 'root-absolute link unsupported' },
  { name: 'wrong merge parent rejected', md: '# New\n[ok](Target.md)\n', pass: false, wrongBase: true, signal: 'Unexpected PR merge commit parents' },
  { name: 'wrong PR head parent rejected', md: '# New\n[ok](Target.md)\n', pass: false, wrongHead: true, signal: 'Unexpected PR merge commit parents' },
  { name: 'octopus merge with third parent rejected', md: '# New\n[ok](Target.md)\n', extra: 'octopus', pass: false, signal: 'Unexpected PR merge commit parents' },
  { name: 'oversized changed Markdown rejected', md: null, extra: 'oversized', pass: false, signal: 'unsupported file or >1MiB', markdownCount: 1 },
  { name: 'non-doc change classified', md: null, extra: 'other', pass: true, signal: 'NO DOC FILES', markdownCount: 0 },
  { name: 'non-doc trailing whitespace rejected', md: null, extra: 'other-white', pass: false, signal: 'Changed-line whitespace check failed', markdownCount: 0 },
  { name: 'symlink escape rejected', md: '# New\n[secret](external-link.txt)\n', extra: 'symlink', pass: false, signal: 'invalid local link' },
  // The *only changed Markdown* has a space in its path and a deliberately broken link.
  // A broken NUL-delimited changed-path parser would miss it and incorrectly PASS.
  { name: 'spaced Markdown filename checked', md: null, extra: 'spaced', pass: false, signal: 'docs/space file.md: invalid local link', markdownCount: 1 },
  { name: 'deleted Markdown inbound inline link rejected', md: null, extra: 'deleted-inbound',
    pass: false, signal: 'docs/consumer.md: invalid local link Target.md [docs/consumer.md:2]', markdownCount: 0 },
  { name: 'deleted Markdown inbound reference definition rejected', md: null, extra: 'deleted-reference',
    pass: false, signal: 'docs/consumer.md: invalid local link Target.md#existing [docs/consumer.md:4]', markdownCount: 0 },
  { name: 'deleted Markdown inbound percent encoding rejected', md: null, extra: 'deleted-encoded',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'deleted Markdown numeric-entity destination link rejected', md: null, extra: 'deleted-numeric-entity',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'deleted Markdown named-entity destination link rejected', md: null, extra: 'deleted-named-entity',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'unknown named-entity destination fails closed', md: null, extra: 'deleted-unknown-entity',
    pass: false, signal: 'Unparseable inbound destination' },
  { name: 'escaped bracket in inline link label still detects deletion', md: null, extra: 'deleted-escaped-label',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'different file/anchor cache entries never collide', md: null, extra: 'deleted-cache-collision',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'list continuation relative link still reports deletion', md: null, extra: 'deleted-list-continuation',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'multiline code span pseudo-link ignored on deletion', md: null, extra: 'deleted-multiline-code',
    pass: true, markdownCount: 0 },
  { name: 'link following closed multiline code span still reports deletion', md: null, extra: 'deleted-multiline-code-then-link',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'raw HTML pre block pseudo-link ignored', md: null, extra: 'deleted-raw-pre',
    pass: true, markdownCount: 0 },
  { name: 'raw HTML script block pseudo-link ignored', md: null, extra: 'deleted-raw-script',
    pass: true, markdownCount: 0 },
  { name: 'link after raw HTML pre block is scanned', md: null, extra: 'deleted-raw-then-link',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'entity in base heading preserves deletion anchor validity', md: null, extra: 'deleted-heading-entity',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'unmatched escaped inline label remains bounded', md: '# New\n[' + '\\\\'.repeat(2048) + '\n',
    pass: true, markdownCount: 1 },
  { name: 'deleted target through retargeted base symlink remains rejected', md: null, extra: 'deleted-alias-retarget',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'shortcut immediately after a literal closing bracket remains live', md: null, extra: 'deleted-adjacent-shortcut',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'known HTML copyright heading with valid anchor triggers deletion', md: null, extra: 'deleted-heading-copy-valid',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'known HTML copyright heading with baseline invalid anchor ignored', md: null, extra: 'deleted-heading-copy-invalid',
    pass: true, markdownCount: 0 },
  { name: 'unknown heading named entity remains conservative without exception', md: null, extra: 'deleted-heading-uncertain',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'base alias with leading colon pathspec remains rejected', md: null, extra: 'deleted-literal-alias',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'colon following a shortcut in prose does not hide broken inbound link', md: null, extra: 'deleted-colon-shortcut',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'standalone CR raw HTML masking resumes after block close', md: null, extra: 'deleted-cr-raw-block',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'unclosed inline parenthesis destination scanning remains bounded', md: '# New\n[x](' + '('.repeat(65_536) + '\n',
    pass: false, signal: 'Markdown parser bound exceeded' },
  { name: 'base heading inline code remains part of anchor', md: null, extra: 'deleted-heading-inline-code',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped bracket in shortcut and reference definition', md: null, extra: 'deleted-ref-escaped-label',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped closing parenthesis in link destination', md: null, extra: 'deleted-escaped-close-paren',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'surviving symlink to removed real Markdown target', md: null, extra: 'deleted-surviving-alias',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'incomplete inline syntax preserves shortcut reference', md: null, extra: 'deleted-incomplete-shortcut',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'unquoted HTML id base anchor preserved', md: null, extra: 'deleted-unquoted-id',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'quoted inline title with open paren still detects deletion', md: null, extra: 'deleted-title-parenthesis',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'HTML-shaped code text contributes to heading slug', md: null, extra: 'deleted-heading-code-tag',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'data-id before actual ID must not steal base anchor', md: null, extra: 'deleted-id-hyphen',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'data-id alone must not count as HTML ID anchor', md: null, extra: 'deleted-data-id-only',
    pass: true, markdownCount: 0 },
  { name: 'SS Unicode folds to sharp-s reference label', md: null, extra: 'deleted-casefold-ss',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped angle closer in link destination is an active inbound link', md: null, extra: 'deleted-angle-escaped',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped angle closer in reference definition is an active inbound link', md: null, extra: 'deleted-angle-escaped-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped outer bracket preserves active inner inline link', md: null, extra: 'deleted-escaped-outer',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'reference escapes remain distinct despite matching case', md: null, extra: 'deleted-distinct-escaped-label',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'leading space before inline destination remains active', md: null, extra: 'deleted-leading-space',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'leading tab before inline destination remains active', md: null, extra: 'deleted-leading-tab',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'parenthesized inline title still detects deleted target', md: null, extra: 'deleted-paren-title',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'Cyrillic extended Unicode full case folding', md: null, extra: 'deleted-casefold-cyrillic',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'Cherokee Unicode full case folding', md: null, extra: 'deleted-casefold-cherokee',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'malformed first reference definition must not shadow valid second', md: null, extra: 'deleted-malformed-first-def',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'valid quoted reference title remains first definition', md: null, extra: 'deleted-valid-ref-title',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'fullwidth heading anchor preserved without compatibility normalization', md: null, extra: 'deleted-fullwidth-anchor',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'fullwidth reference label not equivalent to ASCII', md: null, extra: 'deleted-distinct-fullwidth-ref',
    pass: true, markdownCount: 0 },
  { name: 'many unrelated Markdown sources do not exhaust base symlink cache', md: null, extra: 'deleted-many-unrelated',
    pass: true, markdownCount: 0 },
  { name: 'valid unrelated named HTML5 entity does not block deletion', md: null, extra: 'deleted-unrelated-eacute',
    pass: true, markdownCount: 0 },
  { name: 'unknown unrelated entity cannot block unrelated deletion', md: null, extra: 'deleted-unrelated-unknown-entity',
    pass: true, markdownCount: 0 },
  { name: 'deleted HTML named-entity target is detected', md: null, extra: 'deleted-eacute-target',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'changed Markdown accepts existing named-entity link', md: '# New\n[ok](cafe&eacute;.md)\n',
    extra: 'changed-eacute-valid', pass: true, markdownCount: 1 },
  { name: 'root-absolute inbound deleted Markdown target rejected', md: null, extra: 'deleted-root-absolute',
    pass: false, signal: 'root-absolute link unsupported', markdownCount: 0 },
  { name: 'root-absolute unrelated link is not rejected', md: null, extra: 'deleted-root-unrelated',
    pass: true, markdownCount: 0 },
  { name: 'root-absolute normalized path to deleted target rejected', md: null, extra: 'deleted-root-normalized',
    pass: false, signal: 'root-absolute link unsupported', markdownCount: 0 },
  { name: 'angle link with leading whitespace detects deletion', md: null, extra: 'deleted-angle-leading',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'angle link with spaced target and leading whitespace detects deletion', md: null, extra: 'deleted-angle-leading-spaced',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'angle link with leading tab and filename spaces rejects deletion', md: null, extra: 'deleted-angle-leading-tab',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'angle link with leading whitespace and title rejects deletion', md: null, extra: 'deleted-angle-leading-title',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'unknown named entity through BASE symlink fails closed', md: null, extra: 'deleted-entity-alias',
    pass: false, signal: 'Unparseable inbound destination' },
  { name: 'unrelated unknown entity does not fail despite BASE symlink elsewhere', md: null, extra: 'deleted-entity-alias-unrelated',
    pass: true, markdownCount: 0 },
  { name: 'YAML front matter must not create a false setext anchor', md: null, extra: 'deleted-frontmatter-fake-anchor',
    pass: true, markdownCount: 0 },
  { name: 'real heading after YAML front matter still rejects deletion', md: null, extra: 'deleted-frontmatter-real-anchor',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'nested opener preserves inner full-reference link', md: null, extra: 'deleted-nested-full-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'NBSP is distinct from ASCII space in reference label', md: null, extra: 'deleted-nbsp-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'base HTML ID entity resolves actual anchor on deletion', md: null, extra: 'deleted-id-entity',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'unknown base HTML ID entity remains fail-closed', md: null, extra: 'deleted-id-unknown-entity',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'blockquote definition still activates inbound shortcut', md: null, extra: 'deleted-blockquote-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'nested blockquote definition activates inbound shortcut', md: null, extra: 'deleted-nested-blockquote-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'reference definition cannot interrupt a paragraph', md: null, extra: 'deleted-paragraph-interrupted-ref',
    pass: true, markdownCount: 0 },
  { name: 'reference-style heading text creates correct anchor', md: null, extra: 'deleted-heading-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'undefined reference-style heading does not invent anchor', md: null, extra: 'deleted-heading-ref-undefined',
    pass: true, markdownCount: 0 },
  { name: 'inline quoted title does not activate shortcut reference', md: null, extra: 'deleted-ref-in-title',
    pass: true, markdownCount: 0 },
  { name: 'inline quoted title does not activate full reference', md: null, extra: 'deleted-full-ref-in-title',
    pass: true, markdownCount: 0 },
  { name: 'raw inline HTML attribute pseudo-link ignored', md: null, extra: 'deleted-html-inline-attr',
    pass: true, markdownCount: 0 },
  { name: 'raw inline HTML attribute pseudo-reference ignored', md: null, extra: 'deleted-html-inline-ref',
    pass: true, markdownCount: 0 },
  { name: 'live link immediately following inline HTML still rejected', md: null, extra: 'deleted-html-inline-then-active',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'regular Markdown replaced by symlink breaks old anchor', md: null, extra: 'typechange-anchor-broken',
    pass: false, signal: 'invalid local link', markdownCount: 1 },
  { name: 'regular Markdown replaced by symlink preserves old anchor', md: null, extra: 'typechange-anchor-preserved',
    pass: true, markdownCount: 1 },
  { name: 'regular Markdown replaced by symlink preserves unanchored link', md: null, extra: 'typechange-unanchored',
    pass: true, markdownCount: 1 },
  { name: 'regular Markdown replaced by text symlink breaks old anchor', md: null, extra: 'typechange-anchor-nonmarkdown',
    pass: false, signal: 'invalid local link', markdownCount: 1 },
  { name: 'regular Markdown replaced by symlink with uncertain heading breaks old anchor', md: null, extra: 'typechange-anchor-uncertain',
    pass: false, signal: 'invalid local link', markdownCount: 1 },
  { name: 'non-Markdown symlink alias still validates resolved Markdown anchor',
    md: '# New\n[broken](Alias.txt#absent)\n', extra: 'alias-text-to-markdown-anchor',
    pass: false, signal: 'invalid local link', markdownCount: 1 },
  { name: 'repeated preserved symlink anchor stays within parse budget', md: null, extra: 'typechange-anchor-cached',
    pass: true, markdownCount: 1, checkerTimeout: 15000 },
  { name: 'merge symlink anchor budget exhaustion fails closed', md: null, extra: 'typechange-anchor-budget',
    pass: false, signal: 'invalid local link', markdownCount: 3, checkerTimeout: 20000 },
  { name: 'list item closes paragraph before reference definition', md: null, extra: 'deleted-ref-after-list',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'setext heading closes paragraph before reference definition', md: null, extra: 'deleted-ref-after-setext',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'empty ATX heading closes paragraph before reference definition', md: null, extra: 'deleted-ref-after-empty-atx',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'bare setext underline does not permit a reference definition', md: null, extra: 'deleted-ref-after-bare-setext',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'HTML block interruption exposes a following multiline-code link', md: null, extra: 'deleted-multiline-code-html',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'list fence leaves a following item continuation link visible', md: null, extra: 'deleted-list-fence-following-link',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'raw HTML after a list keeps masking without stale list indentation', md: null, extra: 'deleted-raw-after-list',
    pass: true, markdownCount: 0 },
  { name: 'thematic break permits a following reference definition', md: null, extra: 'deleted-ref-after-thematic',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'inline HTML text can precede a setext heading definition', md: null, extra: 'deleted-ref-after-inline-html-setext',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'fenced list content cannot inflate later continuation indent', md: null, extra: 'deleted-fenced-list-indent',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'HTML attribute comment marker does not conceal an active link', md: null, extra: 'deleted-html-attribute-comment',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'backslash before title blank boundary does not conceal a live link', md: null, extra: 'deleted-title-escaped-blank',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'undefined full-reference suffix leaves an inline link active', md: null, extra: 'deleted-undefined-full-suffix-inline',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'defined nested shortcut deactivates its enclosing inline candidate', md: null, extra: 'deleted-nested-defined-shortcut',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped newline ends a link label before an active deleted link', md: null, extra: 'deleted-label-escaped-blank',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'long ordered-list continuation activates a reference definition', md: null, extra: 'deleted-ref-list-long-marker',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'ATX heading comment content does not alter a baseline anchor', md: null, extra: 'deleted-heading-comment-atx',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'setext heading comment content does not alter a baseline anchor', md: null, extra: 'deleted-heading-comment-setext',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped heading comment opener preserves literal anchor text', md: null, extra: 'deleted-heading-escaped-comment',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'unclosed heading comment openers stay within the scanner budget', md: null, extra: 'deleted-heading-unclosed-comment-budget',
    pass: false, signal: 'invalid local link', markdownCount: 0, checkerTimeout: 5000 },
  { name: 'masked fence definition cannot change base heading anchor', md: null, extra: 'deleted-heading-masked-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'combining mark in GitHub heading anchor is preserved', md: null, extra: 'deleted-combining-anchor',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'generic HTML element id is a valid base anchor', md: null, extra: 'deleted-div-id',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'multiline setext heading includes all paragraph lines', md: null, extra: 'deleted-multiline-setext',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'unclosed inline HTML comment must not conceal an active deletion link', md: null, extra: 'deleted-unclosed-inline-comment',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'indented paragraph continuation retains active deleted link', md: null, extra: 'deleted-indented-paragraph',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'generic HTML block pseudo-link is not live', md: null, extra: 'deleted-div-raw-block',
    pass: true, markdownCount: 0 },
  { name: 'active link after generic HTML block is detected', md: null, extra: 'deleted-div-block-then-link',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'list-continuation fenced code hides pseudo-link', md: null, extra: 'deleted-list-fenced',
    pass: true, markdownCount: 0 },
  { name: 'raw HTML block id remains a valid deleted target anchor', md: null, extra: 'deleted-div-block-id',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'malformed overlapping HTML tags fail fast by scan budget', md: '# Stress\n' + '<a '.repeat(15_000),
    extra: 'changed-html-scan-budget', pass: false, signal: 'Malformed inline HTML scan budget exceeded' },
  { name: 'generic HTML block blank terminates masking for subsequent Markdown', md: null, extra: 'deleted-div-blank-link',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'generic HTML close without blank still masks following Markdown', md: null, extra: 'deleted-div-close-no-blank',
    pass: true, markdownCount: 0 },
  { name: 'global heading collision suffix remains valid before deletion', md: null, extra: 'deleted-heading-global-suffix',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'blockquote heading anchor remains valid before deletion', md: null, extra: 'deleted-blockquote-heading',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'list heading anchor remains valid before deletion', md: null, extra: 'deleted-list-heading',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped HTML-like tag keeps embedded live Markdown link', md: null, extra: 'deleted-escaped-html-tag',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'URI autolink content is not a local Markdown link', md: null, extra: 'deleted-uri-autolink',
    pass: true, markdownCount: 0 },
  { name: 'real Markdown link after URI autolink remains active', md: null, extra: 'deleted-uri-autolink-then-link',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'angle-wrapped link cannot have a garbage suffix', md: null, extra: 'deleted-angle-suffix',
    pass: true, markdownCount: 0 },
  { name: 'unbalanced parenthesis invalidates reference definition', md: null, extra: 'deleted-ref-unbalanced',
    pass: true, markdownCount: 0 },
  { name: 'YAML front matter pseudo-link is not live', md: null, extra: 'deleted-yaml-link',
    pass: true, markdownCount: 0 },
  { name: 'link after completed YAML front matter remains active', md: null, extra: 'deleted-yaml-then-link',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'GFM footnote destination is not reference-style link', md: null, extra: 'deleted-gfm-footnote',
    pass: true, markdownCount: 0 },
  { name: 'multiline link reference definition detects deleted target', md: null, extra: 'deleted-ref-multiline',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'list-contained reference definition detects deleted target', md: null, extra: 'deleted-ref-list',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'list-contained multiline reference destination detects deletion', md: null, extra: 'deleted-ref-list-multiline',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'multiline second reference definition cannot override first', md: null, extra: 'deleted-ref-first-wins-multiline',
    pass: true, markdownCount: 0 },
  { name: 'blank line means no multiline reference definition', md: null, extra: 'deleted-ref-blank-line',
    pass: true, markdownCount: 0 },
  { name: 'reference definition cannot interrupt ordinary paragraph', md: null, extra: 'deleted-ref-after-paragraph',
    pass: true, markdownCount: 0 },
  { name: 'multiline inline destination before target detects deletion', md: null, extra: 'deleted-inline-next-line-target',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'multiline inline title detects deletion', md: null, extra: 'deleted-inline-next-line-title',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'multiline inline closing parenthesis detects deletion', md: null, extra: 'deleted-inline-next-line-closer',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'blank line inside inline link is not a valid link', md: null, extra: 'deleted-inline-blank-line',
    pass: true, markdownCount: 0 },
  { name: 'invalid suffix after multiline inline destination is not link', md: null, extra: 'deleted-inline-invalid-suffix',
    pass: true, markdownCount: 0 },
  { name: 'multiline inline link in fenced code is not live', md: null, extra: 'deleted-inline-multiline-code',
    pass: true, markdownCount: 0 },
  { name: 'changed Markdown accepts valid multiline inline destination', md: '# New\n[ok](\n  Target.md)\n',
    pass: true, markdownCount: 1 },
  { name: 'changed Markdown accepts valid multiline reference definition', md: '# New\n[ok][ref]\n\n[ref]:\n  Target.md\n',
    pass: true, markdownCount: 1 },
  { name: 'spaces-only blank line cannot continue an inline link', md: null, extra: 'deleted-inline-spaces-blank',
    pass: true, markdownCount: 0 },
  { name: 'tabs-only blank line cannot continue an inline link', md: null, extra: 'deleted-inline-tabs-blank',
    pass: true, markdownCount: 0 },
  { name: 'deleted Markdown without inbound links allowed', md: null, extra: 'deleted-unused',
    pass: true, markdownCount: 0 },
  { name: 'deleted Markdown ignores unrelated existing broken links', md: null, extra: 'deleted-unrelated',
    pass: true, markdownCount: 0 },
  { name: 'deleted Markdown fenced-code pseudo link ignored', md: null, extra: 'deleted-fenced',
    pass: true, markdownCount: 0 },
  { name: 'deleted target with pre-existing invalid anchor ignored', md: null, extra: 'deleted-bad-anchor', pass: true, markdownCount: 0 },
  { name: 'duplicate ref label honors first valid definition', md: null, extra: 'deleted-duplicate-ref', pass: true, markdownCount: 0 },
  { name: 'invalid code-fence opener does not hide deleted link', md: null, extra: 'deleted-invalid-fence', pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'single-line HTML comment does not trigger inbound link', md: null, extra: 'deleted-comment-inline', pass: true, markdownCount: 0 },
  { name: 'multiline HTML comment does not trigger inbound link', md: null, extra: 'deleted-comment-block', pass: true, markdownCount: 0 },
  { name: 'escaped punctuation inline link to deleted target', md: null, extra: 'deleted-escaped-inline', pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped punctuation reference to deleted target', md: null, extra: 'deleted-escaped-reference', pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'rename old path with unchanged inbound link', md: null, extra: 'renamed-inbound', pass: false, signal: 'invalid local link', markdownCount: 1 },
  { name: 'regular Markdown turned into dangling symlink', md: null, extra: 'typechange-symlink', pass: false, signal: 'missing/unsafe Markdown', markdownCount: 1 },
  { name: 'unchanged internal Markdown symlink source ignored', md: null, extra: 'symlink-source-internal', pass: true, markdownCount: 0 },
  { name: 'unchanged escaping Markdown symlink source ignored', md: null, extra: 'symlink-source-outside', pass: true, markdownCount: 0 },
  { name: 'internal directory symlink alias to deleted target', md: null, extra: 'deleted-alias', pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'non-UTF8 deleted path fails closed', md: null, extra: 'deleted-nonutf8', pass: false, signal: 'Non-UTF8 Git deletion path unsupported' },
  { name: 'inbound repeated links emit bounded diagnostics', md: null, extra: 'deleted-many-links', pass: false, signal: 'Too many findings; diagnostics truncated' },
  { name: 'large base target with unanchored inbound link', md: null, extra: 'deleted-large-target',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'deleted symlink target with formerly valid inbound link', md: null, extra: 'deleted-symlink-target',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'deleted Markdown symlink to text target preserves base anchor validation', md: null,
    extra: 'deleted-symlink-text-target-anchor', pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped HTML comment opener leaves active deleted link', md: null, extra: 'deleted-escaped-comment',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'unused reference definition to deleted target ignored', md: null, extra: 'deleted-unused-ref',
    pass: true, markdownCount: 0 },
  { name: 'shortcut reference to deleted Markdown target rejected', md: null, extra: 'deleted-shortcut-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'inline HTML comment followed by active link remains visible', md: null, extra: 'deleted-comment-then-active',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'block HTML comment closing line masks remainder of line', md: null, extra: 'deleted-comment-block-masks-line',
    pass: true, markdownCount: 0 },
  { name: 'multiline block HTML comment closing line masks remainder of line', md: null, extra: 'deleted-comment-multiline-masks-line',
    pass: true, markdownCount: 0 },
  { name: 'deleted Markdown symlink through BASE directory alias preserves target validation', md: null,
    extra: 'deleted-symlink-dir-alias', pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'inline code prefix does not make following link indented', md: null, extra: 'deleted-inline-code-prefix',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'raw HTML terminator inside backticks must expose following link', md: null, extra: 'deleted-comment-backtick-terminator',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'multiline raw HTML terminator inside backticks exposes following link', md: null, extra: 'deleted-comment-multiline-terminator',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'backtick fence marker inside HTML comment cannot hide following active link', md: null, extra: 'deleted-comment-backtick-fence',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'tilde fence marker inside HTML comment cannot hide following active link', md: null, extra: 'deleted-comment-tilde-fence',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'fenced fake HTML opener cannot hide subsequent link', md: null, extra: 'deleted-fenced-fake-comment',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'code span HTML markers do not hide active deleted link', md: null, extra: 'deleted-code-comment',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'escaped HTML opener followed by real comment ignored', md: null, extra: 'deleted-escaped-then-comment',
    pass: true, markdownCount: 0 },
  { name: 'escaped literal inline-link opener ignored', md: null, extra: 'deleted-escaped-link-opener',
    pass: true, markdownCount: 0 },
  { name: 'escaped literal reference-link opener ignored', md: null, extra: 'deleted-escaped-ref-opener',
    pass: true, markdownCount: 0 },
  { name: 'setext base heading anchor is recognized', md: null, extra: 'deleted-setext-anchor',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'huge valid anchored base target fails conservatively', md: null, extra: 'deleted-huge-anchored',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'newline before spaced angle destination detects deletion', md: null, extra: 'deleted-angle-newline',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'newline before spaced angle reference detects deletion', md: null, extra: 'deleted-angle-newline-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'multiline inline title detects deletion', md: null, extra: 'deleted-title-multiline',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'line ending between each inline link component detects deletion', md: null, extra: 'deleted-inline-component-breaks',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'multiline reference title detects deletion', md: null, extra: 'deleted-ref-title-multiline',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'blank line inside a title is not a link', md: null, extra: 'deleted-title-blank',
    pass: true, markdownCount: 0 },
  { name: 'invalid HTML attribute does not mask a live link', md: null, extra: 'deleted-html-attr-invalid',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'valid multiline HTML attribute masks a pseudo-link', md: null, extra: 'deleted-html-attr-multiline',
    pass: true, markdownCount: 0 },
  { name: 'malformed title suffix is not an inline link', md: null, extra: 'deleted-title-suffix',
    pass: true, markdownCount: 0 },
  { name: 'malformed parenthesized title suffix is not an inline link', md: null, extra: 'deleted-title-paren-suffix',
    pass: true, markdownCount: 0 },
  { name: 'image badge wrapped in a link detects deletion', md: null, extra: 'deleted-image-badge',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'balanced brackets in link text detect deletion', md: null, extra: 'deleted-nested-brackets',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'nested link keeps the inner destination', md: null, extra: 'deleted-nested-inner',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'inactive outer link is not a deleted-target reference', md: null, extra: 'deleted-nested-outer-inactive',
    pass: true, markdownCount: 0 },
  { name: 'undefined nested reference keeps outer link active', md: null, extra: 'deleted-nested-undefined-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'image badge full reference detects deletion', md: null, extra: 'deleted-image-badge-ref',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'three nested destination parentheses remain a link', md: null, extra: 'deleted-dest-depth-3',
    pass: false, signal: 'invalid local link', markdownCount: 0 },
  { name: 'link label past the parser cap fails closed', md: '# New\n[' + 'a'.repeat(513) + '](Target.md)\n',
    pass: false, signal: 'Markdown parser bound exceeded' },
  { name: 'destination past the parser cap fails closed', md: '# New\n[ok](' + 'a'.repeat(4096) + ')\n',
    pass: false, signal: 'Markdown parser bound exceeded' },
  { name: 'fourth destination parenthesis level fails closed', md: '# New\n[ok](a(b(c(d(e)))))\n',
    pass: false, signal: 'Markdown parser bound exceeded' },
  { name: 'bounded inline-comment scan remains within the time limit',
    md: '<!--x-->'.repeat(50000) + '\n[ok](Target.md)\n',
    pass: true, markdownCount: 1, checkerTimeout: 2000 },
  { name: 'interleaved distinct base anchors fail at cumulative parse budget',
    md: null, extra: 'deleted-heading-thrash', pass: false,
    signal: 'Base heading parse budget exceeded', checkerTimeout: 20000 },
  { name: 'shortcut candidates stop at the inbound parser bound',
    md: null, extra: 'deleted-many-shortcuts', pass: false,
    signal: 'Markdown parser bound exceeded' },
];

function executeFixture(test) {
  // These exact fixture paths cannot exist on native Windows: ':' and '>'
  // are forbidden filename characters, and the raw 0xff Git pathname is
  // not representable via Win32 filesystem APIs. Do not count these cases
  // as PASS or weaken the production checker; execute them on POSIX.
  if (process.platform === 'win32') {
    const windowsUnsupported = {
      'deleted-literal-alias': 'Windows cannot create the colon directory used by this fixture',
      'deleted-angle-escaped': 'Windows cannot create a filename containing >',
      'deleted-angle-escaped-ref': 'Windows cannot create a filename containing >',
      'deleted-nonutf8': 'Windows cannot create raw non-UTF8 filename bytes for this fixture',
    };
    if (Object.hasOwn(windowsUnsupported, test.extra)) {
      return { skip: windowsUnsupported[test.extra] };
    }
  }
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gympulse-docs-fixture-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'gympulse-outside-fixture-'));
  try {
    git(root, 'init', '-q', '-b', 'main', '--object-format=sha1');
    git(root, 'config', 'user.name', 'Synthetic CI Fixture');
    git(root, 'config', 'user.email', 'fixture@example.invalid');
    fs.mkdirSync(path.join(root, 'docs'));
    fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Hello There\n## Existing\n');
    fs.writeFileSync(path.join(root, 'README.md'), '# Base\n');
    if (test.extra === 'review-regression') {
      fs.writeFileSync(path.join(root, 'docs', 'consumer.md'), test.consumer + '\n');
      if (test.baseTarget) fs.writeFileSync(path.join(root, 'docs', 'Target.md'), test.baseTarget);
      if (test.deletedName) fs.writeFileSync(path.join(root, 'docs', test.deletedName), '# Target\n');
    }
    if (test.extra === 'deleted-heading-thrash') {
      const headings = Array.from({ length: 80 }, (_, i) => `# Heading ${i}\n`).join('');
      for (let n = 0; n < 3; n++) {
        fs.writeFileSync(path.join(root, 'docs', `Target-${n}.md`), headings);
      }
      fs.writeFileSync(path.join(root, 'docs', 'consumer.md'),
        Array.from({ length: 80 }, (_, i) =>
          `[old](Target-${i % 3}.md#heading-${i})`).join('\n') + '\n');
    }
    // Existing consumer documents are unchanged by the synthetic deletion PR.
    const deletionConsumers = {
      'deleted-inbound': '# Consumer\n[old](Target.md)\n',
      'deleted-reference': '# Consumer\n[old][ref]\n\n[ref]: Target.md#existing\n',
      'deleted-encoded': '# Consumer\n[old](%54arget.md#hello-there)\n',
      'deleted-numeric-entity': '# Consumer\n[old](Target&#46;md)\n',
      'deleted-named-entity': '# Consumer\n[old](Target&period;md)\n',
      'deleted-unknown-entity': '# Consumer\n[old](Target&notSupportedHere;md)\n',
      'deleted-escaped-label': '# Consumer\n[a\\]b](Target.md)\n',
      'deleted-cache-collision': '# Consumer\n[invalid](a.md#x.md%23y)\n[valid](a.md%23x.md#y)\n',
      'deleted-list-continuation': '# Consumer\n- item\n\n    [old](Target.md)\n',
      'deleted-multiline-code': '# Consumer\n`start\n[old](Target.md)\nend`\n',
      'deleted-multiline-code-then-link': '# Consumer\n`start\nnot-link`\n[old](Target.md)\n',
      'deleted-raw-pre': '# Consumer\n<pre>\n[old](Target.md)\n</pre>\n',
      'deleted-raw-script': '# Consumer\n<script>\n[old](Target.md)\n</script>\n',
      'deleted-raw-then-link': '# Consumer\n<pre>\n[old](Target.md)\n</pre>\n[old](Target.md)\n',
      'deleted-heading-entity': '# Consumer\n[old](Target.md#ab)\n',
      'deleted-adjacent-shortcut': '# Consumer\nliteral][old]\n\n[old]: Target.md\n',
      'deleted-heading-copy-valid': '# Consumer\n[old](Target.md#a-b)\n',
      'deleted-heading-copy-invalid': '# Consumer\n[old](Target.md#does-not-exist)\n',
      'deleted-heading-uncertain': '# Consumer\n[old](Target.md#does-not-exist)\n',
      'deleted-colon-shortcut': '# Consumer\nSee [old]: retained text.\n\n[old]: Target.md\n',
      'deleted-cr-raw-block': '# Consumer\r<pre>\r[old](Target.md)\r</pre>\r[old](Target.md)\r',
      'deleted-heading-inline-code': '# Consumer\n[old](Target.md#hello-there)\n',
      'deleted-ref-escaped-label': '# Consumer\n[a\\]b]\n\n[a\\]b]: Target.md\n',
      'deleted-escaped-close-paren': '# Consumer\n[old](Target\\).md)\n',
      'deleted-surviving-alias': '# Consumer\n[old](Alias.md)\n',
      'deleted-incomplete-shortcut': '# Consumer\n[old]( retained text\n\n[old]: Target.md\n',
      'deleted-unquoted-id': '# Consumer\n[old](Target.md#kept)\n',
      'deleted-title-parenthesis': '# Consumer\n[old](Target.md "title (")\n',
      'deleted-heading-code-tag': '# Consumer\n[old](Target.md#hello-there)\n',
      'deleted-id-hyphen': '# Consumer\n[old](Target.md#kept)\n',
      'deleted-data-id-only': '# Consumer\n[old](Target.md#wrong)\n',
      'deleted-casefold-ss': '# Consumer\n[SS]\n\n[ß]: Target.md\n',
      'deleted-angle-escaped': '# Consumer\n[old](<Target\\>.md>)\n',
      'deleted-angle-escaped-ref': '# Consumer\n[old][x]\n\n[x]: <Target\\>.md>\n',
      'deleted-escaped-outer': '# Consumer\n\\[[old](Target.md)\n',
      'deleted-distinct-escaped-label': '# Consumer\n[use][foo\\!]\n\n[foo!]: ../README.md\n[foo\\!]: Target.md\n',
      'deleted-leading-space': '# Consumer\n[old]( Target.md)\n',
      'deleted-leading-tab': '# Consumer\n[old](\tTarget.md)\n',
      'deleted-paren-title': '# Consumer\n[old](Target.md (a title))\n',
      'deleted-casefold-cyrillic': '# Consumer\n[в]\n\n[ᲀ]: Target.md\n',
      'deleted-casefold-cherokee': '# Consumer\n[ꭰ]\n\n[Ꭰ]: Target.md\n',
      'deleted-malformed-first-def': '# Consumer\n[x]\n\n[x]: ../README.md garbage\n[x]: Target.md\n',
      'deleted-valid-ref-title': '# Consumer\n[x]\n\n[x]: Target.md "valid title"\n',
      'deleted-fullwidth-anchor': '# Consumer\n[old](Target.md#%EF%BD%81)\n',
      'deleted-distinct-fullwidth-ref': '# Consumer\n[Ａ]\n\n[A]: Target.md\n',
      'deleted-unrelated-eacute': '# Consumer\n[u](caf&eacute;.md)\n',
      'deleted-unrelated-unknown-entity': '# Consumer\n[u](caf&notSupportedHere;.md)\n',
      'deleted-eacute-target': '# Consumer\n[old](caf&eacute;.md)\n',
      'deleted-root-absolute': '# Consumer\n[old](/docs/Target.md)\n',
      'deleted-root-unrelated': '# Consumer\n[ok](/docs/café.md)\n',
      'deleted-root-normalized': '# Consumer\n[old](/docs/../docs/Target.md)\n',
      'deleted-angle-leading': '# Consumer\n[old]( <Target.md>)\n',
      'deleted-angle-leading-spaced': '# Consumer\n[old]( <my guide.md>)\n',
      'deleted-angle-leading-tab': '# Consumer\n[old](\t<my guide.md>)\n',
      'deleted-angle-leading-title': '# Consumer\n[old]( <my guide.md> "title")\n',
      'deleted-entity-alias': '# Consumer\n[old](alias/&Aacute;.md)\n',
      'deleted-entity-alias-unrelated': '# Consumer\n[u](caf&notSupportedHere;.md)\n',
      'deleted-frontmatter-fake-anchor': '# Consumer\n[old](Target.md#title-x)\n',
      'deleted-frontmatter-real-anchor': '# Consumer\n[old](Target.md#real-heading)\n',
      'deleted-nested-full-ref': '# Consumer\n\\[[old][x]\n\n[x]: Target.md\n',
      'deleted-nbsp-ref': '# Consumer\n[use][a b]\n\n[a b]: ../README.md\n[a b]: Target.md\n',
      'deleted-id-entity': '# Consumer\n[old](Target.md#a%26b)\n',
      'deleted-id-unknown-entity': '# Consumer\n[old](Target.md#unknown)\n',
      'deleted-blockquote-ref': '# Consumer\n[old]\n\n> [old]: Target.md\n',
      'deleted-nested-blockquote-ref': '# Consumer\n[old]\n\n> > [old]: Target.md\n',
      'deleted-paragraph-interrupted-ref': '# Consumer\nparagraph\n[x]: Target.md\n\n[x]\n',
      'deleted-heading-ref': '# Consumer\n[old](Target.md#hello)\n',
      'deleted-heading-ref-undefined': '# Consumer\n[old](Target.md#hello)\n',
      'deleted-ref-in-title': '# Consumer\n[outer](../README.md "[old]")\n\n[old]: Target.md\n',
      'deleted-full-ref-in-title': '# Consumer\n[outer](../README.md "[old][x]")\n\n[x]: Target.md\n',
      'deleted-html-inline-attr': '# Consumer\n<span title="[old](Target.md)"></span>\n',
      'deleted-html-inline-ref': '# Consumer\n<span title="[old][x]"></span>\n\n[x]: Target.md\n',
      'deleted-html-inline-then-active': '# Consumer\n<span title="[old](Target.md)"></span> [old](Target.md)\n',
      'deleted-unused': '# Consumer\n[existing](../README.md)\n',
      'deleted-unrelated': '# Consumer\n[preexisting-broken](never-existed.md)\n',
      'deleted-fenced': '# Consumer\n```md\n[not-a-link](Target.md)\n```\n',
      'deleted-bad-anchor': '# Consumer\n[old](Target.md#already-missing)\n',
      'deleted-duplicate-ref': '# Consumer\n[used][x]\n\n[x]: ../README.md\n[x]: Target.md\n',
      'deleted-invalid-fence': '# Consumer\n```md`no\n[old](Target.md)\n',
      'deleted-comment-inline': '# Consumer\n<!-- [old](Target.md) -->\n',
      'deleted-comment-block': '# Consumer\n<!--\n[old](Target.md)\n-->\n',
      'deleted-escaped-inline': '# Consumer\n[old](Target\\.md)\n',
      'deleted-escaped-reference': '# Consumer\n[old][x]\n\n[x]: Target\\.md\n',
      'renamed-inbound': '# Consumer\n[old](Target.md)\n',
      'deleted-many-links': '# Consumer\n' + '[old](Target.md)\n'.repeat(11000),
      'deleted-many-shortcuts': '# Consumer\n' + '[old]\n'.repeat(11000) + '\n[old]: Target.md\n',
      'deleted-large-target': '# Consumer\n[old](Target.md)\n',
      'deleted-symlink-target': '# Consumer\n[old](Alias.md)\n',
      'deleted-symlink-text-target-anchor': '# Consumer\n[old](Alias.md#real)\n',
      'deleted-escaped-comment': '# Consumer\n\\<!-- not a comment: [old](Target.md) -->\n',
      'deleted-unused-ref': '# Consumer\n[unused]: Target.md\n',
      'deleted-shortcut-ref': '# Consumer\n[old]\n\n[old]: Target.md\n',
      'deleted-comment-then-active': '# Consumer\ntext <!-- note --> [old](Target.md)\n',
      'deleted-comment-block-masks-line': '# Consumer\n<!-- note --> [old](Target.md)\n',
      'deleted-comment-multiline-masks-line': '# Consumer\n<!-- note\n--> [old](Target.md)\n',
      'deleted-symlink-dir-alias': '# Consumer\n[old](../Target.md)\n',
      'deleted-inline-code-prefix': '# Consumer\n`note` [old](Target.md)\n',
      'deleted-comment-backtick-terminator': '# Consumer\ntext <!-- `-->` [old](Target.md)\n',
      'deleted-comment-multiline-terminator': '# Consumer\ntext <!--\n`-->` [old](Target.md)\n',
      'deleted-comment-backtick-fence': '# Consumer\n<!--\n```md\n-->\n[old](Target.md)\n',
      'deleted-comment-tilde-fence': '# Consumer\n<!--\n~~~\n-->\n[old](Target.md)\n',
      'deleted-fenced-fake-comment': '# Consumer\n```md\n<!--\n```\n[old](Target.md)\n',
      'deleted-code-comment': '# Consumer\n`<!--` [old](Target.md) `-->`\n',
      'deleted-escaped-then-comment': '# Consumer\n\\<!-- literal\n<!-- [old](Target.md) -->\n',
      'deleted-escaped-link-opener': '# Consumer\n\\[old](Target.md)\n',
      'deleted-escaped-ref-opener': '# Consumer\n\\[old][x]\n\n[x]: Target.md\n',
      'deleted-setext-anchor': '# Consumer\n[old](Target.md#existing-heading)\n',
      'deleted-huge-anchored': '# Consumer\n[old](Target.md#existing)\n',
      'deleted-ref-after-list': '# Consumer\n- item\n[x]: Target.md\n\n[x]\n',
      'deleted-ref-after-setext': 'Heading\n===\n[ref]: Target.md\n\n[ref]\n',
      'deleted-ref-after-empty-atx': '#\n[ref]: Target.md\n\n[ref]\n',
      'deleted-ref-after-bare-setext': '=\n[ref]: [old](Target.md)\n',
      'deleted-multiline-code-html': '# Consumer\n`code\n<script></script>\n[old](Target.md)\ncode`\n',
      'deleted-list-fence-following-link': '# Consumer\n- ```md\n  ```\n    [old](Target.md)\n',
      'deleted-raw-after-list': '# Consumer\n- item\n<pre>\n[old](Target.md)\n</pre>\n',
      'deleted-ref-after-thematic': '---\n[ref]: Target.md\n\n[ref]\n',
      'deleted-ref-after-inline-html-setext': '<span>Heading</span>\n===\n[ref]: Target.md\n\n[ref]\n',
      'deleted-fenced-list-indent': '# Consumer\n- ```md\n  - literal list marker\n  ```\n    [old](Target.md)\n',
      'deleted-html-attribute-comment': '# Consumer\n<span title="<!--">[old](Target.md)<!-- -->\n',
      'deleted-title-escaped-blank': '# Consumer\n[x](../README.md "title\\\n\n[old](Target.md)\n")\n',
      'deleted-undefined-full-suffix-inline': '# Consumer\n[x][old](Target.md)\n',
      'deleted-nested-defined-shortcut': '# Consumer\n[[inner]](../README.md)\n\n[inner]: Target.md\n',
      'deleted-label-escaped-blank': '# Consumer\n[x\\\n\nz](../README.md "title [old](Target.md)")\n',
      'deleted-ref-list-long-marker': '100. item\n\n     [ref]: Target.md\n\n     [ref]\n',
      'deleted-heading-comment-atx': '# Consumer\n[old](Target.md#helloworld)\n',
      'deleted-heading-comment-setext': '# Consumer\n[old](Target.md#helloworld)\n',
      'deleted-heading-escaped-comment': '# Consumer\n[old](Target.md#hello--hidden--world)\n',
      'deleted-heading-unclosed-comment-budget': '# Consumer\n[old](Target.md#hello)\n',
      'deleted-heading-masked-ref': '# Consumer\n[old](Target.md#hellor)\n',
      'deleted-combining-anchor': '# Consumer\n[old](Target.md#e%CC%81)\n',
      'deleted-div-id': '# Consumer\n[old](Target.md#kept)\n',
      'deleted-multiline-setext': '# Consumer\n[old](Target.md#foo-bar)\n',
      'deleted-heading-global-suffix': '# Consumer\n[old](Target.md#foo-2)\n',
      'deleted-blockquote-heading': '# Consumer\n[old](Target.md#hello)\n',
      'deleted-list-heading': '# Consumer\n[old](Target.md#hello)\n',
      'deleted-escaped-html-tag': '# Consumer\n\\<span title="[old](Target.md)">\n',
      'deleted-unclosed-inline-comment': '# Consumer\nprefix <!-- unclosed\n\n[old](Target.md)\n',
      'deleted-indented-paragraph': '# Consumer\nparagraph\n    [old](Target.md)\n',
      'deleted-div-raw-block': '# Consumer\n<div>\n[old](Target.md)\n</div>\n',
      'deleted-div-block-then-link': '# Consumer\n<div>\n[old](Target.md)\n</div>\n\n[old](Target.md)\n',
      'deleted-list-fenced': '# Consumer\n-    item\n     ~~~md\n     [old](Target.md)\n     ~~~\n',
      'deleted-div-block-id': '# Consumer\n[old](Target.md#kept)\n',
      'deleted-div-blank-link': '# Consumer\n<div>\n[hidden](Target.md)\n\n[old](Target.md)\n',
      'deleted-div-close-no-blank': '# Consumer\n<div>\n[hidden](Target.md)\n</div>\n[still-hidden](Target.md)\n',
      'deleted-uri-autolink': '# Consumer\n<https://example.invalid/[old](Target.md)>\n',
      'deleted-uri-autolink-then-link': '# Consumer\n<https://example.invalid/[old](Target.md)>\n[old](Target.md)\n',
      'deleted-angle-suffix': '# Consumer\n[old](<Target.md>garbage)\n',
      'deleted-ref-unbalanced': '# Consumer\n[x]\n\n[x]: Target).md\n',
      'deleted-yaml-link': '---\ntitle: "[old](Target.md)"\n---\n# Consumer\n',
      'deleted-yaml-then-link': '---\ntitle: "[old](Target.md)"\n---\n[old](Target.md)\n',
      'deleted-gfm-footnote': '# Consumer\nText[^1]\n\n[^1]: Target.md\n',
      'deleted-ref-multiline': '# Consumer\n[old][ref]\n\n[ref]:\n  Target.md\n',
      'deleted-ref-list': '# Consumer\n[old][ref]\n\n- [ref]: Target.md\n',
      'deleted-ref-list-multiline': '# Consumer\n[old][ref]\n\n- [ref]:\n  Target.md\n',
      'deleted-ref-first-wins-multiline': '# Consumer\n[old][ref]\n\n[ref]: ../README.md\n[ref]:\n  Target.md\n',
      'deleted-ref-blank-line': '# Consumer\n[old][ref]\n\n[ref]:\n\n  Target.md\n',
      'deleted-ref-after-paragraph': '# Consumer\nordinary prose\n[ref]: Target.md\n\n[old][ref]\n',
      'deleted-inline-next-line-target': '# Consumer\n[old](\n  Target.md)\n',
      'deleted-inline-next-line-title': '# Consumer\n[old](Target.md\n  "title")\n',
      'deleted-inline-next-line-closer': '# Consumer\n[old](Target.md\n)\n',
      'deleted-inline-blank-line': '# Consumer\n[old](\n\nTarget.md)\n',
      'deleted-inline-invalid-suffix': '# Consumer\n[old](Target.md\n  suffix)\n',
      'deleted-inline-multiline-code': '# Consumer\n```md\n[old](\n  Target.md)\n```\n',
      'deleted-inline-spaces-blank': '# Consumer\n[old](\n  \nTarget.md)\n',
      'deleted-inline-tabs-blank': '# Consumer\n[old](Target.md\n \t\n)\n',
      'deleted-angle-newline': '# Consumer\n[old](\n<my guide.md>)\n',
      'deleted-angle-newline-ref': '# Consumer\n[old][ref]\n\n[ref]:\n<my guide.md>\n',
      'deleted-title-multiline': '# Consumer\n[old](Target.md "title\ncontinued")\n',
      'deleted-inline-component-breaks': '# Consumer\n[old](\nTarget.md\n"title"\n)\n',
      'deleted-ref-title-multiline': '# Consumer\n[old][ref]\n\n[ref]: Target.md \'\ntitle\nline\n\'\n',
      'deleted-title-blank': '# Consumer\n[old](Target.md "title\n\ncontinued")\n',
      'deleted-html-attr-invalid': '# Consumer\n<span title="[old](Target.md)" id=>\n',
      'deleted-html-attr-multiline': '# Consumer\n<b2\ndata="[old](Target.md)" >\n',
      'deleted-title-suffix': '# Consumer\n[old](Target.md "title"extra)\n',
      'deleted-title-paren-suffix': '# Consumer\n[old](Target.md (title)extra)\n',
      'deleted-image-badge': '# Consumer\n[![badge](https://example.invalid/badge.png)](Target.md)\n',
      'deleted-nested-brackets': '# Consumer\n[link [foo [bar]]](Target.md)\n',
      'deleted-nested-inner': '# Consumer\n[[inner](Target.md)](../README.md)\n',
      'deleted-nested-outer-inactive': '# Consumer\n[[inner](../README.md)](Target.md)\n',
      'deleted-nested-undefined-ref': '# Consumer\n[[inner][missing]](Target.md)\n',
      'deleted-image-badge-ref': '# Consumer\n[![badge](https://example.invalid/badge.png)][ref]\n\n[ref]: Target.md\n',
      'deleted-dest-depth-3': '# Consumer\n[old](a(b(c(d))).md)\n',
    };
    if (Object.hasOwn(deletionConsumers, test.extra)) {
      fs.writeFileSync(path.join(root, 'docs', 'consumer.md'), deletionConsumers[test.extra]);
    }
    if (test.extra === 'deleted-many-unrelated') {
      // 340 Markdown sources (<500 cap), with >1000 distinct ordinary prefixes.
      for (let n = 0; n < 340; n++) {
        const folder = path.join(root, 'docs', 'd' + n, 's');
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(path.join(folder, 'f' + n + '.md'), '# Good\n[ok](../../../README.md)\n');
      }
      fs.writeFileSync(path.join(root, 'docs', 'other.md'), '# Unlinked\n');
    }
    if (['deleted-unrelated-eacute', 'deleted-root-unrelated', 'deleted-eacute-target'].includes(test.extra)) {
      fs.writeFileSync(path.join(root, 'docs', 'café.md'), '# Accent\n');
    }
    if (test.extra === 'changed-eacute-valid') {
      fs.writeFileSync(path.join(root, 'docs', 'cafeé.md'), '# Accent\n');
    }
    if (['deleted-angle-leading-spaced', 'deleted-angle-leading-tab',
        'deleted-angle-leading-title', 'deleted-angle-newline',
        'deleted-angle-newline-ref'].includes(test.extra)) {
      fs.writeFileSync(path.join(root, 'docs', 'my guide.md'), '# Spaced\n');
    }
    if (test.extra === 'deleted-dest-depth-3') {
      fs.writeFileSync(path.join(root, 'docs', 'a(b(c(d))).md'), '# Nested parentheses\n');
    }
    if (['deleted-frontmatter-fake-anchor', 'deleted-frontmatter-real-anchor'].includes(test.extra)) {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '---\ntitle: x\n---\n# Real Heading\n');
    }
    if (['typechange-anchor-broken', 'typechange-anchor-preserved',
          'typechange-unanchored', 'typechange-anchor-nonmarkdown',
          'typechange-anchor-cached', 'typechange-anchor-budget',
          'typechange-anchor-uncertain'].includes(test.extra)) {
      if (test.extra === 'typechange-anchor-budget') {
        for (let n = 0; n < 3; n++) {
          fs.writeFileSync(path.join(root, 'docs', `Target-${n}.md`), '# Old\n');
          fs.writeFileSync(path.join(root, 'docs', `Other-${n}.md`), '# Old\n' + 'x'.repeat(100000));
        }
        fs.writeFileSync(path.join(root, 'docs', 'consumer.md'), '# Consumer\n' +
          Array.from({ length: 90 }, (_, n) => `[old](Target-${n % 3}.md#old)`).join('\n') + '\n');
      } else {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Old\n');
      const replacement = (test.extra === 'typechange-anchor-nonmarkdown' || test.extra === 'typechange-anchor-uncertain') ? 'Other.txt' : 'Other.md';
      fs.writeFileSync(path.join(root, 'docs', replacement),
        test.extra === 'typechange-anchor-broken' || test.extra === 'typechange-anchor-nonmarkdown'
          ? '# New\n' : test.extra === 'typechange-anchor-uncertain' ? '# &Aopf;\n' : '# Old\n' + (test.extra === 'typechange-anchor-cached' ? 'x'.repeat(690000) : ''));
      fs.writeFileSync(path.join(root, 'docs', 'consumer.md'),
        test.extra === 'typechange-unanchored'
          ? '# Consumer\n[old](Target.md)\n'
          : '# Consumer\n' + (test.extra === 'typechange-anchor-cached'
            ? Array.from({ length: 90 }, () => '[old](Target.md#old)').join('\n') + '\n'
            : '[old](Target.md#old)\n'));
      }
    }
    // Some bypass scenarios require additional paths already present in BASE.
    const specialSymlinks = ['symlink-source-internal', 'symlink-source-outside', 'deleted-alias', 'deleted-alias-retarget', 'deleted-literal-alias', 'deleted-surviving-alias', 'deleted-entity-alias', 'deleted-entity-alias-unrelated', 'alias-text-to-markdown-anchor'];
    if (specialSymlinks.includes(test.extra)) {
      try {
        if (test.extra === 'deleted-surviving-alias') {
          fs.symlinkSync('Target.md', path.join(root, 'docs', 'Alias.md'));
        } else if (test.extra === 'alias-text-to-markdown-anchor') {
          fs.symlinkSync('Target.md', path.join(root, 'docs', 'Alias.txt'));
        } else if (test.extra === 'deleted-literal-alias') {
          fs.mkdirSync(path.join(root, ':'));
          fs.symlinkSync('../docs', path.join(root, ':', 'alias'), 'dir');
          fs.writeFileSync(path.join(root, 'README.md'), '# Base\n[old](:/alias/Target.md)\n');
        } else if (['deleted-entity-alias', 'deleted-entity-alias-unrelated'].includes(test.extra)) {
          fs.mkdirSync(path.join(root, 'docs', 'real'));
          fs.writeFileSync(path.join(root, 'docs', 'real', 'Á.md'), '# Accented target\n');
          fs.symlinkSync('real', path.join(root, 'docs', 'alias'), 'dir');
        } else if (test.extra === 'deleted-alias' || test.extra === 'deleted-alias-retarget') {
          fs.symlinkSync('docs', path.join(root, 'alias'), 'dir');
          fs.writeFileSync(path.join(root, 'README.md'), '# Base\n[old](alias/Target.md)\n');
        } else {
          if (test.extra === 'symlink-source-outside') {
            fs.writeFileSync(path.join(outside, 'consumer.md'), '# Outside\n');
          }
          fs.symlinkSync(test.extra === 'symlink-source-internal' ? '../README.md' : path.join(outside, 'consumer.md'),
            path.join(root, 'docs', 'consumer.md'));
        }
      } catch (error) {
        if (['EPERM', 'ENOSYS', 'EACCES', 'EOPNOTSUPP', 'ENOTSUP'].includes(error.code)) {
          return { skip: 'symlink creation unsupported on current host' };
        }
        throw error;
      }
    }
    const rawName = test.extra === 'deleted-nonutf8'
      ? Buffer.concat([Buffer.from(path.join(root, 'docs', 'bad-')), Buffer.from([0xff]), Buffer.from('.md')])
      : null;
    if (rawName) fs.writeFileSync(rawName, '# Synthetic raw-byte file\n');
    if (test.extra === 'deleted-large-target') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Target\n' + 'x'.repeat(1024 * 1024 + 1));
    }
    if (test.extra === 'deleted-symlink-target' || test.extra === 'deleted-symlink-text-target-anchor') {
      const realFile = test.extra === 'deleted-symlink-text-target-anchor' ? 'Real.txt' : 'Real.md';
      fs.writeFileSync(path.join(root, 'docs', realFile), '# Real\n');
      try {
        fs.symlinkSync(realFile, path.join(root, 'docs', 'Alias.md'));
      } catch (error) {
        if (['EPERM', 'ENOSYS', 'EACCES', 'EOPNOTSUPP', 'ENOTSUP'].includes(error.code)) {
          return { skip: 'symlink creation unsupported on current host' };
        }
        throw error;
      }
    }
    if (test.extra === 'deleted-symlink-dir-alias') {
      fs.writeFileSync(path.join(root, 'docs', 'Real.md'), '# Real\n');
      try {
        fs.symlinkSync('docs', path.join(root, 'aliasdir'));
        fs.symlinkSync('aliasdir/Real.md', path.join(root, 'Target.md'));
      } catch (error) {
        if (['EPERM', 'ENOSYS', 'EACCES', 'EOPNOTSUPP', 'ENOTSUP'].includes(error.code)) {
          return { skip: 'symlink creation unsupported on current host' };
        }
        throw error;
      }
    }
    if (test.extra === 'deleted-cache-collision') {
      fs.writeFileSync(path.join(root, 'docs', 'a.md'), '# Unrelated\n');
      fs.writeFileSync(path.join(root, 'docs', 'a.md#x.md'), '# y\n');
    }
    if (test.extra === 'deleted-heading-entity') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# A&#66;\n');
    }
    if (['deleted-heading-copy-valid', 'deleted-heading-copy-invalid'].includes(test.extra)) {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# A&copy; B\n');
    }
    if (test.extra === 'deleted-heading-uncertain') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# A&NonstandardName;\n');
    }
    if (test.extra === 'deleted-heading-masked-ref') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'),
        '# [Hello][r]\n\n```md\n[r]: ../README.md\n```\n');
    }
    if (test.extra === 'deleted-combining-anchor') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# e\u0301\n');
    }
    if (test.extra === 'deleted-div-block-id') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'),
        '<div id="kept">\ntext\n</div>\n');
    }
    if (test.extra === 'deleted-div-id') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '<div id="kept">hi</div>\n');
    }
    if (test.extra === 'deleted-multiline-setext') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), 'Foo\nBar\n---\n');
    }
    if (test.extra === 'deleted-heading-comment-atx') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Hello<!--hidden-->World\n');
    }
    if (test.extra === 'deleted-heading-comment-setext') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), 'Hello<!--hidden-->World\n---\n');
    }
    if (test.extra === 'deleted-heading-escaped-comment') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Hello\\<!--hidden-->World\n');
    }
    if (test.extra === 'deleted-heading-unclosed-comment-budget') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Hello\n# ' + '<!--'.repeat(32000) + '\n');
    }
    if (test.extra === 'deleted-heading-global-suffix') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Foo\n# Foo-1\n# Foo\n');
    }
    if (test.extra === 'deleted-blockquote-heading') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '> # Hello\n');
    }
    if (test.extra === 'deleted-list-heading') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '- # Hello\n');
    }
    if (test.extra === 'deleted-heading-ref') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'),
        '# [Hello][r]\n\n[r]: https://example.invalid\n');
    }
    if (test.extra === 'deleted-heading-ref-undefined') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# [Hello][r]\n');
    }
    if (test.extra === 'deleted-id-entity') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '<a id="a&amp;b"></a>\n');
    }
    if (test.extra === 'deleted-id-unknown-entity') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '<a id="a&NotRecognized;">unknown</a>\n');
    }
    if (test.extra === 'deleted-fullwidth-anchor') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Ａ\n');
    }
    if (test.extra === 'deleted-heading-code-tag') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Hello `<There>`\n');
    }
    if (test.extra === 'deleted-id-hyphen') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '<a data-id=wrong id=kept></a>\n');
    }
    if (test.extra === 'deleted-data-id-only') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '<a data-id=wrong></a>\n');
    }
    if (['deleted-angle-escaped', 'deleted-angle-escaped-ref'].includes(test.extra)) {
      fs.writeFileSync(path.join(root, 'docs', 'Target>.md'), '# Angle escaped\n');
    }
    if (test.extra === 'deleted-heading-inline-code') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Hello `There`\n');
    }
    if (test.extra === 'deleted-unquoted-id') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '<a id=kept></a>\n');
    }
    if (test.extra === 'deleted-ref-unbalanced') {
      fs.writeFileSync(path.join(root, 'docs', 'Target).md'), '# Invalid reference target\n');
    }
    if (test.extra === 'deleted-escaped-close-paren') {
      fs.writeFileSync(path.join(root, 'docs', 'Target).md'), '# Parenthesized target\n');
    }
    if (test.extra === 'deleted-setext-anchor') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), 'Existing Heading\n===\n');
    }
    if (test.extra === 'deleted-huge-anchored') {
      fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '## Existing\n' + 'x'.repeat(9_000_000));
    }
    git(root, 'add', '-A');
    git(root, 'commit', '-q', '-m', 'synthetic baseline');
    let base = git(root, 'rev-parse', 'HEAD');
    if (test.extra === 'case' && fs.existsSync(path.join(root, 'docs', 'target.md'))) {
      return { skip: 'case-insensitive filesystem; case-mismatch cannot be asserted' };
    }
    git(root, 'checkout', '-q', '-b', 'pr');
    if (test.md !== null) fs.writeFileSync(path.join(root, 'docs', 'candidate.md'), test.md);
    if (test.extra === 'deleted-alias-retarget') {
      fs.mkdirSync(path.join(root, 'other'));
      fs.writeFileSync(path.join(root, 'other', 'placeholder.txt'), 'still tracked\n');
      fs.rmSync(path.join(root, 'alias'));
      fs.symlinkSync('other', path.join(root, 'alias'), 'dir');
    }
    if (test.extra === 'modified') fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Changed\n[missing](absent-modified-target.md)\n');
    const deletions = ['deleted-inbound', 'deleted-reference', 'deleted-encoded',
      'deleted-numeric-entity', 'deleted-named-entity', 'deleted-unknown-entity', 'deleted-escaped-label',
      'deleted-list-continuation', 'deleted-multiline-code', 'deleted-multiline-code-then-link',
      'deleted-raw-pre', 'deleted-raw-script', 'deleted-raw-then-link',
      'deleted-unused', 'deleted-unrelated', 'deleted-fenced',
      'deleted-bad-anchor', 'deleted-duplicate-ref',
      'deleted-invalid-fence', 'deleted-comment-inline', 'deleted-comment-block',
      'deleted-escaped-inline', 'deleted-escaped-reference', 'deleted-many-links',
      'deleted-many-shortcuts',
      'deleted-large-target', 'deleted-escaped-comment', 'deleted-unused-ref',
      'deleted-shortcut-ref', 'deleted-comment-then-active', 'deleted-comment-block-masks-line',
      'deleted-comment-multiline-masks-line', 'deleted-inline-code-prefix',
      'deleted-fenced-fake-comment', 'deleted-comment-backtick-terminator',
      'deleted-comment-multiline-terminator', 'deleted-comment-backtick-fence',
      'deleted-comment-tilde-fence', 'deleted-code-comment', 'deleted-escaped-then-comment',
      'deleted-escaped-link-opener', 'deleted-escaped-ref-opener',
      'deleted-setext-anchor', 'deleted-huge-anchored', 'deleted-heading-entity',
      'deleted-heading-copy-valid', 'deleted-heading-copy-invalid', 'deleted-heading-uncertain',
      'deleted-adjacent-shortcut', 'deleted-alias-retarget', 'deleted-literal-alias',
      'deleted-colon-shortcut', 'deleted-cr-raw-block', 'deleted-heading-inline-code',
      'deleted-ref-escaped-label', 'deleted-escaped-close-paren', 'deleted-surviving-alias',
      'deleted-incomplete-shortcut', 'deleted-unquoted-id',
      'deleted-title-parenthesis', 'deleted-heading-code-tag', 'deleted-id-hyphen',
      'deleted-data-id-only', 'deleted-casefold-ss', 'deleted-escaped-outer',
      'deleted-distinct-escaped-label',
      'deleted-leading-space', 'deleted-leading-tab', 'deleted-paren-title',
      'deleted-casefold-cyrillic', 'deleted-casefold-cherokee',
      'deleted-malformed-first-def', 'deleted-valid-ref-title',
      'deleted-fullwidth-anchor', 'deleted-distinct-fullwidth-ref',
      'deleted-unrelated-eacute', 'deleted-unrelated-unknown-entity',
      'deleted-root-absolute', 'deleted-root-unrelated', 'deleted-root-normalized',
      'deleted-angle-leading', 'deleted-entity-alias-unrelated',
      'deleted-frontmatter-fake-anchor',
      'deleted-frontmatter-real-anchor',
      'deleted-nested-full-ref', 'deleted-nbsp-ref',
      'deleted-id-entity', 'deleted-id-unknown-entity',
      'deleted-blockquote-ref', 'deleted-nested-blockquote-ref',
      'deleted-paragraph-interrupted-ref',
      'deleted-heading-ref', 'deleted-heading-ref-undefined',
      'deleted-ref-in-title', 'deleted-full-ref-in-title',
      'deleted-ref-after-list', 'deleted-heading-masked-ref',
      'deleted-ref-after-setext', 'deleted-ref-after-empty-atx',
      'deleted-ref-after-bare-setext', 'deleted-multiline-code-html',
      'deleted-list-fence-following-link', 'deleted-raw-after-list',
      'deleted-ref-after-thematic', 'deleted-ref-after-inline-html-setext',
      'deleted-fenced-list-indent', 'deleted-html-attribute-comment',
      'deleted-title-escaped-blank', 'deleted-undefined-full-suffix-inline',
      'deleted-nested-defined-shortcut',
      'deleted-label-escaped-blank', 'deleted-ref-list-long-marker',
      'deleted-heading-comment-atx', 'deleted-heading-comment-setext',
      'deleted-heading-escaped-comment',
      'deleted-heading-unclosed-comment-budget',
      'deleted-combining-anchor', 'deleted-div-id', 'deleted-multiline-setext',
      'deleted-heading-global-suffix', 'deleted-blockquote-heading',
      'deleted-list-heading', 'deleted-escaped-html-tag',
      'deleted-uri-autolink', 'deleted-uri-autolink-then-link',
      'deleted-angle-suffix', 'deleted-yaml-link', 'deleted-yaml-then-link',
      'deleted-gfm-footnote',
      'deleted-ref-multiline', 'deleted-ref-list', 'deleted-ref-list-multiline',
      'deleted-ref-first-wins-multiline', 'deleted-ref-blank-line',
      'deleted-ref-after-paragraph',
      'deleted-inline-next-line-target', 'deleted-inline-next-line-title',
      'deleted-inline-next-line-closer', 'deleted-inline-blank-line',
      'deleted-inline-invalid-suffix', 'deleted-inline-multiline-code',
      'deleted-inline-spaces-blank', 'deleted-inline-tabs-blank',
      'deleted-angle-newline', 'deleted-angle-newline-ref',
      'deleted-title-multiline', 'deleted-inline-component-breaks',
      'deleted-ref-title-multiline', 'deleted-title-blank',
      'deleted-html-attr-invalid', 'deleted-html-attr-multiline',
      'deleted-title-suffix', 'deleted-title-paren-suffix',
      'deleted-image-badge', 'deleted-nested-brackets',
      'deleted-nested-inner', 'deleted-nested-outer-inactive',
      'deleted-nested-undefined-ref',
      'deleted-image-badge-ref', 'deleted-dest-depth-3',
      'deleted-unclosed-inline-comment', 'deleted-indented-paragraph',
      'deleted-div-raw-block', 'deleted-div-block-then-link',
      'deleted-list-fenced', 'deleted-div-block-id',
      'deleted-div-blank-link', 'deleted-div-close-no-blank',
      'deleted-html-inline-attr', 'deleted-html-inline-ref',
      'deleted-html-inline-then-active',
      'symlink-source-internal', 'symlink-source-outside', 'deleted-alias'];
    if (deletions.includes(test.extra)) fs.rmSync(path.join(root, 'docs', 'Target.md'));
    if (test.extra === 'review-regression') fs.rmSync(path.join(root, 'docs', test.deletedName || 'Target.md'));
    if (test.extra === 'deleted-heading-thrash') {
      for (let n = 0; n < 3; n++) fs.rmSync(path.join(root, 'docs', `Target-${n}.md`));
    }
    if (test.extra === 'deleted-many-unrelated') {
      fs.rmSync(path.join(root, 'docs', 'other.md'));
    }
    if (test.extra === 'deleted-eacute-target') {
      fs.rmSync(path.join(root, 'docs', 'café.md'));
    }
    if (test.extra === 'deleted-entity-alias') {
      fs.rmSync(path.join(root, 'docs', 'real', 'Á.md'));
    }
    if (['deleted-angle-leading-spaced', 'deleted-angle-leading-tab',
        'deleted-angle-leading-title', 'deleted-angle-newline',
        'deleted-angle-newline-ref'].includes(test.extra)) {
      fs.rmSync(path.join(root, 'docs', 'my guide.md'));
    }
    if (test.extra === 'deleted-dest-depth-3') {
      fs.rmSync(path.join(root, 'docs', 'a(b(c(d))).md'));
    }
    if (test.extra === 'deleted-ref-unbalanced') {
      fs.rmSync(path.join(root, 'docs', 'Target).md'));
    }
    if (test.extra === 'deleted-escaped-close-paren') {
      fs.rmSync(path.join(root, 'docs', 'Target).md'));
    }
    if (['deleted-angle-escaped', 'deleted-angle-escaped-ref'].includes(test.extra)) {
      fs.rmSync(path.join(root, 'docs', 'Target>.md'));
    }
    if (test.extra === 'deleted-cache-collision') {
      fs.rmSync(path.join(root, 'docs', 'a.md'));
      fs.rmSync(path.join(root, 'docs', 'a.md#x.md'));
    }
    if (test.extra === 'deleted-symlink-target' || test.extra === 'deleted-symlink-text-target-anchor') fs.rmSync(path.join(root, 'docs', 'Alias.md'));
    if (test.extra === 'deleted-symlink-dir-alias') fs.rmSync(path.join(root, 'Target.md'));
    if (rawName) fs.rmSync(rawName);
    if (test.extra === 'renamed-inbound') git(root, 'mv', 'docs/Target.md', 'docs/Renamed.md');
    if (['typechange-anchor-broken', 'typechange-anchor-preserved',
         'typechange-unanchored', 'typechange-anchor-nonmarkdown',
         'typechange-anchor-cached', 'typechange-anchor-budget',
         'typechange-anchor-uncertain'].includes(test.extra)) {
      try {
        if (test.extra === 'typechange-anchor-budget') {
          for (let n = 0; n < 3; n++) {
            fs.rmSync(path.join(root, 'docs', `Target-${n}.md`));
            fs.symlinkSync(`Other-${n}.md`, path.join(root, 'docs', `Target-${n}.md`), 'file');
          }
        } else {
          fs.rmSync(path.join(root, 'docs', 'Target.md'));
          fs.symlinkSync((test.extra === 'typechange-anchor-nonmarkdown' || test.extra === 'typechange-anchor-uncertain') ? 'Other.txt' : 'Other.md',
            path.join(root, 'docs', 'Target.md'), 'file');
        }
      } catch (error) {
        if (['EPERM', 'ENOSYS', 'EACCES', 'EOPNOTSUPP', 'ENOTSUP'].includes(error.code)) {
          return { skip: 'symlink creation unsupported on current host' };
        }
        throw error;
      }
    }
    if (test.extra === 'typechange-symlink') {
      fs.rmSync(path.join(root, 'docs', 'Target.md'));
      try {
        fs.symlinkSync('not-present.md', path.join(root, 'docs', 'Target.md'));
      } catch (error) {
        if (['EPERM', 'ENOSYS', 'EACCES', 'EOPNOTSUPP', 'ENOTSUP'].includes(error.code)) {
          return { skip: 'symlink creation unsupported on current host' };
        }
        throw error;
      }
    }
    if (test.extra === 'oversized') fs.writeFileSync(path.join(root, 'docs', 'candidate.md'), Buffer.alloc(1024 * 1024 + 1, 'X'));
    if (test.extra === 'renamed') git(root, 'mv', 'docs/Target.md', 'docs/Renamed.md');
    if (test.extra === 'other') fs.writeFileSync(path.join(root, 'other.txt'), 'synthetic non-doc\n');
    if (test.extra === 'other-white') fs.writeFileSync(path.join(root, 'other.txt'), 'synthetic non-doc with trailing spaces  \n');
    if (test.extra === 'spaced') {
      fs.writeFileSync(path.join(root, 'docs', 'space file.md'), '# New\n[missing](absent-spaced-target.md)\n');
    }
    if (test.extra === 'traversal') {
      const target = path.join(outside, 'outside.txt');
      fs.writeFileSync(target, 'synthetic existing outside target\n');
      const rel = path.relative(path.join(root, 'docs'), target);
      assert.ok(!path.isAbsolute(rel) && rel.split(path.sep).includes('..'), 'fixture must escape repository');
      const url = rel.split(path.sep).map(encodeURIComponent).join('/');
      fs.writeFileSync(path.join(root, 'docs', 'candidate.md'), `# New\n[escape](${url})\n`);
    }
    if (test.extra === 'symlink') {
      const target = path.join(outside, 'outside.txt');
      fs.writeFileSync(target, 'synthetic outside repository\n');
      try {
        fs.symlinkSync(target, path.join(root, 'docs', 'external-link.txt'));
      } catch (error) {
        if (['EPERM', 'ENOSYS', 'EACCES', 'EOPNOTSUPP', 'ENOTSUP'].includes(error.code)) {
          return { skip: 'symlinks unavailable on this filesystem/user' };
        }
        throw error;
      }
    }
    git(root, 'add', '-A');
    git(root, 'commit', '-q', '-m', 'synthetic PR change');
    const head = git(root, 'rev-parse', 'HEAD');
    git(root, 'checkout', '-q', 'main');
    if (test.extra === 'diverged') {
      fs.rmSync(path.join(root, 'docs', 'Target.md'));
      git(root, 'add', '-A');
      git(root, 'commit', '-q', '-m', 'base-only removal after PR branch');
      base = git(root, 'rev-parse', 'HEAD');
    }
    if (test.extra === 'octopus') {
      git(root, 'checkout', '-q', '-b', 'third');
      fs.writeFileSync(path.join(root, 'third-party.txt'), 'unrelated third-parent change\n');
      git(root, 'add', '-A');
      git(root, 'commit', '-q', '-m', 'unrelated third parent');
      git(root, 'checkout', '-q', 'main');
      git(root, 'merge', '-q', '--no-ff', '-m', 'synthetic three-parent merge', 'pr', 'third');
    } else {
      git(root, 'merge', '-q', '--no-ff', '-m', 'synthetic PR merge', 'pr');
    }
    const merge = git(root, 'rev-parse', 'HEAD');
    if (test.extra === 'diverged') {
      assert.ok(!fs.existsSync(path.join(root, 'docs', 'Target.md')), 'base-only deleted Markdown must stay absent in merge');
    }
    if (test.extra === 'symlink' && !fs.lstatSync(path.join(root, 'docs', 'external-link.txt')).isSymbolicLink()) {
      return { skip: 'Git checkout did not materialize a symlink' };
    }
    const suppliedBase = test.wrongBase ? '0'.repeat(40) : base;
    const suppliedHead = test.wrongHead ? base : head;
    const result = run(process.execPath, [checker, root, suppliedBase, suppliedHead, merge], root, false, test.checkerTimeout || 20000);
    const combined = result.stdout + result.stderr;
    assert.equal(result.status === 0, test.pass, `${test.name}: unexpected checker exit (${result.status})\n${combined}`);
    if (test.signal) assert.ok(combined.includes(test.signal), `${test.name}: missing signal ${test.signal}\n${combined}`);
    if (test.markdownCount !== undefined) {
      assert.ok(combined.includes(`markdown_files=${test.markdownCount}`), `${test.name}: incorrect docs count\n${combined}`);
    }
    return { checked: true };
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
}

let failed = 0, skipped = 0;
for (const test of fixtures) {
  try {
    const result = executeFixture(test);
    if (result.skip) {
      skipped += 1;
      console.log(`SKIP fixture: ${test.name} (${result.skip})`);
    } else {
      console.log(`PASS fixture: ${test.name} (expected checker ${test.pass ? 'PASS' : 'FAIL'})`);
    }
  } catch (error) {
    failed += 1;
    console.error(`FAIL fixture: ${test.name}: ${error.message}`);
  }
}
console.log(`Offline fixtures: ${fixtures.length - failed - skipped}/${fixtures.length} executed successfully; ${skipped} SKIP; ${failed} FAIL; GitHub Actions negative runs: NOT RUN`);
if (failed) process.exitCode = 1;
