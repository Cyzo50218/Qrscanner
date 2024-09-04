import { createPlan } from '../paypalHelpers';  // Adjust the path as needed

export default async function handler(req, res) {
  try {
    const planId = await createPlan();
    console.log("Generated PayPal Plan ID:", planId);
    res.status(200).json({ plan_id: planId });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ error: "Failed to create plan" });
  }
}
