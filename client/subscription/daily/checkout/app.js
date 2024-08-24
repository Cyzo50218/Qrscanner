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
    let scriptSrc = "https://www.paypal.com/sdk/js?client-id=AdchnSRplQeuN4_MaZwIFzhl4iQ_nFP7ARTZnfJ3E7H&currency=USD&components=buttons";

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
      label: "subscribe", // Use "subscribe" for subscription buttons
    },
    createSubscription() {
      console.log("Creating subscription...");
      return fetch("/subscription/yearly/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      .then(response => response.json())
      .then(subscriptionData => {
        console.log("Subscription created:", subscriptionData);
        if (subscriptionData.id) {
          return subscriptionData.id;
        }
        const errorDetail = subscriptionData?.details?.[0];
        const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description} (${subscriptionData.debug_id})` : JSON.stringify(subscriptionData);
        throw new Error(errorMessage);
      })
      .catch(error => {
        console.error("Error creating subscription:", error);
        document.getElementById('result-message').innerHTML = `Could not initiate PayPal Checkout...<br><br>${error.message}`;
        throw error;
      });
    },
    onApprove(data, actions) {
      console.log("Subscription approved:", data);
      const transactionId = data.subscriptionID; // Subscription ID from PayPal

      // Update the UI or notify the user of success
      document.getElementById('result-message').innerHTML = `Subscription successfully created with ID: ${transactionId}<br><br>See console for details`;
      console.log("Subscription result", data);

      // Send signal to Android
      sendPurchaseSignalToAndroid(transactionId, 'APPROVED');
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
