// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZv4yWfPRGwa_ghZ3kWAo5FM-GSXsuBlM",
  authDomain: "xm-backeries.firebaseapp.com",
  projectId: "xm-backeries",
  storageBucket: "xm-backeries.appspot.com",
  messagingSenderId: "651500003117",
  appId: "1:651500003117:web:3de6419466323189a7fda4",
  measurementId: "G-35THG952Y2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);