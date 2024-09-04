import express from 'express';
import { createSubscriptionsWithPlanId } from './paypalHelpers.js';
import path from 'path';

const app = express();
app.use(express.json());

// Log the resolved path for debugging
console.log('Resolved path to paypalHelpers.js:', path.resolve('./paypalHelpers.js'));

app.post("/subscription/daily/api/subscriptions/", async (req, res) => {
  try {
    const { plan_id } = req.body;

    if (!plan_id) {
      return res.status(400).json({ error: "Plan ID is required." });
    }

    // Call PayPal API to create a subscription
    const { jsonResponse, httpStatusCode } = await createSubscriptionsWithPlanId(plan_id);

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create subscription:", error);
    res.status(500).json({ error: error.message || "Failed to create subscription." });
  }
});

export default app;
