import { createPlan } from './paypalHelpers.js';  // Adjust the path as needed

const generatePlanId = async () => {
  try {
    const planId = await createPlan();
    console.log("Generated PayPal Plan ID:", planId);
  } catch (error) {
    console.error("Error creating plan:", error);
  }
};

generatePlanId();
