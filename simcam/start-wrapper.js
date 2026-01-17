/**
 * Next.js Start Wrapper
 * 
 * Handles SIGPIPE to prevent crashes from broken pipe writes.
 * This is necessary because Next.js child processes can die from
 * SIGPIPE when writing to closed sockets/pipes.
 */

// Ignore SIGPIPE globally - prevents crash on broken pipe writes
process.on('SIGPIPE', () => {
  console.log('[WRAPPER] Caught SIGPIPE - ignoring');
});

// Handle other signals gracefully
process.on('SIGTERM', () => {
  console.log('[WRAPPER] Received SIGTERM - shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[WRAPPER] Received SIGINT - shutting down gracefully');
  process.exit(0);
});

// Log startup
console.log('[WRAPPER] Starting Next.js with SIGPIPE protection...');

// Start Next.js
const { spawn } = require('child_process');

const child = spawn('node', [
  'node_modules/next/dist/bin/next',
  'start'
], {
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || 3000
  }
});

child.on('error', (err) => {
  console.error('[WRAPPER] Failed to start Next.js:', err);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  console.log(`[WRAPPER] Next.js exited: code=${code}, signal=${signal}`);
  process.exit(code || (signal ? 1 : 0));
});

// Forward signals to child
['SIGTERM', 'SIGINT', 'SIGHUP'].forEach(sig => {
  process.on(sig, () => {
    if (child && !child.killed) {
      child.kill(sig);
    }
  });
});
