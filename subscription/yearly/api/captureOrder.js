import express from 'express';
import path from 'path'; // Importing path to log the resolved path

const app = express();
app.use(express.json());

// Log the resolved path
console.log('Resolved path:', path.resolve('./paypalHelpers.js'));

app.post("/orders/:orderID/capture", async (req, res) => {
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
