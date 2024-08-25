import express from 'express';
import { createSubscriptionPlan } from './paypalHelpers.js';

const app = express();
app.use(express.json()); // Ensure that your app can parse JSON bodies

// CORS middleware to handle OPTIONS requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// POST endpoint to create a subscription plan
app.post("/subscription/create-plan", async (req, res) => {
  try {
    const planResponse = await createSubscriptionPlan();
    res.status(200).json(planResponse);
  } catch (error) {
    console.error("Failed to create subscription plan:", error);
    res.status(500).json({ error: error.message || "Failed to create subscription plan." });
  }
});

// Handle 405 Method Not Allowed for other HTTP methods
app.use((req, res) => {
  res.status(405).json({ error: "Method Not Allowed" });
});

export default app;
