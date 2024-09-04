const admin = require('firebase-admin');
const schedule = require('node-schedule');
const express = require('express');

const app = express();
app.use(express.json());

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://qrscanner-1a132-default-rtdb.firebaseio.com'
  });
}

app.post('/subscription/daily/api/status', async (req, res) => {
  const { userName, email, subscriptionType, transactionId } = req.body;
  
  if (!userName || !email || !subscriptionType || !transactionId) {
    return res.status(400).send('Missing required fields');
  }

  const subscriptionRef = admin.database().ref(`/subscription/${userName}`);

  let reminderInterval;
  if (subscriptionType === 'yearly') {
    reminderInterval = 365 * 24 * 60 * 60 * 1000;
  } else if (subscriptionType === 'weekly') {
    reminderInterval = 7 * 24 * 60 * 60 * 1000;
  } else if (subscriptionType === 'test'){
    reminderInterval = 24 * 60 * 60 * 1000;
  } else {
    return res.status(400).send('Unsupported subscription type');
  }

  const reminderTime = Date.now() + reminderInterval;

  await subscriptionRef.set({
    email,
    subscriptionType,
    transactionId,
    reminderTime,
    status: 'active'
  });

  schedule.scheduleJob(new Date(reminderTime), () => {
    sendNotification(userName, subscriptionType);
    subscriptionRef.update({
      status: 'expired'
    });
    
    await updateSubscriptionStatus(userName, 'subscribed expired for : ' + subscriptionType);

  });
  

  schedule.scheduleJob('0 0 * * *', async () => {
    const currentTime = Date.now();
    const timeRemaining = reminderTime - currentTime;
    await subscriptionRef.update({
      timeRemaining: timeRemaining > 0 ? timeRemaining : 0
    });
  });

  // Call the function to update subscription status
  await updateSubscriptionStatus(userName, 'subscribed: ' + subscriptionType);

  res.status(200).send('Subscription reminder scheduled');
});

function sendNotification(userName, subscriptionType) {
  getTokenForUser(userName).then(token => {
    if (token) {
      const message = {
        notification: {
          title: 'Subscription Reminder',
          body: `Your ${subscriptionType} subscription is due for renewal.`,
        },
        data: {
          renewal: 'true',  // Custom data payload
          subscriptionType: subscriptionType
        },
        token: token,
      };

      admin.messaging().send(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
    }
  });
}

function getTokenForUser(userName) {
  return admin.database().ref(`/registered_users/${userName}/token`).once('value').then(snapshot => snapshot.val());
}

async function updateSubscriptionStatus(userName, status) {
  await admin.database().ref(`/registered_users/${userName}/status`).set(status);
}

module.exports = app;
