import { db } from "./firebase.js";

import {

  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  setDoc,
  getDoc

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  getMessaging,
  getToken,
  onMessage

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

/* =========================================
   FIREBASE MESSAGING SAFE
========================================= */

let messaging = null;

try{

  messaging = getMessaging();

}

catch(err){

  console.log(
    "Firebase Messaging gagal dijalankan",
    err
  );

}

/* =========================================
   ELEMENT
========================================= */

const ordersGrid =
document.getElementById("ordersGrid");

const totalOrders =
document.getElementById("totalOrders");

const foodIncomeText =
document.getElementById("foodIncome");

const shippingIncomeText =
document.getElementById("shippingIncome");

const totalIncome =
document.getElementById("totalIncome");

const notifSound =
document.getElementById("notifSound");

const stockContainer =
document.getElementById("stockContainer");



      return;

    }

    const permission =
    await Notification.requestPermission();
/* =========================================
   REQUEST NOTIFICATION
========================================= */

let notificationReady = false;

async function initNotification(){

  try{

    if(!("Notification" in window)){

      console.log(
        "Browser tidak support notification"
      );

      return;

    }

    if(!("serviceWorker" in navigator)){

      console.log(
        "Service Worker tidak support"
      );

      return;

    }

    const permission =
    await Notification.requestPermission();

    if(permission !== "granted"){

      console.log(
        "Notification ditolak"
      );

      return;

    }

    const registration =
    await navigator.serviceWorker.register(
      "./firebase-messaging-sw.js"
    );

    console.log(
      "Service Worker aktif"
    );

    if(!messaging){

      console.log(
        "Messaging tidak aktif"
      );

      return;

    }

    const token =
    await getToken(

      messaging,

      {

        vapidKey:
        "BGh-L_lgs9xW_x5shygy809JCOt5niZD-K1pLDMCGf7L0VArq8imX-4onVrdlAYxzkR_TC2egguWJC85GHb5jCc",

        serviceWorkerRegistration:
        registration

      }

    );

    console.log(
      "FCM TOKEN:",
      token
    );

  }

  catch(err){

    console.log(
      "FCM ERROR:",
      err
    );

  }

}

initNotification();

/* =========================================
   UNLOCK AUDIO
========================================= */

let audioUnlocked = false;

document.body.addEventListener(

  "click",

  async ()=>{

    try{

      if(audioUnlocked) return;

      if(!notifSound) return;

      await notifSound.play();

      notifSound.pause();

      notifSound.currentTime = 0;

      audioUnlocked = true;

      console.log(
        "Audio notification unlocked"
      );

    }

    catch(err){

      console.log(
        "Audio unlock gagal",
        err
      );

    }

  },

  { once:true }

);

/* =========================================
   PLAY NOTIFICATION SOUND
========================================= */

function playNotif(){

  try{

    if(!notifSound) return;

    notifSound.pause();

    notifSound.currentTime = 0;

    const playPromise =
    notifSound.play();

    if(playPromise !== undefined){

      playPromise.catch((err)=>{

        console.log(
          "Notif sound gagal",
          err
        );

      });

    }

  }

  catch(err){

    console.log(
      "Notif error",
      err
    );

  }

}

/* =========================================
   SHOW NOTIFICATION
========================================= */

function showNotification(title,body){

  try{

    if(Notification.permission !== "granted")
    return;

    new Notification(

      title,

      {

        body:body,

        icon:"Seblak.jpg",

        badge:"Seblak.jpg",

        vibrate:[200,100,200],

        requireInteraction:true,

        silent:false

      }

    );

  }

  catch(err){

    console.log(
      "Notification error",
      err
    );

  }

}

/* =========================================
   FOREGROUND MESSAGE
========================================= */

if(messaging){

  onMessage(

    messaging,

    (payload)=>{

      console.log(
        "Message diterima",
        payload
      );

      setTimeout(()=>{

        playNotif();

      },150);

      showNotification(

        payload.notification?.title ||
        "🔥 Order Baru",

        payload.notification?.body ||
        "Ada pesanan baru"

      );

    }

  );

}

/* =========================================
   ORDER REALTIME
========================================= */

let firstLoad = true;

let knownOrders = new Set();

const ordersQuery = query(

  collection(db,"orders"),

  orderBy("createdAt","desc")

);

onSnapshot(

  ordersQuery,

  (snapshot)=>{

    if(!ordersGrid) return;

    ordersGrid.innerHTML = "";

    let foodIncome = 0;

    let shippingIncome = 0;

    totalOrders.innerText =
    snapshot.size;

    /* =========================================
       DETEKSI ORDER BARU
    ========================================= */

    snapshot.docChanges().forEach((change)=>{

      if(change.type === "added"){

        const orderId =
        change.doc.id;

        /* =========================================
           SKIP FIRST LOAD
        ========================================= */

        if(firstLoad){

          knownOrders.add(orderId);

          return;

        }

        /* =========================================
           ORDER BARU
        ========================================= */

        if(!knownOrders.has(orderId)){

          knownOrders.add(orderId);

          console.log(
            "ORDER BARU:",
            orderId
          );

          setTimeout(()=>{

            playNotif();

          },150);

          showNotification(

            "🔥 Order Baru Masuk",

            "Ada pesanan baru di dashboard admin"

          );

        }

      }

    });

    firstLoad = false;

/* =========================================
   ORDER REALTIME
========================================= */

let firstLoad = true;

const ordersQuery = query(

  collection(db,"orders"),

  orderBy("createdAt","desc")

);

onSnapshot(

  ordersQuery,

  (snapshot)=>{

    if(!ordersGrid) return;

    ordersGrid.innerHTML = "";

    let foodIncome = 0;

    let shippingIncome = 0;

    totalOrders.innerText =
    snapshot.size;

    /* =========================================
       ORDER BARU
    ========================================= */

    if(

      !firstLoad &&

      snapshot.docChanges().some(
        change => change.type === "added"
      )

    ){

      playNotif();

      showNotification(

        "🔥 Order Baru Masuk",

        "Ada pesanan baru di dashboard admin"

      );

    }

    firstLoad = false;

    snapshot.forEach((docSnap)=>{

      const data =
      docSnap.data();

      const total =
      data.total || 0;

      const shipping =
      data.shipping || 0;

      const foodTotal =
      total - shipping;

      foodIncome += foodTotal;

      shippingIncome += shipping;

      let itemsHTML = "";

      if(Array.isArray(data.items)){

        data.items.forEach((item)=>{

          itemsHTML += `

            <div class="item">

              <span>
                ${item.name}
              </span>

              <strong>
                Rp ${(item.price || 0)
                .toLocaleString("id-ID")}
              </strong>

            </div>

          `;

        });

      }

      let statusClass =
      "waiting";

      let statusText =
      "🕒 Menunggu";

      if(data.status === "Diproses"){

        statusClass =
        "process";

        statusText =
        "🍳 Diproses";

      }

      if(data.status === "Selesai"){

        statusClass =
        "done";

        statusText =
        "✅ Selesai";

      }

      const paymentMethod =
      data.paymentMethod || "COD";

      const card =
      document.createElement("div");

      card.className =
      "order-card";

      card.innerHTML = `

        <div class="order-top">

          <div class="order-name">
            ${data.customerName || "-"}
          </div>

          <div class="status ${statusClass}">
            ${statusText}
          </div>

        </div>

        <div class="order-info">

          <p>
            📞 ${data.customerPhone || "-"}
          </p>

          <p>
            📍 ${data.customerAddress || "-"}
          </p>

          <p>
            🚚 Ongkir:
            Rp ${shipping.toLocaleString("id-ID")}
          </p>

          <p>
            📏 Jarak:
            ${data.distance || 0} km
          </p>

          <p>
            💳 Pembayaran:
            ${paymentMethod}
          </p>

          ${
            paymentMethod === "QRIS"
            ? `
            <p>
              🧾 Bukti Transfer:
              Kirim via WhatsApp
            </p>
            `
            : `
            <p>
              💵 COD Saat Pesanan Sampai
            </p>
            `
          }

        </div>

        <div class="order-detail">

          <p>
            🌶️ Level Pedas:
            <strong>
              ${data.spicyLevel || "-"}
            </strong>
          </p>

          <p>
            🥣 Kuah:
            <strong>
              ${data.soupType || "-"}
            </strong>
          </p>

          <p>
            🧂 Rasa:
            <strong>
              ${data.tasteType || "-"}
            </strong>
          </p>

          <p>
            📝 Catatan:
            <strong>
              ${data.note || "-"}
            </strong>
          </p>

        </div>

        <div class="items">

          ${itemsHTML}

        </div>

        <div class="total">

          🍜 Seblak:
          Rp ${foodTotal.toLocaleString("id-ID")}

          <br><br>

          🚚 Ongkir:
          Rp ${shipping.toLocaleString("id-ID")}

          <br><br>

          💰 Total:
          Rp ${total.toLocaleString("id-ID")}

        </div>

        <div class="action">

          <button class="process-btn">
            🍳 Diproses
          </button>

          <button class="done-btn">
            ✅ Selesai
          </button>

          <button class="delete-btn">
            🗑 Hapus
          </button>

        </div>

      `;

      card.querySelector(
        ".process-btn"
      ).onclick = async()=>{

        await updateDoc(

          doc(
            db,
            "orders",
            docSnap.id
          ),

          {
            status:"Diproses"
          }

        );

      };

      card.querySelector(
        ".done-btn"
      ).onclick = async()=>{

        await updateDoc(

          doc(
            db,
            "orders",
            docSnap.id
          ),

          {
            status:"Selesai"
          }

        );

      };

      card.querySelector(
        ".delete-btn"
      ).onclick = async()=>{

        const yes =
        confirm(
          "Hapus order ini?"
        );

        if(!yes) return;

        await deleteDoc(

          doc(
            db,
            "orders",
            docSnap.id
          )

        );

      };

      ordersGrid.appendChild(card);

    });

    foodIncomeText.innerHTML =
    `Rp ${foodIncome
    .toLocaleString("id-ID")}`;

    shippingIncomeText.innerHTML =
    `Rp ${shippingIncome
    .toLocaleString("id-ID")}`;

    totalIncome.innerHTML =
    `Rp ${(foodIncome + shippingIncome)
    .toLocaleString("id-ID")}`;

  },

  (error)=>{

    console.log(
      "Firestore Error:",
      error
    );

    if(ordersGrid){

      ordersGrid.innerHTML = `

        <div style="padding:20px;">

          ❌ Firestore gagal connect

          <br><br>

          ${error.message}

        </div>

      `;

    }

  }

);

/* =========================================
   STORE OPEN CLOSE
========================================= */

const toggleStoreBtn =
document.getElementById(
  "toggleStore"
);

const storeStatusText =
document.getElementById(
  "storeStatusText"
);

const storeRef =
doc(
  db,
  "settings",
  "storeStatus"
);

setDoc(

  storeRef,

  {
    closed:false
  },

  {
    merge:true
  }

);

onSnapshot(

  storeRef,

  (snap)=>{

    const data =
    snap.data();

    const closed =
    data?.closed || false;

    if(closed){

      storeStatusText.innerHTML =
      "🔴 Warung Tutup";

      toggleStoreBtn.innerHTML =
      "🌤️ Buka Warung";

      toggleStoreBtn.className =
      "closed";

    }

    else{

      storeStatusText.innerHTML =
      "🟢 Warung Buka";

      toggleStoreBtn.innerHTML =
      "🌙 Tutup Warung";

      toggleStoreBtn.className =
      "open";

    }

  }

);

toggleStoreBtn.onclick =
async()=>{

  const snap =
  await getDoc(storeRef);

  const closed =
  snap.data()?.closed || false;

  await setDoc(

    storeRef,

    {
      closed:!closed
    },

    {
      merge:true
    }

  );

};

/* =========================================
   TOPPING
========================================= */

const toppingList = [

  "Sawi Putih",
  "Cuanki",
  "Ceker",
  "Cirawang",
  "Dimsum Aci",
  "Tahu Aci",
  "Pangsit Basah",
  "Tulang",
  "Kerupuk Putih",
  "Kerupuk Merah",
  "Makaroni",
  "Somay Kering Mini",
  "Kerupuk Corak",
  "Jamur Enoki",
  "Mie Kuning",
  "Lidah",
  "Bihun",
  "Tahu Kering 3pcs",
  "Usus",
  "Kembang Tahu",
  "Supa Lember",
  "Kwetiau",
  "Jamur Salju",
  "Telur Ayam",
  "Telur Puyuh",
  "Tahu Putih",
  "Bakso Ikan",
  "Cilok Gajih",
  "Bakso Sedang",
  "Tahu Bakso",
  "Bakso Besar",
  "Sawi Hijau",
  "Chikuwa",
  "Otak-otak",
  "Sosis Ayam",
  "Sosis Merah Mini Dilamo",
  "Sosis Sapi Mini",
  "Sosis Besar",
  "Crab Stick",
  "Seafood Tofu",
  "Fish Roll",
  "Odeng",
  "Dumpling Ayam",
  "Dumpling Keju",
  "Dadali",
  "Sayur Kol",
  "Soun",
  "Daun Jeruk Nipis"

];

/* =========================================
   AUTO CREATE STOCK DOCS
========================================= */

async function initStocks(){

  for(const item of toppingList){

    await setDoc(

      doc(
        db,
        "stocks",
        item.replaceAll("/","-")
      ),

      {
        available:true
      },

      {
        merge:true
      }

    );

  }

}

/* =========================================
   STOCK RENDER
========================================= */

function renderStocks(stockData = {}){

  if(!stockContainer) return;

  stockContainer.innerHTML = "";

  toppingList.forEach((item)=>{

    const stock =
    stockData[item] !== false;

    const div =
    document.createElement("div");

    div.className =
    "stock-item";

    div.innerHTML = `

      <div class="stock-top">

        <strong>${item}</strong>

        <span class="${
          stock
          ? "ready"
          : "empty"
        }">

          ${
            stock
            ? "READY"
            : "HABIS"
          }

        </span>

      </div>

      <div class="stock-actions">

        <button
          class="stock-btn ${stock ? "active" : ""}"
        >
          Ready
        </button>

        <button
          class="stock-btn ${!stock ? "active" : ""}"
        >
          Habis
        </button>

      </div>

    `;

    const btns =
    div.querySelectorAll(
      ".stock-btn"
    );

    btns[0].onclick =
    ()=>{

      setStock(
        item,
        true
      );

    };

    btns[1].onclick =
    ()=>{

      setStock(
        item,
        false
      );

    };

    stockContainer.appendChild(div);

  });

}

/* =========================================
   SET STOCK
========================================= */

async function setStock(
  item,
  status
){

  await setDoc(

    doc(
      db,
      "stocks",
      item.replaceAll("/","-")
    ),

    {
      available:status
    },

    {
      merge:true
    }

  );

}

/* =========================================
   REALTIME STOCK
========================================= */

onSnapshot(

  collection(db,"stocks"),

  (snapshot)=>{

    const stockData = {};

    snapshot.forEach((docSnap)=>{

      stockData[
        docSnap.id.replaceAll("-","/")
      ] =
      docSnap.data().available;

    });

    renderStocks(stockData);

  }

);

/* =========================================
   START
========================================= */

initStocks();

renderStocks();
