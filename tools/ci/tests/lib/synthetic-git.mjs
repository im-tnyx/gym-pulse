import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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

export function run(bin, args, cwd, expectSuccess = true, timeout = 20000) {
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

export function git(cwd, ...args) {
  // Also neutralize explicitly configured repo hooks/signing; never invoke PR scripts.
  return run('git', [
    '-c', 'commit.gpgSign=false',
    '-c', `core.hooksPath=${path.join(cwd, '.nonexistent-fixture-hooks')}`,
    ...args,
  ], cwd).stdout.trim();
}
