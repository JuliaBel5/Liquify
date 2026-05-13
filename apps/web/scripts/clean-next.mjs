import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const nextDir = resolve(process.cwd(), '.next');

function wait(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

let lastError;

for (let attempt = 1; attempt <= 20; attempt += 1) {
  try {
    rmSync(nextDir, { force: true, maxRetries: 5, recursive: true, retryDelay: 200 });
    console.log('[dev] removed stale .next cache');
    process.exit(0);
  } catch (error) {
    lastError = error;
    wait(250);
  }
}

console.error('[dev] failed to remove stale .next cache after retries');
throw lastError;
