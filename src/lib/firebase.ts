import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCRPkwRT0ahqYrnq45qVccAskVWPLKIF1U",
  authDomain: "nexa-library.firebaseapp.com",
  databaseURL: "https://nexa-library-default-rtdb.firebaseio.com",
  projectId: "nexa-library",
  storageBucket: "nexa-library.firebasestorage.app",
  messagingSenderId: "513211376038",
  appId: "1:513211376038:web:fb25e84e89a9512cda2f67",
  measurementId: "G-RRS84WFGEM"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
