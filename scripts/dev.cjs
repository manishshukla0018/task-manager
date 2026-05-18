/**
 * Starts backend and frontend without concurrently (fixes "spawn cmd.exe ENOENT" on Windows).
 */
const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const children = [];

function run(label, cwd, script) {
  const child = spawn('npm', ['run', script], {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
    windowsHide: false,
  });

  child.on('error', (err) => {
    console.error(`[${label}] failed to start:`, err.message);
    shutdown(1);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code);
    }
  });

  children.push(child);
  console.log(`[${label}] starting in ${cwd}`);
}

function shutdown(code = 0) {
  children.forEach((c) => {
    if (!c.killed) c.kill();
  });
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Starting Team Task Manager (backend + frontend)...\n');
run('backend', path.join(root, 'backend'), 'dev');
run('frontend', path.join(root, 'frontend'), 'dev');
