const http = require("http");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const TEST_ROUTE_URL = "http://localhost:3000/api/status/test";
const DB_HEALTH_URL = "http://localhost:3000/api/health/db";
const CHECK_INTERVAL = 60000;
const INITIAL_DELAY = 10000;
const MAX_FAILURES = 3;
const EXPECTED_RESPONSE = { status: "ok", message: "Test route working" };

const LOG_DIR = "/home/dev1/.pm2/logs/critical";
const LOG_FILE = path.join(LOG_DIR, "health-checker-critical.log");

try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (error) {
  console.error("Failed to create log directory:", error);
}

function logCritical(level, message, details = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  if (details) {
    logMessage += `\nDetails: ${JSON.stringify(details, null, 2)}`;
  }
  logMessage += '\n' + '='.repeat(80) + '\n';
  console.log(logMessage);
  if (level !== "INFO") {
    try {
      fs.appendFileSync(LOG_FILE, logMessage);
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }
}

let consecutiveFailures = 0;
let isRestarting = false;

function restartPM2() {
  if (isRestarting) return;
  isRestarting = true;
  logCritical("CRITICAL", `Health check failed ${MAX_FAILURES} times. Restarting simcam...`);
  exec("pm2 restart simcam", (error, stdout) => {
    if (error) {
      logCritical("ERROR", "Error restarting PM2", { error: error.message });
      return;
    }
    logCritical("INFO", "PM2 restart successful");
    consecutiveFailures = 0;
    setTimeout(() => { isRestarting = false; }, 30000);
  });
}

function checkHealth() {
  const checkStartTime = Date.now();
  logCritical("INFO", "=== Starting health check ===");

  const url = new URL(TEST_ROUTE_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || 3000,
    path: url.pathname,
    method: "GET",
    timeout: 10000,
  };

  let healthCheckPassed = false;

  const appReq = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      try {
        const jsonData = JSON.parse(data);
        if (res.statusCode === 200 && JSON.stringify(jsonData) === JSON.stringify(EXPECTED_RESPONSE)) {
          logCritical("INFO", "Health check passed");
          healthCheckPassed = true;
          consecutiveFailures = 0;
        } else {
          consecutiveFailures++;
          logCritical("ERROR", "Unexpected response", { received: jsonData });
          if (consecutiveFailures >= MAX_FAILURES) restartPM2();
        }
      } catch (error) {
        consecutiveFailures++;
        logCritical("ERROR", "Parse error", { error: error.message });
        if (consecutiveFailures >= MAX_FAILURES) restartPM2();
      }
      logCritical("INFO", "=== Health check completed ===", { duration: `${Date.now() - checkStartTime}ms` });
    });
  });

  appReq.on("error", (error) => {
    consecutiveFailures++;
    logCritical("ERROR", "Request failed", { error: error.message });
    if (consecutiveFailures >= MAX_FAILURES) restartPM2();
  });

  appReq.on("timeout", () => {
    consecutiveFailures++;
    logCritical("ERROR", "Request timed out");
    appReq.destroy();
    if (consecutiveFailures >= MAX_FAILURES) restartPM2();
  });

  appReq.end();
}

// DISABLED zombie detection for now - wrapper handles its own children
// function checkForZombies() { ... }

logCritical("INFO", `Health checker started. Waiting ${INITIAL_DELAY}ms...`);
setTimeout(() => {
  logCritical("INFO", `Starting periodic health checks every ${CHECK_INTERVAL}ms...`);
  checkHealth();
  setInterval(checkHealth, CHECK_INTERVAL);
  // Zombie detection DISABLED - not needed with wrapper
}, INITIAL_DELAY);

process.on('uncaughtException', (error) => {
  logCritical("CRITICAL", "UNCAUGHT EXCEPTION", { error: error.message });
});

process.on('unhandledRejection', (reason) => {
  logCritical("CRITICAL", "UNHANDLED REJECTION", { reason: reason?.message || reason });
});