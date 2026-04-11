import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDa9B5a7wAy7NAjr58FAj2wmrFOL8d26iU",
  authDomain: "villa-des-koalas.firebaseapp.com",
  projectId: "villa-des-koalas",
  storageBucket: "villa-des-koalas.firebasestorage.app",
  messagingSenderId: "787598301563",
  appId: "1:787598301563:web:babf7e8beed07faaac05de"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const STATE_DOC = doc(db, "villa", "state");

export function subscribeToState(callback) {
  return onSnapshot(STATE_DOC, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback(null);
    }
  });
}

export async function saveState(state) {
  try {
    await setDoc(STATE_DOC, {
      ...state,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error("Firestore save error:", err);
  }
}
