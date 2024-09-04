import { createPlan } from '../../paypalHelpers';  // Assuming this function exists in paypalHelpers.js

export default async function handler(req, res) {
  try {
    const planId = await createPlan();
    
    // Output the plan ID to the console so you can manually add it to Vercel's environment variables
    console.log("Generated PayPal Plan ID:", planId);
    
    res.status(200).json({ plan_id: planId });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ error: "Failed to create plan" });
  }
}
