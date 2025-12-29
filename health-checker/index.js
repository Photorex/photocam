const http = require("http");
const { exec } = require("child_process");

// Configuration
const TEST_ROUTE_URL = "http://localhost:3000/api/status/test";
const DB_HEALTH_URL = "http://localhost:3000/api/health/db";
const CHECK_INTERVAL = 60000; // Check every 60 seconds
const INITIAL_DELAY = 10000; // Wait 10 seconds before first check
const MAX_FAILURES = 3; // Allow 3 consecutive failures before restarting
const EXPECTED_RESPONSE = { status: "ok", message: "Test route working" };

let consecutiveFailures = 0;
let isRestarting = false;

// Function to restart PM2
function restartPM2() {
  if (isRestarting) {
    console.log("Restart already in progress, skipping...");
    return;
  }
  
  isRestarting = true;
  console.log(`Restarting application with PM2 after ${consecutiveFailures} consecutive failures...`);
  
  exec("pm2 restart simcam", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting PM2: ${error.message}`);
    } else if (stderr) {
      console.error(`PM2 stderr: ${stderr}`);
    } else {
      console.log(`PM2 restarted successfully`);
    }
    
    // Reset flags after restart
    consecutiveFailures = 0;
    setTimeout(() => {
      isRestarting = false;
    }, 30000); // Prevent rapid restarts - wait 30 seconds
  });
}

// Function to test the route
function checkHealth() {
  console.log(`[${new Date().toISOString()}] Checking health at ${TEST_ROUTE_URL}...`);

  const url = new URL(TEST_ROUTE_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || 3000,
    path: url.pathname + url.search,
    method: "GET",
    timeout: 10000,
  };

  const req = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const jsonData = JSON.parse(data);

        if (
          res.statusCode !== 200 ||
          JSON.stringify(jsonData) !== JSON.stringify(EXPECTED_RESPONSE)
        ) {
          consecutiveFailures++;
          console.error(
            `[${new Date().toISOString()}] Unexpected response (failure ${consecutiveFailures}/${MAX_FAILURES}):`,
            res.statusCode,
            jsonData
          );
          
          if (consecutiveFailures >= MAX_FAILURES) {
            restartPM2();
          }
        } else {
          if (consecutiveFailures > 0) {
            console.log(`[${new Date().toISOString()}] Health check recovered after ${consecutiveFailures} failures.`);
          } else {
            console.log(`[${new Date().toISOString()}] Health check passed.`);
          }
          consecutiveFailures = 0;
        }
      } catch (error) {
        consecutiveFailures++;
        console.error(
          `[${new Date().toISOString()}] Error parsing response (failure ${consecutiveFailures}/${MAX_FAILURES}):`,
          error.message,
          "Data:",
          data
        );
        
        if (consecutiveFailures >= MAX_FAILURES) {
          restartPM2();
        }
      }
    });
  });

  req.on("error", (error) => {
    consecutiveFailures++;
    console.error(
      `[${new Date().toISOString()}] Health check failed (failure ${consecutiveFailures}/${MAX_FAILURES}):`,
      error.message
    );
    
    if (consecutiveFailures >= MAX_FAILURES) {
      restartPM2();
    }
  });

  req.on("timeout", () => {
    consecutiveFailures++;
    console.error(
      `[${new Date().toISOString()}] Health check timed out (failure ${consecutiveFailures}/${MAX_FAILURES}).`
    );
    req.destroy();
    
    if (consecutiveFailures >= MAX_FAILURES) {
      restartPM2();
    }
  });

  req.end();
}

// Function to check database health
function checkDatabaseHealth() {
  return new Promise((resolve) => {
    console.log(`[${new Date().toISOString()}] Checking database health at ${DB_HEALTH_URL}...`);

    const url = new URL(DB_HEALTH_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: "GET",
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);

          if (res.statusCode !== 200 || jsonData.mongodb !== 'connected') {
            console.error(
              `[${new Date().toISOString()}] Database health check failed:`,
              res.statusCode,
              jsonData
            );
            resolve(false);
          } else {
            console.log(
              `[${new Date().toISOString()}] Database health check passed.`,
              jsonData.poolSize ? `Pool: ${jsonData.poolSize} connections` : ''
            );
            resolve(true);
          }
        } catch (error) {
          console.error(
            `[${new Date().toISOString()}] Error parsing DB health response:`,
            error.message
          );
          resolve(false);
        }
      });
    });

    req.on("error", (error) => {
      console.error(
        `[${new Date().toISOString()}] Database health check request failed:`,
        error.message
      );
      resolve(false);
    });

    req.on("timeout", () => {
      console.error(`[${new Date().toISOString()}] Database health check timed out.`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Combined health check
async function performHealthCheck() {
  console.log(`[${new Date().toISOString()}] === Starting health check ===`);
  
  // Check basic endpoint
  checkHealth();
  
  // Also check database health
  const dbHealthy = await checkDatabaseHealth();
  
  if (!dbHealthy) {
    consecutiveFailures++;
    console.error(
      `[${new Date().toISOString()}] Database unhealthy (failure ${consecutiveFailures}/${MAX_FAILURES})`
    );
    
    if (consecutiveFailures >= MAX_FAILURES) {
      restartPM2();
    }
  }
}

// Start health checking after initial delay
console.log(`Health checker starting... will begin checks in ${INITIAL_DELAY/1000} seconds`);
setTimeout(() => {
  console.log("Starting health checks...");
  performHealthCheck();
  setInterval(performHealthCheck, CHECK_INTERVAL);
}, INITIAL_DELAY);

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error(`[${new Date().toISOString()}] Uncaught exception:`, error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${new Date().toISOString()}] Unhandled rejection:`, reason);
});