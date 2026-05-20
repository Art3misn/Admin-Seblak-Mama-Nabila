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

/* =========================================
   ELEMENT
========================================= */

const ordersGrid =
document.getElementById("ordersGrid");

const totalOrders =
document.getElementById("totalOrders");

const totalIncome =
document.getElementById("totalIncome");

const notifSound =
document.getElementById("notifSound");

const stockContainer =
document.getElementById("stockContainer");

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

    let income = 0;

    totalOrders.innerText =
    snapshot.size;

    if(

      !firstLoad &&

      snapshot.docChanges().some(
        change => change.type === "added"
      )

    ){

      notifSound?.play();

    }

    firstLoad = false;

    snapshot.forEach((docSnap)=>{

      const data =
      docSnap.data();

      income += data.total || 0;

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
          >
            Diproses
          </button>

          <button
            class="done-btn"
          >
            ✅ Selesai
          </button>

          <button
            class="delete-btn"
          >
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

    totalIncome.innerText =

    `Rp ${income.toLocaleString("id-ID")}`;

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
  "Dimsum",

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
          class="
          stock-btn
          ${stock ? "active" : ""}
          "
        >
          Ready
        </button>

        <button
          class="
          stock-btn
          ${!stock ? "active" : ""}
          "
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


/* =========================
   ADMIN IOS OPTIMIZATION
========================= */

/* IOS DETECT */

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
|| (navigator.platform === 'MacIntel'
&& navigator.maxTouchPoints > 1);

if(isIOS){

  document.body.classList.add("ios");

}

/* FIX IOS HEIGHT */

function setAppHeight(){

  document.documentElement.style.setProperty(
    '--app-height',
    `${window.innerHeight}px`
  );

}

window.addEventListener("resize", setAppHeight);

setAppHeight();

/* SIDEBAR */

const menuBtn =
document.querySelector(".menu-btn");

const sidebar =
document.querySelector(".sidebar");

if(menuBtn){

  menuBtn.addEventListener("click",()=>{

    sidebar.classList.toggle("active");

  });

}

/* CLOSE SIDEBAR MOBILE */

document.addEventListener("click",(e)=>{

  if(
    window.innerWidth <= 768 &&
    !sidebar.contains(e.target) &&
    !menuBtn.contains(e.target)
  ){

    sidebar.classList.remove("active");

  }

});

/* PREVENT DOUBLE TAP ZOOM */

let lastTouchEnd = 0;

document.addEventListener(
  "touchend",
  function(event){

    const now = (new Date()).getTime();

    if(now - lastTouchEnd <= 300){

      event.preventDefault();

    }

    lastTouchEnd = now;

  },
  { passive:false }
);

/* LAZY IMAGE */

document.querySelectorAll("img")
.forEach(img=>{

  img.loading = "lazy";

});

/* FIREBASE LISTENER MANAGER */

const listeners = [];

function registerListener(unsub){

  listeners.push(unsub);

}

window.addEventListener(
  "beforeunload",
  ()=>{

    listeners.forEach(unsub=>{

      if(typeof unsub === "function"){

        unsub();

      }

    });

  }
);

/* REALTIME UPDATE SMOOTH */

function smoothRender(callback){

  requestAnimationFrame(()=>{

    callback();

  });

}

/* IOS INPUT FIX */

const inputs =
document.querySelectorAll(
  "input, textarea, select"
);

inputs.forEach(input=>{

  input.addEventListener("focus",()=>{

    document.body.classList.add("keyboard-open");

  });

  input.addEventListener("blur",()=>{

    document.body.classList.remove("keyboard-open");

  });

});

/* PASSIVE SCROLL */

window.addEventListener(
  "touchstart",
  ()=>{},
  { passive:true }
);

/* MODAL IOS FIX */

function openModal(id){

  const modal =
  document.getElementById(id);

  if(modal){

    modal.style.display = "flex";

    document.body.style.overflow = "hidden";

  }

}

function closeModal(id){

  const modal =
  document.getElementById(id);

  if(modal){

    modal.style.display = "none";

    document.body.style.overflow = "";

  }

}
