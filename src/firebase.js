import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCOc8-jCmrprZNfv0Zri98M7egpqOX1S1g",
  authDomain: "treasure-hunt-5ea19.firebaseapp.com",
  projectId: "treasure-hunt-5ea19",
  storageBucket: "treasure-hunt-5ea19.firebasestorage.app",
  messagingSenderId: "998533352012",
  appId: "1:998533352012:web:66c51592756ce7df0342e9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
