'use strict';

/**
 * trace-preload.js
 * Load via: NODE_OPTIONS="--require /path/to/trace-preload.js"
 *
 * Logs:
 *  - child_process exec/spawn/execFile/fork
 *  - eval + Function constructor
 *  - module loads of child_process
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_DIR = process.env.TRACE_LOG_DIR || '/var/log/simcam-trace';
const MAX_SNIP = Number(process.env.TRACE_MAX_SNIP || 600);

function ensureDir(p) {
  try { fs.mkdirSync(p, { recursive: true, mode: 0o755 }); } catch (_) {}
}

function nowISO() {
  return new Date().toISOString();
}

function safeStr(x) {
  try {
    if (x === undefined) return 'undefined';
    if (x === null) return 'null';
    if (typeof x === 'string') return x;
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
}

function clip(s, n = MAX_SNIP) {
  s = String(s);
  return s.length > n ? s.slice(0, n) + `…(clipped ${s.length - n} chars)` : s;
}

function stackHere(skip = 2) {
  const e = new Error();
  const lines = (e.stack || '').split('\n');
  return lines.slice(skip).join('\n');
}

function logTo(file, msg) {
  ensureDir(LOG_DIR);
  const f = path.join(LOG_DIR, file);
  try {
    fs.appendFileSync(f, msg + '\n', { encoding: 'utf8', mode: 0o644 });
  } catch (_) {}
}

function header() {
  return `[${nowISO()}] pid=${process.pid} ppid=${process.ppid} uid=${process.getuid?.()} gid=${process.getgid?.()} user=${os.userInfo().username} cwd=${process.cwd()}`;
}

function logEvent(file, title, details) {
  const out =
    `${header()}\n` +
    `${title}\n` +
    `${details}\n` +
    `stack:\n${stackHere(3)}\n` +
    `---`;
  logTo(file, out);
}

/* -----------------------------
 * 1) Trace child_process usage
 * ----------------------------- */
function patchChildProcess() {
  let cp;
  try { cp = require('child_process'); } catch { return; }

  const wrap = (name) => {
    const orig = cp[name];
    if (typeof orig !== 'function') return;

    cp[name] = function (...args) {
      // Normalize logging
      let cmd = '';
      let argv = [];
      if (name === 'exec' || name === 'execSync') {
        cmd = safeStr(args[0]);
      } else if (name === 'execFile' || name === 'execFileSync') {
        cmd = safeStr(args[0]);
        argv = Array.isArray(args[1]) ? args[1] : [];
      } else if (name === 'spawn' || name === 'spawnSync' || name === 'fork') {
        cmd = safeStr(args[0]);
        argv = Array.isArray(args[1]) ? args[1] : [];
      }

      // Light redaction (avoid dumping huge env/secrets)
      const opts = args.find(a => a && typeof a === 'object' && !Array.isArray(a));
      const optsSafe = opts ? { ...opts } : null;
      if (optsSafe && optsSafe.env) {
        optsSafe.env = { ...optsSafe.env };
        for (const k of Object.keys(optsSafe.env)) {
          if (/token|secret|pass|pwd|key/i.test(k)) optsSafe.env[k] = '[REDACTED]';
        }
      }

      logEvent(
        'child_process.log',
        `child_process.${name}`,
        `cmd=${clip(cmd)}\nargs=${clip(safeStr(argv))}\noptions=${clip(safeStr(optsSafe))}`
      );

      return orig.apply(this, args);
    };
  };

  ['exec', 'execFile', 'spawn', 'fork', 'execSync', 'execFileSync', 'spawnSync'].forEach(wrap);

  logTo('startup.log', `${header()}\nchild_process patched\n---`);
}

/* ---------------------------------
 * 2) Trace eval + new Function(...)
 * --------------------------------- */
function patchEval() {
  const origEval = global.eval;
  global.eval = function (code) {
    logEvent(
      'eval.log',
      'global.eval',
      `code=${clip(code)}`
    );
    return origEval(code);
  };

  const OrigFunction = global.Function;
  global.Function = function (...args) {
    // args = [param1, param2, ..., body]
    const body = args.length ? args[args.length - 1] : '';
    logEvent(
      'eval.log',
      'new Function',
      `params=${clip(safeStr(args.slice(0, -1)))}\nbody=${clip(body)}`
    );
    return OrigFunction.apply(this, args);
  };

  logTo('startup.log', `${header()}\neval + Function patched\n---`);
}

/* -----------------------------------------
 * 3) Trace module loads of child_process
 * ----------------------------------------- */
function patchModuleLoad() {
  const Module = require('module');
  const origLoad = Module._load;

  Module._load = function (request, parent, isMain) {
    if (request === 'child_process' || request === 'node:child_process') {
      const parentFile = parent && parent.filename ? parent.filename : '(unknown parent)';
      logEvent(
        'module-load.log',
        'Module._load',
        `request=${request}\nparent=${parentFile}\nisMain=${!!isMain}`
      );
    }
    return origLoad.apply(this, arguments);
  };

  logTo('startup.log', `${header()}\nModule._load patched\n---`);
}

(function main() {
  logTo('startup.log', `${header()}\ntrace-preload loaded\nnode=${process.version}\n---`);
  patchModuleLoad();
  patchChildProcess();
  patchEval();
})();
