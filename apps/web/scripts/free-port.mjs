import { execFileSync } from 'node:child_process';

const port = Number(process.argv[2] ?? 3100);

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

function windowsPids() {
  const output = run('netstat', ['-ano']);
  const pids = new Set();

  for (const line of output.split('\n')) {
    if (!line.includes(`:${port}`) || !line.includes('LISTENING')) continue;

    const parts = line.trim().split(/\s+/);
    const pid = parts.at(-1);
    if (pid !== undefined && /^\d+$/.test(pid)) pids.add(pid);
  }

  return [...pids];
}

function wait(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function unixPids() {
  const output = run('lsof', ['-ti', `tcp:${port}`]);
  return output.split('\n').map((pid) => pid.trim()).filter(Boolean);
}

const pids = process.platform === 'win32' ? windowsPids() : unixPids();

if (pids.length === 0) {
  console.log(`[dev] port ${port} is free`);
  process.exit(0);
}

for (const pid of pids) {
  if (process.platform === 'win32') {
    run('taskkill', ['/PID', pid, '/F']);
  } else {
    run('kill', ['-9', pid]);
  }
}

console.log(`[dev] freed port ${port}: ${pids.join(', ')}`);
wait(1200);
