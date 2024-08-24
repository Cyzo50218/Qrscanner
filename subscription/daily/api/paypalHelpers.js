
import "dotenv/config";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

console.log('PayPal Client ID:', PAYPAL_CLIENT_ID); // Check if this logs the expected value
console.log('PayPal Client Secret:', PAYPAL_CLIENT_SECRET); // Check if this logs the expected value
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

// Create a subscription
export const createOrder = async () => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/subscriptions`;

    const payload = {
      plan_id: "yearlyaccess1", // Replace with your PayPal Plan ID
      start_time: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Start after 3 days
      quantity: 1,
      application_context: {
        brand_name: "Yearly access QRCode Scanner and generator",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: "qrscannerpro://paypalpay",
        cancel_url: "https://feedsbeta.vercel.app/client/subscription/daily/checkout/"
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


