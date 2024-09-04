import { getStoredPlanId } from '../../databaseHelpers';  // Assume this fetches the stored plan_id

export default async function handler(req, res) {
  try {
    const planId = await getStoredPlanId();  // Retrieve the stored plan ID
    if (planId) {
      res.status(200).json({ plan_id: planId });
    } else {
      res.status(404).json({ error: "Plan ID not found" });
    }
  } catch (error) {
    console.error("Error retrieving plan ID:", error);
    res.status(500).json({ error: "Failed to retrieve plan ID" });
  }
}
