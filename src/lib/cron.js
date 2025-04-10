import cron from "cron";
import https from "https"; // Correct import for https
import dotenv from "dotenv"; // Import dotenv to load environment variables

// Load environment variables from .env file
dotenv.config();

// Define the cron job
const job = new cron.CronJob("*/14 * * * *", function () {
  const apiUrl = process.env.API_URL;

  // Check if API_URL is defined
  if (!apiUrl) {
    console.error(
      "Error: API_URL is not defined in the environment variables."
    );
    return;
  }

  console.log(`Attempting to send GET request to: ${apiUrl}`);

  // Send GET request to the API_URL
  https
    .get(apiUrl, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully.");
      } else {
        console.error(`GET request failed with status code: ${res.statusCode}`);
      }
    })
    .on("error", (e) => {
      console.error("Error while sending GET request: ", e);
    });
});

// Export the job
export default job;
