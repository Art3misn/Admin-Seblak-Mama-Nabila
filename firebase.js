import { initializeApp }

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getFirestore

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyAWwUOQZjklLMsFlytHTePBCG3eTD_Js-U",

  authDomain:
  "seblak-b93ea.firebaseapp.com",

  projectId: "seblak-b93ea",

  storageBucket:
  "seblak-b93ea.firebasestorage.app",

  messagingSenderId:
  "835711700566",

  appId: "1:835711700566:web:b1b4bbe29e0f28737875f7"

};

const app =
initializeApp(firebaseConfig);

export const db =
getFirestore(app);