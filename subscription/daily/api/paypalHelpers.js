import "dotenv/config";
import fetch from 'node-fetch';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";

const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

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

const handleResponse = async (response) => {
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

// Create a subscription plan
export const createSubscriptionPlan = async () => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/plans`;

    const payload = {
      product_id: "YOUR_PRODUCT_ID", // Replace with your product ID
      name: "Weekly Subscription Plan",
      description: "Weekly subscription plan with a 3-day free trial",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "WEEK",
            interval_count: 1
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: "2.30",
              currency_code: "USD"
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_amount: "YES",
        setup_fee: {
          value: "0.00",
          currency_code: "USD"
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      },
      taxes: {
        percentage: "0",
        inclusive: false
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

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to create subscription plan:", error);
    throw error;
  }
};

// Create a subscription
export const createSubscription = async (planId, subscriber) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/subscriptions`;

    const payload = {
      plan_id: planId,
      start_time: new Date().toISOString(),
      quantity: "1",
      subscriber,
      application_context: {
        brand_name: "Your Company",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAY"
        }
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
      throw new Error(`Failed to create subscription: ${errorText}`);
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to create subscription:", error);
    throw error;
  }
};

// Capture an order
export const captureOrder = async (orderID) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to capture order: ${errorText}`);
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to capture order:", error);
    throw error;
  }
};

// Handle subscription status updates (if needed)
export const updateSubscriptionStatus = async (subscriptionID, status) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/subscriptions/${subscriptionID}`;

    const payload = { status };

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update subscription status: ${errorText}`);
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to update subscription status:", error);
    throw error;
  }
};
