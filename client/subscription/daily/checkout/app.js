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
        const scriptSrc = "https://www.paypal.com/sdk/js?client-id=AdchnSRplQeuN4_MaZwIFzhl4iQ_nFP7ARTZnfJ3E7H-_rPbnLpsbKgdLf098LVoSFipi-q9Y3NE5N3C&vault=true&intent=subscription";
        script.src = scriptSrc;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
        document.body.appendChild(script);
    });
}

let productId;

function initPayPalButtons() {
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK not loaded');
        document.getElementById('result-message').textContent = 'PayPal SDK failed to load. Please try again later.';
        return;
    }

    function sendPurchaseSignalToAndroid(transactionId) {
        if (window.Android && typeof window.Android.onPurchaseComplete === "function") {
            window.Android.onPurchaseComplete(transactionId, ' - Weekly access');
        } else {
            console.log("Android interface not available");
        }
    }

    console.log("Initializing PayPal Buttons...");



  
    paypal.Buttons({
        style: {
  shape: 'pill',
  color: 'white',
  layout: 'vertical',
  label: 'subscribe'
},
        createSubscription: function(data, actions) {
            return actions.subscription.create({
  'plan_id': 'P-3L729787DP079342EM3MQYLY' // Creates the subscription
});
},
onApprove: function(data, actions) {
          
                    alert('You have successfully subscribed to ' + data.subscriptionID); // Optional message given to subscriber
                    // Send signal to Android
                    sendPurchaseSignalToAndroid(data.subscriptionID);
                    
                   
                }
    }).render("#paypal-button-container-P-3L729787DP079342EM3MQYLY").catch(error => {
        console.error('Failed to render PayPal Buttons:', error);
        document.getElementById('result-message').textContent = 'Failed to initialize PayPal. Please try again later.';
    });
}
