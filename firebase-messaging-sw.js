importScripts(
'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js'
);

importScripts(
'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js'
);

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

const messaging =
firebase.messaging();

messaging.onBackgroundMessage(

  (payload)=>{

    self.registration.showNotification(

      payload.notification.title,

      {

        body:
        payload.notification.body,

        icon:"Seblak.jpg",

        badge:"Seblak.jpg",

        vibrate:[200,100,200],

        requireInteraction:true

      }

    );

  }

);
