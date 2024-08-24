import { createSubscriptionPlan } from './paypalHelpers.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const planResponse = await createSubscriptionPlan();
      res.status(200).json(planResponse);
    } catch (error) {
      console.error("Failed to create subscription plan:", error);
      res.status(500).json({ error: error.message || "Failed to create subscription plan." });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
