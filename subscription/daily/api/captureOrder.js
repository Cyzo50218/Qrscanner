import express from 'express';
import { captureSubscription } from './paypalHelpers.js';
import cors from 'cors'; // Ensure you have this installed

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Handle OPTIONS requests
app.options("/subscription/daily/api/subscriptions/:subscriptionID/capture", (req, res) => {
  res.status(200).end();
});

app.post("/subscription/daily/api/subscriptions/:subscriptionID/capture", async (req, res) => {
  try {
    const { subscriptionID } = req.params;
    console.log(`Capturing subscription with ID: ${subscriptionID}`);

    const { jsonResponse, httpStatusCode } = await captureSubscription(subscriptionID);

    console.log(`Subscription captured successfully: ${JSON.stringify(jsonResponse)}`);

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture subscription:", error.message);

    res.status(500).json({ error: `Failed to capture subscription: ${error.message || "Unknown error"}` });
  }
});

// Handle 405 Method Not Allowed
app.use((req, res) => {
  res.status(405).send('Method Not Allowed');
});

export default app;
