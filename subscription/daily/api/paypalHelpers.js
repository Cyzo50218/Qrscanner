import "dotenv/config";
import fetch from 'node-fetch';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

const base = "https://api-m.sandbox.paypal.com";

// Generate Access Token
export const generateAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch access token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
};

// Create Subscription Plan
export const createSubscriptionPlan = async () => {
  const accessToken = await generateAccessToken();

  const planData = {
    product_id: "PROD-100YEARLY", // Replace with your product ID
    name: "Yearly Subscription Plan",
    description: "$30 equivalent to $2.30 per week with a 3-day free trial",
    billing_cycles: [
      {
        frequency: {
          interval_unit: "WEEK",
          interval_count: 1
        },
        tenure_type: "REGULAR",
        sequence: 2,
        total_cycles: 52,
        pricing_scheme: {
          fixed_price: {
            value: "2.30",
            currency_code: "PHP" // You can change this to PHP or any currency you support
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
            value: "0.00",
            currency_code: "USD"
          }
        }
      }
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: {
        value: "0.00",
        currency_code: "PHP"
      },
      setup_fee_failure_action: "CANCEL",
      payment_failure_threshold: 3
    },
    taxes: {
      percentage: "0",
      inclusive: false
    }
  };

  const response = await fetch(`${base}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(planData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create subscription plan: ${errorText}`);
  }

  const data = await response.json();
  return data;
};
