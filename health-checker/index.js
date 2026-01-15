const http = require("http");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const TEST_ROUTE_URL = "http://localhost:3000/api/status/test";
const DB_HEALTH_URL = "http://localhost:3000/api/health/db";
const CHECK_INTERVAL = 60000; // Check every 60 seconds
const INITIAL_DELAY = 10000; // Wait 10 seconds before first check
const MAX_FAILURES = 3; // Allow 3 consecutive failures before restarting
const EXPECTED_RESPONSE = { status: "ok", message: "Test route working" };

// Logging configuration
const LOG_DIR = "/home/dev1/.pm2/logs/critical";
const LOG_FILE = path.join(LOG_DIR, "health-checker-critical.log");

// Ensure log directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (error) {
  console.error("Failed to create log directory:", error);
}

// Enhanced logging function
function logCritical(level, message, details = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (details) {
    logMessage += `\nDetails: ${JSON.stringify(details, null, 2)}`;
  }
  
  logMessage += '\n' + '='.repeat(80) + '\n';
  
  // Log to console
  console.log(logMessage);
  
  // Log to file for WARN, ERROR, CRITICAL
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

// Function to restart PM2
function restartPM2() {
  if (isRestarting) {
    logCritical("WARN", "Already restarting, skipping...");
    return;
  }

  isRestarting = true;
  
  logCritical("CRITICAL", `Health check failed ${MAX_FAILURES} times. Restarting simcam...`, {
    consecutiveFailures,
    maxFailures: MAX_FAILURES,
    lastCheckTime: new Date().toISOString(),
  });

  exec("pm2 restart simcam", (error, stdout, stderr) => {
    if (error) {
      logCritical("ERROR", "Error restarting PM2", {
        error: error.message,
        stderr,
      });
      return;
    }
    if (stderr) {
      logCritical("WARN", "PM2 restart stderr", { stderr });
    }
    
    logCritical("INFO", "PM2 restart successful", { stdout });

    // Reset failure count after restart
    consecutiveFailures = 0;

    // Prevent immediate restart - wait 30 seconds before allowing another restart
    setTimeout(() => {
      isRestarting = false;
      logCritical("INFO", "Restart cooldown finished, ready to check again");
    }, 30000);
  });
}

// Function to test the route
function checkHealth() {
  const checkStartTime = Date.now();
  
  logCritical("INFO", "=== Starting health check ===");
  logCritical("INFO", `Checking health at ${TEST_ROUTE_URL}...`);

  const url = new URL(TEST_ROUTE_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || 3000,
    path: url.pathname + url.search,
    method: "GET",
    timeout: 10000,
  };

  let healthCheckPassed = false;
  let dbCheckPassed = false;
  let healthCheckDuration = 0;
  let dbCheckDuration = 0;

  // Perform main app health check
  const appCheckStart = Date.now();
  const appReq = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      healthCheckDuration = Date.now() - appCheckStart;
      
      try {
        const jsonData = JSON.parse(data);

        if (
          res.statusCode === 200 &&
          JSON.stringify(jsonData) === JSON.stringify(EXPECTED_RESPONSE)
        ) {
          logCritical("INFO", "Health check passed", {
            duration: `${healthCheckDuration}ms`,
            status: res.statusCode,
          });
          healthCheckPassed = true;
        } else {
          logCritical("ERROR", "Unexpected response from app", {
            duration: `${healthCheckDuration}ms`,
            statusCode: res.statusCode,
            expected: EXPECTED_RESPONSE,
            received: jsonData,
          });
        }
      } catch (error) {
        logCritical("ERROR", "Error parsing app response", {
          duration: `${healthCheckDuration}ms`,
          error: error.message,
          rawData: data,
        });
      }

      // After app check completes, perform DB check
      performDbCheck();
    });
  });

  appReq.on("error", (error) => {
    healthCheckDuration = Date.now() - appCheckStart;
    logCritical("ERROR", "Health check request failed", {
      duration: `${healthCheckDuration}ms`,
      error: error.message,
      code: error.code,
    });
    performDbCheck();
  });

  appReq.on("timeout", () => {
    healthCheckDuration = Date.now() - appCheckStart;
    logCritical("ERROR", "Health check timed out", {
      duration: `${healthCheckDuration}ms`,
      timeout: options.timeout,
    });
    appReq.destroy();
    performDbCheck();
  });

  appReq.end();

  // Perform database health check
  function performDbCheck() {
    logCritical("INFO", `Checking database health at ${DB_HEALTH_URL}...`);
    const dbCheckStart = Date.now();
    const dbUrl = new URL(DB_HEALTH_URL);
    const dbOptions = {
      hostname: dbUrl.hostname,
      port: dbUrl.port || 3000,
      path: dbUrl.pathname + dbUrl.search,
      method: "GET",
      timeout: 10000,
    };

    const dbReq = http.request(dbOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        dbCheckDuration = Date.now() - dbCheckStart;
        
        try {
          const jsonData = JSON.parse(data);

          if (res.statusCode === 200 && jsonData.mongodb === 'connected') {
            logCritical("INFO", "Database health check passed", {
              duration: `${dbCheckDuration}ms`,
              status: res.statusCode,
              poolSize: jsonData.poolSize,
              availableConnections: jsonData.availableConnections,
            });
            dbCheckPassed = true;
            
            // Warn if pool is low
            if (jsonData.availableConnections < 10) {
              logCritical("WARN", "Database connection pool running low", {
                availableConnections: jsonData.availableConnections,
                poolSize: jsonData.poolSize,
              });
            }
          } else {
            logCritical("ERROR", "Database unhealthy", {
              duration: `${dbCheckDuration}ms`,
              statusCode: res.statusCode,
              mongodb: jsonData.mongodb,
              error: jsonData.error,
            });
          }
        } catch (error) {
          logCritical("ERROR", "Error parsing database response", {
            duration: `${dbCheckDuration}ms`,
            error: error.message,
            rawData: data,
          });
        }

        // Finalize check after both complete
        finalizeCheck();
      });
    });

    dbReq.on("error", (error) => {
      dbCheckDuration = Date.now() - dbCheckStart;
      logCritical("ERROR", "Database health check request failed", {
        duration: `${dbCheckDuration}ms`,
        error: error.message,
        code: error.code,
      });
      finalizeCheck();
    });

    dbReq.on("timeout", () => {
      dbCheckDuration = Date.now() - dbCheckStart;
      logCritical("ERROR", "Database health check timed out", {
        duration: `${dbCheckDuration}ms`,
        timeout: dbOptions.timeout,
      });
      dbReq.destroy();
      finalizeCheck();
    });

    dbReq.end();
  }

  // Finalize health check after both checks complete
  function finalizeCheck() {
    const totalDuration = Date.now() - checkStartTime;

    if (!healthCheckPassed || !dbCheckPassed) {
      consecutiveFailures++;
      
      logCritical("ERROR", "Overall health check failed", {
        failure: `${consecutiveFailures}/${MAX_FAILURES}`,
        healthCheckPassed,
        dbCheckPassed,
        healthCheckDuration: `${healthCheckDuration}ms`,
        dbCheckDuration: `${dbCheckDuration}ms`,
        totalDuration: `${totalDuration}ms`,
      });

      if (consecutiveFailures >= MAX_FAILURES) {
        restartPM2();
      }
    } else {
      if (consecutiveFailures > 0) {
        logCritical("INFO", `Overall health check recovered after ${consecutiveFailures} failures`, {
          totalDuration: `${totalDuration}ms`,
        });
      }
      consecutiveFailures = 0;
    }

    logCritical("INFO", "=== Health check completed ===", {
      totalDuration: `${totalDuration}ms`,
      consecutiveFailures,
    });
  }
}

// Start the health checker after initial delay
logCritical("INFO", `Health checker started. Waiting ${INITIAL_DELAY}ms before first check...`);
setTimeout(() => {
  logCritical("INFO", `Starting periodic health checks every ${CHECK_INTERVAL}ms...`);
  
  // Run first check immediately after initial delay
  checkHealth();
  
  // Then run on interval
  setInterval(checkHealth, CHECK_INTERVAL);
}, INITIAL_DELAY);

// Global error handlers
process.on('uncaughtException', (error) => {
  logCritical("CRITICAL", "UNCAUGHT EXCEPTION", {
    error: error.message,
    stack: error.stack,
  });
  // Don't exit - let PM2 handle it
});

process.on('unhandledRejection', (reason, promise) => {
  logCritical("CRITICAL", "UNHANDLED REJECTION", {
    reason: reason?.message || reason,
    promise: promise.toString(),
  });
});

