import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdhuQAmB92hYvYFY2dxnjttSvNdC2o5XA",
  authDomain: "soccerapp-15cdb.firebaseapp.com",
  projectId: "soccerapp-15cdb",
  storageBucket: "soccerapp-15cdb.appspot.com",
  messagingSenderId: "215845465679",
  appId: "1:215845465679:web:7196931257b0df0e94843a",
  measurementId: "G-D9XNYJRE3D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
