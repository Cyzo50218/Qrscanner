
import { createPlan } from './paypalHelpers.js'; // Adjust the path accordingly

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const planId = await createPlan();
      res.status(200).json({ planId });
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(500).json({ error: "Failed to create plan" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
