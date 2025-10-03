import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Using ` to handle the new lines in the private key
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

// Initialize Firebase Admin
let adminApp;
if (!getApps().length) {
  adminApp = initializeApp(firebaseConfig);
} else {
  adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export { adminApp };
