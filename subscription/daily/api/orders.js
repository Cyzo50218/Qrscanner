import express from 'express';
import { createSubscription } from './paypalHelpers.js';
import cors from 'cors'; // Ensure you have this installed

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Handle OPTIONS requests
app.options("/subscription/daily/api/orders", (req, res) => {
  res.status(200).end();
});

// Create a subscription
app.post("/subscription/daily/api/orders", async (req, res) => {
  try {
    console.log("Creating subscription...");

    const { jsonResponse, httpStatusCode } = await createSubscription();

    console.log(`Subscription created successfully: ${JSON.stringify(jsonResponse)}`);

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create subscription:", error.message);

    res.status(500).json({ error: `Failed to create subscription: ${error.message || "Unknown error"}` });
  }
});

// Handle 405 Method Not Allowed
app.use((req, res) => {
  res.status(405).send('Method Not Allowed');
});

export default app;
