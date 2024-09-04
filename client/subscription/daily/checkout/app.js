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
            console.log("Creating subscription...");
            return fetch("/subscription/daily/api/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_id: "YOUR_PLAN_ID",
                    vault: true // Save payment method for future use
                }),
            })
            .then(response => response.json())
            .then(orderData => {
                console.log("Subscription created:", orderData);
                if (orderData.id) {
                    return orderData.id;
                }
                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})` : JSON.stringify(orderData);
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
            return fetch(`/subscription/daily/api/subscriptions/${data.subscriptionID}/capture`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
            .then(response => response.json())
            .then(orderData => {
                console.log("Subscription captured:", orderData);
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
                    
                    console.log("Subscription successful!", transaction);
                    
                    // Send signal to Android
                    sendPurchaseSignalToAndroid(transaction.id, transaction.status);
                    
                   
                }
            })
            .catch(error => {
                console.error("Error capturing subscription:", error);
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
