import "dotenv/config";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";

const fetch = (await import('node-fetch')).default;

export const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch access token: ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
    throw error;
  }
};

export const handleResponse = async (response) => {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    console.error("Failed to parse JSON response:", errorMessage);
    throw new Error(`Failed to parse response: ${errorMessage}`);
  }
};

// Create Subscription Plan with 3-Day Free Trial and Weekly Recurring Charge
export const createPlan = async () => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/plans`;

    const payload = {
      product_id: "YOUR_PRODUCT_ID",  // Replace this with your actual product ID
      name: "Weekly Subscription Plan",
      description: "Weekly subscription plan with 3-day free trial",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "WEEK",
            interval_count: 1
          },
          tenure_type: "REGULAR",
          sequence: 2,
          total_cycles: 0,  // 0 means indefinite billing cycles
          pricing_scheme: {
            fixed_price: {
              value: "5.30",
              currency_code: "USD"
            }
          }
        },
        {
          frequency: {
            interval_unit: "DAY",
            interval_count: 3
          },
          tenure_type: "TRIAL",
          sequence: 1,
          total_cycles: 1,
          pricing_scheme: {
            fixed_price: {
              value: "0",
              currency_code: "USD"
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: "USD"
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      }
    };

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create subscription plan: ${errorText}`);
    }

    const planData = await handleResponse(response);

    // Extract the plan ID from the response
    const planId = planData.jsonResponse.id;
    console.log(`Plan ID: ${planId}`);

    return planId;  // Return the plan ID for further use
  } catch (error) {
    console.error("Failed to create subscription plan:", error);
    throw error;
  }
};

// Create Subscription
export const createSubscription = async (planId) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/subscriptions`;

    const payload = {
      plan_id: planId,  // Use the plan ID created by PayPal
    };

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create subscription: ${errorText}`);
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to create subscription:", error);
    throw error;
  }
};

export const createSubscriptionsWithPlanId = async (planId) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/subscriptions`;

    const payload = {
      plan_id: planId,
    };

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    const responseText = await response.text(); // Get raw response text for debugging
    console.log("PayPal Response Text:", responseText); // Log the response text

    if (!response.ok) {
      throw new Error(`Failed to create subscription: ${responseText}`);
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return { jsonResponse: { error: error.message || "Unknown error" }, httpStatusCode: 500 };
  }
};

export const captureSubscription = async (subscriptionID) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/subscriptions/${subscriptionID}/capture`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to capture subscription: ${errorText}`);
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to capture subscription:", error);
    throw error;
  }
};

