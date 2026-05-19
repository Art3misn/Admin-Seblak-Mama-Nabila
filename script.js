import { db } from "../firebase.js";

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

/* =========================================
   ELEMENT
========================================= */

const ordersGrid =
document.getElementById("ordersGrid");

const totalOrders =
document.getElementById("totalOrders");

const totalIncome =
document.getElementById("totalIncome");

const saveScheduleBtn =
document.getElementById("saveSchedule");

const openTime =
document.getElementById("openTime");

const closeTime =
document.getElementById("closeTime");

const notifSound =
document.getElementById("notifSound");

const stockContainer =
document.getElementById("stockContainer");

/* =========================================
   REALTIME ORDER
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

    let income = 0;

    totalOrders.innerText =
    snapshot.size;

    /* NOTIF ORDER BARU */

    if(!firstLoad){

      notifSound?.play();

    }

    firstLoad = false;

    snapshot.forEach((docSnap)=>{

      const data =
      docSnap.data();

      income += data.total || 0;

      /* GROUP ITEM */

      const grouped = {};

      if(data.items){

        data.items.forEach(item=>{

          if(!grouped[item.name]){

            grouped[item.name] = {

              qty:0,
              price:item.price

            };

          }

          grouped[item.name].qty++;

        });

      }

      /* ITEM HTML */

      let itemsHTML = "";

      Object.keys(grouped).forEach(name=>{

        const item = grouped[name];

        itemsHTML += `

          <div class="item">

            <span>
              ${name} x${item.qty}
            </span>

            <strong>

              Rp ${(
                item.qty *
                item.price
              ).toLocaleString("id-ID")}

            </strong>

          </div>

        `;

      });

      /* STATUS */

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

      /* CARD */

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
            🌶️ ${data.spicyLevel || "-"}
          </p>

          <p>
            🍲 ${data.soupType || "-"}
          </p>

          <p>
            🧂 ${data.tasteType || "-"}
          </p>

        </div>

        <div class="items">

          ${itemsHTML}

        </div>

        <div class="total">

          Rp ${(data.total || 0)
          .toLocaleString("id-ID")}

        </div>

        <div class="action">

          <button
            class="process-btn"
            data-id="${docSnap.id}"
          >
            Diproses
          </button>

          <button
            class="done-btn"
            data-id="${docSnap.id}"
          >
            ✅ Selesai
          </button>

          <button
            class="delete-btn"
            data-id="${docSnap.id}"
          >
            🗑 Hapus
          </button>

        </div>

      `;

      /* BUTTON */

      const processBtn =
      card.querySelector(
        ".process-btn"
      );

      const doneBtn =
      card.querySelector(
        ".done-btn"
      );

      const deleteBtn =
      card.querySelector(
        ".delete-btn"
      );

      processBtn.addEventListener(
        "click",
        async()=>{

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

        }

      );

      doneBtn.addEventListener(
        "click",
        async()=>{

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

        }

      );

      deleteBtn.addEventListener(
        "click",
        async()=>{

          const confirmDelete =
          confirm(
            "Hapus order ini?"
          );

          if(!confirmDelete) return;

          await deleteDoc(

            doc(
              db,
              "orders",
              docSnap.id
            )

          );

        }

      );

      ordersGrid.appendChild(card);

    });

    totalIncome.innerText =

    `Rp ${income.toLocaleString("id-ID")}`;

  }

);

/* =========================================
   STORE OPEN CLOSE
========================================= */

/* =========================================
   STORE OPEN CLOSE REALTIME
========================================= */

window.addEventListener(
  "DOMContentLoaded",
  ()=>{

    const toggleStoreBtn =
    document.getElementById(
      "toggleStore"
    );

    const storeStatusText =
    document.getElementById(
      "storeStatusText"
    );

    const storeCard =
    document.getElementById(
      "storeCard"
    );

    if(
      !toggleStoreBtn ||
      !storeStatusText
    ) return;

    const storeRef =
    doc(
      db,
      "settings",
      "storeStatus"
    );

    /* DEFAULT */

    setDoc(
      storeRef,
      {
        closed:false
      },
      {
        merge:true
      }
    );

    /* REALTIME */

    onSnapshot(
      storeRef,
      (snap)=>{

        if(!snap.exists()) return;

        const data =
        snap.data();

        const closed =
        data.closed || false;

        if(closed){

          storeStatusText.innerHTML =
          "🔴 Warung Sedang Tutup";

          toggleStoreBtn.innerHTML =
          "🌤️ Buka Warung";

          toggleStoreBtn.classList.remove(
            "open"
          );

          toggleStoreBtn.classList.add(
            "closed"
          );

          if(storeCard){

            storeCard.style.background =
            "linear-gradient(135deg,#fecaca,#fca5a5)";

          }

        }

        else{

          storeStatusText.innerHTML =
          "🟢 Warung Sedang Buka";

          toggleStoreBtn.innerHTML =
          "🌙 Tutup Warung";

          toggleStoreBtn.classList.remove(
            "closed"
          );

          toggleStoreBtn.classList.add(
            "open"
          );

          if(storeCard){

            storeCard.style.background =
            "linear-gradient(135deg,#bbf7d0,#86efac)";

          }

        }

      }

    );

    /* TOGGLE */

    toggleStoreBtn.addEventListener(
      "click",
      async()=>{

        const snap =
        await getDoc(storeRef);

        let closed = false;

        if(snap.exists()){

          closed =
          snap.data().closed || false;

        }

        await setDoc(
          storeRef,
          {
            closed:!closed,
            updatedAt:Date.now()
          },
          {
            merge:true
          }
        );

      }
    );

  }
);
/* =========================================
   TOPPING LIST ADMIN
========================================= */

const toppingList = [

  "Sawi Putih",
  "Somay Kering",
  "Ceker",
  "Bakso Aci",
  "Dimsum",

  "Tahu Aci",
  "Somay Basah",
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
  "Tahu Kering/3pcs",
  "Usus",
  "Kembang Tahu",

  "Supa Lember",
  "Kwetiau",
  "Jamur Salju",
  "Telur Ayam",
  "Telur Puyuh",

  "Tahu Putih",
  "Bakso Ikan",
  "Cilok",
  "Bakso Sedang",
  "Tahu Isi",

  "Bakso Besar",
  "Sawi Hijau",
  "Chikuwa",
  "Otak-otak",
  "Sosis Ayam",

  "Sosis Merah Mini Dilamo",
  "Sosis Sapi Mini",
  "Sosis Besar",
  "Crab Stick",
  "Tofu",

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
   STOCK REALTIME
========================================= */

function renderStocks(){

  stockContainer.innerHTML = "";

  toppingList.forEach((item)=>{

    const stockRef =
    doc(db,"stocks",item);

    onSnapshot(
      stockRef,
      (stockSnap)=>{

        let stock = true;

        if(stockSnap.exists()){

          stock =
          stockSnap.data().available;

        }

        let existing =
        document.getElementById(
          `stock-${item}`
        );

        const html = `

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
              class="
              stock-btn
              ${stock ? "active" : ""}
              "
              onclick="
              setStock(
                '${item}',
                true
              )
              "
            >
              Ready
            </button>

            <button
              class="
              stock-btn
              ${!stock ? "active" : ""}
              "
              onclick="
              setStock(
                '${item}',
                false
              )
              "
            >
              Habis
            </button>

          </div>

        `;

        if(existing){

          existing.innerHTML =
          html;

        }

        else{

          const div =
          document.createElement("div");

          div.className =
          "stock-item";

          div.id =
          `stock-${item}`;

          div.innerHTML =
          html;

          stockContainer.appendChild(div);

        }

      }
    );

  });

}

/* SET STOCK */

window.setStock = async(
  item,
  status
)=>{

  await setDoc(

    doc(
      db,
      "stocks",
      item
    ),

    {

      available:status

    }

  );

  renderStocks();

};

renderStocks();
