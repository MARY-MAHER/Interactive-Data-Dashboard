import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDM13nDGsfZIeypAK1lrSpI_f3zn6_o_C4",
  authDomain: "st-matthew-97940.firebaseapp.com",
  projectId: "st-matthew-97940",
  storageBucket: "st-matthew-97940.firebasestorage.app",
  messagingSenderId: "707630338844",
  appId: "1:707630338844:web:e5c2c9242260649da6a0d9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);