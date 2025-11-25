const http = require("http"); // Built-in HTTP module
const { exec } = require("child_process");

// Configuration
const TEST_ROUTE_URL = "http://localhost:3000/api/status/test"; // Adjust URL as per your server
const CHECK_INTERVAL = 60000; // Check every 60 seconds
const EXPECTED_RESPONSE = { status: "ok", message: "Test route working" };

// Function to restart PM2
function restartPM2() {
  console.log("Restarting application with PM2...");
  exec("pm2 restart simcam", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting PM2: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`PM2 stderr: ${stderr}`);
      return;
    }
    console.log(`PM2 stdout: ${stdout}`);
  });
}

// Function to test the route
function checkHealth() {
  console.log(`Checking health at ${TEST_ROUTE_URL}...`);

  // Parse URL to determine host and path
  const url = new URL(TEST_ROUTE_URL);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: "GET",
    timeout: 5000, // 5-second timeout
  };

  const req = http.request(options, (res) => {
    let data = "";

    // Handle response data
    res.on("data", (chunk) => {
      data += chunk;
    });

    // Handle response end
    res.on("end", () => {
      try {
        const jsonData = JSON.parse(data);

        if (
          res.statusCode !== 200 ||
          JSON.stringify(jsonData) !== JSON.stringify(EXPECTED_RESPONSE)
        ) {
          console.error("Unexpected response:", res.statusCode, jsonData);
          restartPM2();
        } else {
          console.log("Health check passed.");
        }
      } catch (error) {
        console.error("Error parsing response:", error.message);
        restartPM2();
      }
    });
  });

  // Handle errors (e.g., connection issues or timeouts)
  req.on("error", (error) => {
    console.error("Health check failed:", error.message);
    restartPM2();
  });

  req.on("timeout", () => {
    console.error("Health check timed out.");
    req.destroy(); // Abort the request
    restartPM2();
  });

  req.end();
}

// Run the health check periodically
setInterval(checkHealth, CHECK_INTERVAL);

// Run the check immediately when the script starts
checkHealth();