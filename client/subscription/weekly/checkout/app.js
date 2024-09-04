document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    initializePayPalButtons();
    
});

function initializePayPalButtons(planId) {
    paypal.Buttons({
        style: {
            shape: 'pill',       // Options: 'pill' | 'rect'
            color: 'blue',       // Options: 'gold' | 'blue' | 'silver' | 'white' | 'black'
            label: 'subscribe',  // Options: 'checkout' | 'pay' | 'buynow' | 'paypal' | 'installment' | 'subscribe' | 'donate'
            layout: 'vertical'   // Options: 'horizontal' | 'vertical'
        },
        createSubscription: function(data, actions) {
            // Creates the subscription with the retrieved plan ID
            return actions.subscription.create({
                'plan_id': 'P-0BJ291634E5618438M3MHF7I'
            });
        },
        onApprove: function(data) {
            console.log('Subscription approved:', data);
            alert('You have successfully subscribed with ID: ' + data.subscriptionID);

            // Call to update the subscription status
            updateSubstatus(data.subscriptionID, stats, userName, email);
        },
        onError: function(err) {
            console.error("PayPal Buttons Error:", err);
            document.getElementById('result-message').textContent = `An error occurred: ${err.message}`;
        }
    }).render('#paypal-button-container').catch(error => {
        console.error('Failed to render PayPal Buttons:', error);
        document.getElementById('result-message').textContent = 'Failed to initialize PayPal. Please try again later.';
    });
}

let userName = "clintonpogi";
let email = "clintonihegoro222";
let stats = "test";

function updateSubstatus(transactionId, stats, name, email) {
    const data = {
        userName: name,
        email: email,
        subscriptionType: stats,
        transactionId: transactionId
    };

    fetch('/subscription/daily/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(responseData => {
        console.log('Success:', responseData);
    })
    .catch(error => {
        console.error('Error updating subscription status:', error);
    });
}
