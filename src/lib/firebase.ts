import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  "projectId": "studio-2192908836-bf830",
  "appId": "1:455686310447:web:51a4b51c636edb587ad4da",
  "apiKey": "AIzaSyC816JykYWBH9x6KPSPGMfZPdH5P_IXDxo",
  "authDomain": "studio-2192908836-bf830.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "455686310447"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
