import express from 'express';
import { captureOrder } from './paypalHelpers.js';
import path from 'path';

const app = express();
app.use(express.json());

// Log the resolved path
console.log('Resolved path to paypalHelpers.js:', path.resolve('./paypalHelpers.js'));

app.post("/subscription/yearly/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    console.log(`Capturing order with ID: ${orderID}`);
    
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    
    console.log(`Order captured successfully: ${JSON.stringify(jsonResponse)}`);
    
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture order:", error.message);
    
    res.status(500).json({ error: `Failed to capture order: ${error.message || "Unknown error"}` });
  }
});

export default app;
