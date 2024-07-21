import express from 'express';
import { captureOrder } from './paypalHelpers.js';
import path from 'path';
import cors from 'cors'; // You may need to install this package

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Log the resolved path
console.log('Resolved path to paypalHelpers.js:', path.resolve('./paypalHelpers.js'));

// Handle OPTIONS requests
app.options("/subscription/yearly/api/orders/:orderID/capture", (req, res) => {
  res.status(200).end();
});

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

// Handle 405 Method Not Allowed
app.use("/subscription/yearly/api/orders/:orderID/capture", (req, res) => {
  res.status(405).send('Method Not Allowed');
});

export default app;
