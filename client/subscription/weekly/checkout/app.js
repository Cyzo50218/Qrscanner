document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded and parsed.");

  loadPayPalScript().then(initPayPalButtons).catch(error => {
    console.error('Failed to load PayPal SDK:', error);
    document.getElementById('result-message').textContent = 'Failed to initialize PayPal. Please try again later.';
  });
});

function loadPayPalScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
      let scriptSrc = "https://www.paypal.com/sdk/js?client-id=ARIFr8TpW3U0MgYuDHcXpodVqMA3q800Iy1t8lIzHrD1YmleqHu4TC4J3h2801uRWAInenWsMQSPgQgE&currency=USD&components=buttons";

    script.src = scriptSrc;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.body.appendChild(script);
  });
}



function initPayPalButtons() {
  if (typeof paypal === 'undefined') {
    console.error('PayPal SDK not loaded');
    document.getElementById('result-message').textContent = 'PayPal SDK failed to load. Please try again later.';
    return;
  }

  function sendPurchaseSignalToAndroid(transactionId, status) {
    if (window.Android && typeof window.Android.onPurchaseComplete === "function") {
      window.Android.onPurchaseComplete(transactionId, status);
    } else {
      console.log("Android interface not available");
    }
  }

  console.log("Initializing PayPal Buttons...");

  paypal.Buttons({
    style: {
      shape: "pill",
      layout: "vertical",
      color: "blue",
      label: "subscribe",
    },
    createOrder() {
      console.log("Creating order...");
      return fetch("/subscription/weekly/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: [{ id: "weeklyaccess7", quantity: "1" }] }),
        })
        .then(response => response.json())
        .then(orderData => {
          console.log("Order created:", orderData);
          if (orderData.id) {
            return orderData.id;
          }
          const errorDetail = orderData?.details?.[0];
          const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})` : JSON.stringify(orderData);
          throw new Error(errorMessage);
        })
        .catch(error => {
          console.error("Error creating order:", error);
          document.getElementById('result-message').innerHTML = `Could not initiate PayPal Checkout...<br><br>${error.message}`;
          throw error;
        });
    },
    onApprove(data, actions) {
      console.log("Order approved:", data);
      return fetch(`/subscription/weekly/api/orders/${data.orderID}/capture`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
        .then(response => response.json())
        .then(orderData => {
          console.log("Order captured:", orderData);
          const errorDetail = orderData?.details?.[0];
          if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
            return actions.restart();
          } else if (errorDetail) {
            throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
          } else if (!orderData.purchase_units) {
            throw new Error(JSON.stringify(orderData));
          } else {
            const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0] || orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
            document.getElementById('result-message').innerHTML = `Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`;
            console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));

            console.log("Purchase successful!", transaction);

            // Send signal to Android
            sendPurchaseSignalToAndroid(transaction.id, transaction.status);
          }
        })
        .catch(error => {
          console.error("Error capturing order:", error);
          document.getElementById('result-message').innerHTML = `Sorry, your transaction could not be processed...<br><br>${error.message}`;

          // Send error signal to Android
          sendPurchaseSignalToAndroid("ERROR", error.message);
        });

    },
    onError: (err) => {
      console.error("PayPal Buttons Error:", err);
      document.getElementById('result-message').textContent = `An error occurred: ${err.message}`;
    },
  }).render("#paypal-button-container").catch(error => {
    console.error('Failed to render PayPal Buttons:', error);
    document.getElementById('result-message').textContent = 'Failed to initialize PayPal. Please try again later.';
  });
          }
