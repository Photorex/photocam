// /var/www/simcam/photo/trace-child-process.js
'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const LOG = process.env.CHILDPROC_TRACE_LOG || '/var/log/node-childproc-trace.log';

function write(line) {
  try {
    fs.appendFileSync(LOG, line + '\n');
  } catch (e) {
    // last resort: stderr
    try { process.stderr.write(line + '\n'); } catch (_) {}
  }
}

function stack() {
  const s = new Error().stack || '';
  // trim noise
  return s.split('\n').slice(2, 20).join('\n');
}

function fmt(cmd, args, options) {
  const ts = new Date().toISOString();
  const cwd = (options && options.cwd) || process.cwd();
  const uid = process.getuid?.();
  const gid = process.getgid?.();
  return [
    '---',
    `[${ts}] pid=${process.pid} uid=${uid} gid=${gid} cwd=${cwd}`,
    `cmd=${cmd}`,
    `args=${Array.isArray(args) ? JSON.stringify(args) : String(args ?? '')}`,
    `options=${options ? JSON.stringify({ cwd: options.cwd, shell: options.shell, envKeys: options.env ? Object.keys(options.env) : undefined }) : '{}'}`,
    'stack:',
    stack(),
  ].join('\n');
}

// Wrap spawn
const _spawn = cp.spawn;
cp.spawn = function (command, args, options) {
  write(fmt(command, args, options));
  return _spawn.apply(this, arguments);
};

// Wrap exec
const _exec = cp.exec;
cp.exec = function (command, options, callback) {
  write(fmt(command, [], options));
  return _exec.apply(this, arguments);
};

// Wrap execFile
const _execFile = cp.execFile;
cp.execFile = function (file, args, options, callback) {
  write(fmt(file, args, options));
  return _execFile.apply(this, arguments);
};

// Wrap fork
const _fork = cp.fork;
cp.fork = function (modulePath, args, options) {
  write(fmt(`fork:${modulePath}`, args, options));
  return _fork.apply(this, arguments);
};

write(`[${new Date().toISOString()}] child_process tracing enabled, pid=${process.pid}`);