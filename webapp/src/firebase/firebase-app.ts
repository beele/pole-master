// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEptj5gju4Zz2rFLiPx2ez55ax1A9sqaQ",
  authDomain: "pole-master-f6594.firebaseapp.com",
  projectId: "pole-master-f6594",
  storageBucket: "pole-master-f6594.appspot.com",
  messagingSenderId: "236400497075",
  appId: "1:236400497075:web:985ef32f7e63053b16bbc6",
  measurementId: "G-FEGYKNZ7FB"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const initFirebase = () => {
    return app;
}
