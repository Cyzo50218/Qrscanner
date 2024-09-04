import { createPlan } from './paypalHelpers.js'; // Adjust the path as needed

export default async function handler(req, res) {
  try {
    // Directly call createPlan and respond with the result
    const planId = await createPlan();
    console.log("Generated PayPal Plan ID:", planId);
    res.status(200).json({ plan_id: planId });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ error: "Failed to create plan" });
  }
}