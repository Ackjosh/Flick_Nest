import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBhv406UMBrjbwslJ0a5Xx3nr-Svh-VtW0",
  authDomain: "flick-nest.firebaseapp.com",
  projectId: "flick-nest",
  storageBucket: "flick-nest.firebasestorage.app",
  messagingSenderId: "120606418265",
  appId: "1:120606418265:web:cb47725d29e58fe3b59848",
  measurementId: "G-4VVHNWE4Q7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
