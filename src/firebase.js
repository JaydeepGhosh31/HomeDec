import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.API_KEY,
  authDomain: "homify-b7e27.firebaseapp.com",
  projectId: "homify-b7e27",
  storageBucket: "homify-b7e27.firebasestorage.app",
  messagingSenderId: "551969316175",
  appId: "1:551969316175:web:6037dec69787eaf4a4b93a",
  measurementId: "G-TGLSXRLNMY",
  databaseURL: import.meta.env.DB_URL
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Authenticate anonymously for secure database access
signInAnonymously(auth)
  .then(() => {
    console.log("Successfully signed in anonymously.");
  })
  .catch((error) => {
    console.error("Error signing in anonymously:", error);
  });
