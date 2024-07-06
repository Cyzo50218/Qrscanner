
// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore, doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDPXfq-rqK87OyVh0p9n0iEzIUGcxEDLW0",
  authDomain: "qrscanner-1a132.firebaseapp.com",
  databaseURL: "https://qrscanner-1a132-default-rtdb.firebaseio.com",
  projectId: "qrscanner-1a132",
  storageBucket: "qrscanner-1a132.appspot.com",
  messagingSenderId: "545133545151",
  appId: "1:545133545151:web:eddca20f36d236be31e80a",
  measurementId: "G-CQL2JNS9YY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to get URL parameters
function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  return params;
}

// Function to handle visit tracking
async function trackVisit() {
  const params = getUrlParams();
  const uuid = params.uuid;

  if (uuid) {
    await incrementScanCount(uuid);
  }
}

// Function to increment scan count
async function incrementScanCount(uuid) {
  const todayDate = new Date().toISOString().split('T')[0]; // Today's date in yyyy-MM-dd format
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false }); // Current time in HH:mm format

  const docRef = doc(db, 'QRCodes', uuid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Initialize or retrieve scan counts
    let totalScans = data.totalScans || 0;
    let todayScans = data.todayScans || 0;
    let todayScanTimestamps = data.todayScanTimestamps || [];
    let todayScansLong = data.todayScansLong || [];
    let weeklyScans = data.weeklyScans || Array(7).fill(0);
    let yearlyScanCounts = data.yearlyScanCounts || {};
    let thisMonthCount = 0;

    const currentYear = new Date().getFullYear().toString();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // Month in MM format

    // Initialize yearly scan counts if not already present
    if (!yearlyScanCounts[currentYear]) {
      yearlyScanCounts[currentYear] = Array(12).fill(0);
    }

    const currentMonthIndex = parseInt(currentMonth) - 1; // Convert to 0-based index

    // Update monthly scan count
    yearlyScanCounts[currentYear][currentMonthIndex]++;

    // Calculate this month's total scan count
    thisMonthCount = yearlyScanCounts[currentYear][currentMonthIndex];

    // Reset daily scan counts if last scan date is not today
    const lastScanDate = data.lastScanDate || '';
    if (lastScanDate !== todayDate) {
      todayScans = 0;
      todayScanTimestamps = [];
      todayScansLong = [];
    }

    // Update scan counts
    todayScans++;
    totalScans++;
    weeklyScans[new Date().getDay()]++; // Increment weekly scan count for the current day of the week

    // Update or add today's scan timestamp and count
    const existingIndex = todayScanTimestamps.indexOf(currentTime);
    if (existingIndex !== -1) {
      todayScansLong[existingIndex]++;
    } else {
      todayScanTimestamps.push(currentTime);
      todayScansLong.push(1);
    }

    // Update Firestore document
    await updateDoc(docRef, {
      totalScans,
      todayScans,
      lastScanDate: todayDate,
      todayScanTimestamps,
      todayScansLong,
      weeklyScans,
      yearlyScanCounts,
      thisMonthCount
    });

    console.log('Scan count updated successfully.');

    // Retrieve the qrTextName field and handle redirection
    const qrTextName = data.qrTextName || '';
    handleRedirection(qrTextName);

  } else {
    // Document doesn't exist, create new document with initial values
    const initialData = {
            totalScans: 1,
      todayScans: 1,
      lastScanDate: todayDate,
      todayScanTimestamps: [currentTime],
      todayScansLong: [1],
      weeklyScans: Array(7).fill(0),
      yearlyScanCounts: {
        [currentYear]: Array(12).fill(0)
      },
      thisMonthCount: 1
    };

    await setDoc(docRef, initialData);
    console.log('Document created and scan count initialized.');
    
    // Retrieve the qrTextName field and handle redirection
    const qrTextName = initialData.qrTextName || '';
    handleRedirection(qrTextName);
  }
}

// Function to handle redirection based on qrTextName
function handleRedirection(qrTextName) {
  if (qrTextName.startsWith("http://") || qrTextName.startsWith("https://")) {
    window.location.href = qrTextName;
  } else if (qrTextName.endsWith(".jpg") || qrTextName.endsWith(".png") || qrTextName.endsWith(".jpeg")) {
    openImage(qrTextName);
  } else if (containsAlphanumericPattern(qrTextName)) {
    // Handle alphanumeric pattern case
  } else if (isLikelyGCash(qrTextName)) {
    launchGcashApp(qrTextName);
  } else if (isLikelyGCashWithP2P(qrTextName)) {
    launchGcashApp(qrTextName);
  } else if (isValidJson(qrTextName)) {
    // Handle JSON case
  } else if (isLikelyOtherBankCodes(qrTextName)) {
    // Handle other bank codes
  } else if (qrTextName.includes("com.android.providers.media.documents/document/image%")) {
    // Handle media documents
  } else if (qrTextName.includes("com.android.providers.downloads.documents/document/raw%")) {
    // Handle download documents
  } else {
    console.log("Unknown QR Code format");
  }
}

// Helper functions for redirection cases
function openImage(url) {
  window.open(url, '_blank');
}

function launchGcashApp(scannedText) {
  const merchantName = extractMerchantNameFromP2PQRCode(scannedText);
  const gcashURI = `gcash://sendmoney?recipient=${merchantName}`;

  try {
    const intent = new Intent(Intent.ACTION_VIEW, Uri.parse(gcashURI));
    context.startActivity(intent);
  } catch (e) {
    showInstallGcashDialog(scannedText);
  }
}

function showInstallGcashDialog(scannedText) {
  alert("GCash app is not installed. Redirecting to Play Store...");
  redirectToPlayStore("com.globe.gcash.android");
}

function redirectToPlayStore(packageName) {
  window.location.href = `market://details?id=${packageName}`;
}

function isLikelyGCash(text) {
  return text.startsWith("0002") && text.includes("ph.ppmi.p2m0111GX") && text.includes("GEN") && text.includes("ph.ppmi.qrph");
}

function isLikelyGCashWithP2P(text) {
  return text.startsWith("0002") && text.includes("com.p2pqrpay0111GX");
}

function isValidJson(text) {
  try {
    JSON.parse(text);
    return true;
  } catch (e) {
    return false;
  }
}

function isLikelyOtherBankCodes(text) {
  return text.startsWith("000") && text.includes("com.p2pqrpay0111P");
}

function containsAlphanumericPattern(text) {
  const pattern = /[a-zA-Z0-9]/;
  return pattern.test(text);
}

// Track visit when the page loads
window.onload = function() {
  trackVisit();
};

// UUID Gateway function
async function uuidGateway(qrTextuuid) {
  const q = query(collection(db, 'YourCollectionName'), where('uuid', '==', qrTextuuid));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(doc => {
    incrementScanCount(doc.id);
  });
}
