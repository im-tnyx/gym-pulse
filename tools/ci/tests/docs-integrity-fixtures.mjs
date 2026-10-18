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
const discoveryEnv = {
  ...process.env,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: os.devNull,
  GIT_CONFIG_SYSTEM: os.devNull,
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
  throw new Error('Cannot obtain Git repository-local environment variables');
}
const localGitVars = localVarsResult.stdout.split(/\r?\n/).filter(Boolean);

function run(bin, args, cwd, expectSuccess = true) {
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
    timeout: 20000,
    maxBuffer: 1024 * 1024,
    env: {
      ...env,
      // Ignore machine/user Git signing, hooks and credential configuration.
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_GLOBAL: os.devNull,
      GIT_CONFIG_SYSTEM: os.devNull,
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
];

function executeFixture(test) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gympulse-docs-fixture-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'gympulse-outside-fixture-'));
  try {
    git(root, 'init', '-q', '-b', 'main', '--object-format=sha1');
    git(root, 'config', 'user.name', 'Synthetic CI Fixture');
    git(root, 'config', 'user.email', 'fixture@example.invalid');
    fs.mkdirSync(path.join(root, 'docs'));
    fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Hello There\n## Existing\n');
    fs.writeFileSync(path.join(root, 'README.md'), '# Base\n');
    // Existing consumer documents are unchanged by the synthetic deletion PR.
    const deletionConsumers = {
      'deleted-inbound': '# Consumer\n[old](Target.md)\n',
      'deleted-reference': '# Consumer\n[old][ref]\n\n[ref]: Target.md#existing\n',
      'deleted-encoded': '# Consumer\n[old](%54arget.md#hello-there)\n',
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
    };
    if (Object.hasOwn(deletionConsumers, test.extra)) {
      fs.writeFileSync(path.join(root, 'docs', 'consumer.md'), deletionConsumers[test.extra]);
    }
    // Some bypass scenarios require additional paths already present in BASE.
    const specialSymlinks = ['symlink-source-internal', 'symlink-source-outside', 'deleted-alias'];
    if (specialSymlinks.includes(test.extra)) {
      try {
        if (test.extra === 'deleted-alias') {
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
    git(root, 'add', '-A');
    git(root, 'commit', '-q', '-m', 'synthetic baseline');
    let base = git(root, 'rev-parse', 'HEAD');
    if (test.extra === 'case' && fs.existsSync(path.join(root, 'docs', 'target.md'))) {
      return { skip: 'case-insensitive filesystem; case-mismatch cannot be asserted' };
    }
    git(root, 'checkout', '-q', '-b', 'pr');
    if (test.md !== null) fs.writeFileSync(path.join(root, 'docs', 'candidate.md'), test.md);
    if (test.extra === 'modified') fs.writeFileSync(path.join(root, 'docs', 'Target.md'), '# Changed\n[missing](absent-modified-target.md)\n');
    if (Object.hasOwn(deletionConsumers, test.extra)) fs.rmSync(path.join(root, 'docs', 'Target.md'));
    const deletions = ['deleted-bad-anchor', 'deleted-duplicate-ref',
      'deleted-invalid-fence', 'deleted-comment-inline', 'deleted-comment-block',
      'deleted-escaped-inline', 'deleted-escaped-reference', 'deleted-many-links',
      'symlink-source-internal', 'symlink-source-outside', 'deleted-alias'];
    if (deletions.includes(test.extra)) fs.rmSync(path.join(root, 'docs', 'Target.md'));
    if (rawName) fs.rmSync(rawName);
    if (test.extra === 'renamed-inbound') git(root, 'mv', 'docs/Target.md', 'docs/Renamed.md');
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
    const result = run(process.execPath, [checker, root, suppliedBase, suppliedHead, merge], root, false);
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
