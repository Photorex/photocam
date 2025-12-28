const http = require("http");
const { exec } = require("child_process");

// Configuration
const TEST_ROUTE_URL = "http://localhost:3000/api/status/test";
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
    timeout: 5000,
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

// Start health checking after initial delay
console.log(`Health checker starting... will begin checks in ${INITIAL_DELAY/1000} seconds`);
setTimeout(() => {
  console.log("Starting health checks...");
  checkHealth();
  setInterval(checkHealth, CHECK_INTERVAL);
}, INITIAL_DELAY);

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error(`[${new Date().toISOString()}] Uncaught exception:`, error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${new Date().toISOString()}] Unhandled rejection:`, reason);
});