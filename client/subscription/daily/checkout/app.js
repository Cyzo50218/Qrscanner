document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded and parsed.");

  loadPayPalScript()
    .then(initPayPalButtons)
    .catch(error => {
      console.error('Failed to load PayPal SDK:', error);
      document.getElementById('result-message').textContent = 'Failed to initialize PayPal. Please try again later.';
    });
});

function loadPayPalScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    
    const scriptSrc = "https://www.paypal.com/sdk/js?client-id=AdchnSRplQeuN4_MaZwIFzhl4iQ_nFP7ARTZnfJ3E7H-_rPbnLpsbKgdLf098LVoSFipi-q9Y3NE5N3C&currency=USD&vault=true&intent=subscription&components=buttons";
    
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

  console.log("Initializing PayPal Buttons...");

  paypal.Buttons({
    createSubscription(data, actions) {
      return fetch("/subscription/create-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(planData => {
        console.log("Plan created:", planData);
        if (planData.id) {
          return actions.subscription.create({
            plan_id: planData.id
          });
        } else {
          throw new Error('Failed to create subscription plan.');
        }
      })
      .catch(error => {
        console.error("Error creating subscription:", error);
        document.getElementById('result-message').textContent = `Subscription creation failed: ${error.message}`;
        throw error;
      });
    },
    onApprove(data, actions) {
      console.log("Subscription approved:", data);
      document.getElementById('result-message').textContent = `Subscription successful: ${data.subscriptionID}`;
    },
    onError(err) {
      console.error("PayPal Buttons Error:", err);
      document.getElementById('result-message').textContent = `An error occurred: ${err.message}`;
    }
  }).render("#paypal-button-container")
    .catch(error => {
      console.error('Failed to render PayPal Buttons:', error);
      document.getElementById('result-message').textContent = 'Failed to initialize PayPal. Please try again later.';
    });
}
