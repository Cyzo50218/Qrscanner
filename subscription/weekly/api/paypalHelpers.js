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


export const createOrder = async (cart) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "5.30", // Example static value
          },
        },
      ],
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
      throw new Error(`Failed to create order: ${errorText}`);
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};
    
