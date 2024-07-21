import express from 'express';
import { createOrder } from './paypalHelpers.js';
import path from 'path';

const app = express();
app.use(express.json());

// Log the resolved path for debugging
console.log('Resolved path to paypalHelpers.js:', path.resolve('./paypalHelpers.js'));

app.post("/subscription/yearly/api/orders/", async (req, res) => {
  try {
    const { cart } = req.body;
    const { jsonResponse, httpStatusCode } = await createOrder(cart);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: error.message || "Failed to create order." });
  }
});

export default app;
