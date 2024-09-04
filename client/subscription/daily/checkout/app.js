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
        const scriptSrc = "https://www.paypal.com/sdk/js?client-id=AdchnSRplQeuN4_MaZwIFzhl4iQ_nFP7ARTZnfJ3E7H-_rPbnLpsbKgdLf098LVoSFipi-q9Y3NE5N3C&currency=USD&components=buttons";

        script.src = scriptSrc;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
        document.body.appendChild(script);
    });
}

function updateSubstatus(transactionId, stats, name, email) {
    // Create the data object to send to the server
    const data = {
        userName: name,
        email: email,
        subscriptionType: stats,
        transactionId: transactionId
    };

    let stringifiedData;

    try {
        stringifiedData = JSON.stringify(data);
    } catch (error) {
        console.error('JSON.stringify error:', error);
        return; // or handle the error appropriately
    }

    fetch('/subscription/daily/api/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: stringifiedData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(responseData => {
        console.log('Success:', responseData);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

let productId;

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


fetch('/subscription/weekly/api/generateplan')
  .then(response => response.json())
  .then(data => {
    if (data.planId) {
      console.log("Generated PayPal Plan ID:", data.planId);
      
      productId = data.planId;
    } else {
      console.error("Failed to retrieve plan ID.");
    }
  })
  .catch(error => {
    console.error("Error fetching plan ID:", error);
  });
  
  
    paypal.Buttons({
        style: {
            shape: "pill",
            layout: "vertical",
            color: "blue",
            label: "subscribe",
        },
        createSubscription: function(data, actions) {
            return actions.subscription.create({
  'plan_id': 'P-7LW951417X003930PM3MIXCY' // Creates the subscription
});
},
onApprove: function(data, actions) {
          
                    alert('You have successfully subscribed to ' + data.subscriptionID); // Optional message given to subscriber
                    // Send signal to Android
                    sendPurchaseSignalToAndroid(data.subscriptionID, data.subscriptionType);
                    
                   
                }
    }).render("#paypal-button-container-P-7LW951417X003930PM3MIXCY").catch(error => {
        console.error('Failed to render PayPal Buttons:', error);
        document.getElementById('result-message').textContent = 'Failed to initialize PayPal. Please try again later.';
    });
}
