// Header Data
const intervalDYO = setInterval(checkDYO, 1000);
const intervalDY = setInterval(checkDY, 1000);
const endIntervalDYO = 10;
const endIntervalDY = 10;
let counter = 0;
const queryString = window.location.search;

window.myUrlUs = "//cdn.dynamicyield.com/api/";
window.myUrlEu = "//cdn-eu.dynamicyield.com/api/";
window.DY = window.DY || {};

// if (!sessionStorage.getItem("location") == "us") {
//   sessionStorage.setItem("location", "us");
// }

function init() {
  $("#contextDD").change(checkIfDataNeeded);
  $("#sendOptIn").on("click", optIn);
  $("#sendOptOut").on("click", optOut);
  $("#changeSection").on("click", changeSection);
  $("#changeContext").on("click", changeContext);
  $("#changeLngButton").on("click", changeLngContext);
  $("#purchase").on("click", purchase);
  $("#addToCart").on("click", addToCart);
  $("#clearCart").on("click", clearCart);
  $("#logIn").on("click", logIn);
  $("#dark_mode").on("click", darkMode);

  if (!document.cookie) {
    document.cookie = "dark=true";
  }
  document.getElementById("thisSectionID").innerHTML = sessionStorage.getItem(
    "sectionID"
  );
  document.getElementById("thisContext").innerHTML = sessionStorage.getItem(
    "context_type"
  );
  if (sessionStorage.getItem("context_lang")) {
    document.getElementById("thisContextLang").innerHTML =
      "Lang - " + sessionStorage.getItem("context_lang");
  }
  if (sessionStorage.getItem("context_data")) {
    document.getElementById("thisData").innerHTML =
      "Data - " + sessionStorage.getItem("context_data");
  }
  printCart();
}

if (searchParams("sectionId", queryString)) {
  sessionStorage.setItem("sectionID", searchParams("sectionId", queryString));
} else if (getParamsFromReferer()) {
  let param = getParamsFromReferer();
  let hash = document.location.hash;
  document.location.hash = hash;
  insertParam("sectionId", param);
  sessionStorage.setItem("sectionID", param);
}

if (sessionStorage.getItem("sectionID")) {
  DY = {
    scsec: sessionStorage.getItem("sectionID"),
    API: function () {
      (DY.API.actions = DY.API.actions || []).push(arguments);
    }
  };
}

if (!sessionStorage.getItem("context_type")) {
  DY.recommendationContext = {
    type: "HOMEPAGE"
  };
  sessionStorage.setItem("context_type", "HOMEPAGE");
} else if (!sessionStorage.getItem("context_lang")) {
  if (!sessionStorage.getItem("context_data")) {
    DY.recommendationContext = {
      type: sessionStorage.getItem("context_type")
    };
  } else {
    DY.recommendationContext = {
      type: sessionStorage.getItem("context_type"),
      data: sessionStorage.getItem("context_data").split(",")
    };
  }
} else {
  if (!sessionStorage.getItem("context_data")) {
    DY.recommendationContext = {
      type: sessionStorage.getItem("context_type"),
      lng: sessionStorage.getItem("context_lang")
    };
  } else {
    DY.recommendationContext = {
      type: sessionStorage.getItem("context_type"),
      data: sessionStorage.getItem("context_data").split(","),
      lng: sessionStorage.getItem("context_lang")
    };
  }
}

if (sessionStorage.getItem("sectionID")) {
  if (getLocationFromSectionId() == "eu") {
    sessionStorage.setItem("location", "eu");
  } else {
    sessionStorage.setItem("location", "us");
  }
}

if (sessionStorage.getItem("location") == "us") {
  console.log("us");
  document.getElementById("api_dynamic").src =
    window.myUrlUs + sessionStorage.getItem("sectionID") + "/api_dynamic.js";
  document.getElementById("api_static").src =
    window.myUrlUs + sessionStorage.getItem("sectionID") + "/api_static.js";
} else if (sessionStorage.getItem("location") == "eu") {
  console.log("eu");
  document.getElementById("api_static").src =
    window.myUrlEu + sessionStorage.getItem("sectionID") + "/api_static.js";
  document.getElementById("api_dynamic").src =
    window.myUrlEu + sessionStorage.getItem("sectionID") + "/api_dynamic.js";
}

if (getCookie("dark") == "false") {
  document.documentElement.style.setProperty("--primary-color", "#ffffff");
  document.documentElement.style.setProperty("--secondary-color", "#007bff");
  document.documentElement.style.setProperty(
    "--border-color",
    "rgba(173, 165, 165, 0.493)"
  );
  document.documentElement.style.setProperty("--text-color", "#000000");
  document.documentElement.style.setProperty("--buttons-color", "#007bff");
  document.getElementById("dark_mode").value = "Dark Mode";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function darkMode() {
  if (getCookie("dark") == "true") {
    document.cookie = "dark=false";
    reload();
  } else {
    document.cookie = "dark=true";
    reload();
  }
}

function searchParams(key, queryString) {
  const urlParams = new URLSearchParams(queryString);
  const section = urlParams.get(key);
  console.log(section);
  return section;
}

function getParamsFromReferer() {
  let referrer = document.referrer;
  let section = searchParams("redirectToSectionId", referrer);
  console.log(referrer);
  console.log(section);
  return section;
}

function OptOutObj(hashedEmail) {
  this.name = "message opt out";
  this.properties = {
    dyType: "message-optout-v1",
    cuidType: "he",
    hashedEmail: hashedEmail
  };
}

function OptInObj(email) {
  (this.name = "message opt in"),
  (this.properties = {
    dyType: "message-optin-v1",
    cuidType: "email",
    plainTextEmail: email
  });
}

function Purchase(obj) {
  this.name = "Purchase";
  this.properties = {
    dyType: "purchase-v1",
    value: 45.0,
    currency: "USD",
    cart: obj
  };
}

function AddToCart(obj, productStr) {
  this.name = "Add to Cart";
  this.properties = {
    dyType: "add-to-cart-v1",
    value: 34.45,
    currency: "USD",
    productId: productStr[productStr.length - 1],
    quantity: 1,
    size: "XL",
    cart: obj
  };
}

async function checkDYO() {
  try {
    if (DYO) {
      printVersion();
      window.setTimeout(printDyid, 2000);
      clearInterval(intervalDYO);
    } else if (counter == endIntervalDYO) {
      clearInterval(intervalDYO);
      console.log("DYO:" + counter);
    }
    counter++;
  } catch {}
}

async function checkDY() {
  try {
    if (DY) {
      window.setTimeout(getAudience, 2000);
      clearInterval(intervalDY);
    } else if (counter == endIntervalDY) {
      clearInterval(intervalDY);
    }
    counter++;
    console.log("DY:" + counter);
  } catch (e) {
    console.error(e);
  }
}

function isEmptyStr(str) {
  if (str.trim() == "") {
    return true;
  } else {
    return false;
  }
}

function purchase() {
  event.preventDefault();
  // let skuStr = document.purchase.product01.value.trim();
  // var str = skuStr.split(", ");
  let obj = JSON.parse(sessionStorage.getItem("cart"));
  let totalCart = 0;
  // for (var i = 0; i < str.length; i++) {
  //   obj.push({
  //     productId: str[i],
  //     quantity: 1,
  //     itemPrice: 45.0
  //   });
  // }

  for (const key in obj) {
    totalCart += Number(obj[key].itemPrice);
  }
  console.log(totalCart);
  const purchaseObj = new Purchase(obj);
  // document.purchase.reset();

  if (window.confirm("Do you want to fire this event?")) {
    DY.API("event", purchaseObj);
    snackbar("Purchased");
    $(".toast").toast("show");
  }
  sessionStorage.removeItem("cart");
  printCart();
  console.log(purchaseObj);
}

function addToCart() {
  event.preventDefault();
  let skuStr = document.addToCart.product02.value.trim();
  let price = document.addToCart.product02Price.value.trim();
  let str = skuStr.split(", ");
  let cartObj;
  if (sessionStorage.getItem("cart")) {
    cartObj = JSON.parse(sessionStorage.getItem("cart"));
  } else {
    cartObj = [];
  }

  for (var i = 0; i < str.length; i++) {
    cartObj.push({
      productId: str[i],
      quantity: 1,
      itemPrice: price
    });
  }
  addToSessionStorage("cart", JSON.stringify(cartObj));
  const addToCartObj = new AddToCart(cartObj, str);
  document.addToCart.reset();

  DY.API("event", addToCartObj);
  snackbar("Add to cart SKU: " + skuStr);
  $(".toast").toast("show");
  printCart();
  console.log(addToCartObj);
}

function printCart() {
  let cart = JSON.parse(sessionStorage.getItem("cart"));
  let resToPrint = "<tr><th>SKU</th><th>Price</th></tr>";
  try {
    cart.forEach(element => {
      resToPrint += `
  <tr><td>${element.productId}</td><td> ${element.itemPrice}$ </td></tr>`;
    });
  } catch {
    console.log("cart is empty")
  } finally {
    document.getElementById("cartList").innerHTML = resToPrint;
  }
}

function clearCart() {
  event.preventDefault;
  sessionStorage.removeItem("cart");
  printCart();
}

function optIn() {
  event.preventDefault();
  let email = document.getElementById("optInEmail").value.trim();
  console.log(email);
  const optObj = new OptInObj(email);
  document.optIn.reset();
  DY.API("event", optObj);
  snackbar("Opt in: " + email);
  $(".toast").toast("show");
  console.log(optObj);
}

async function optOut() {
  event.preventDefault();
  let email = document.getElementById("optOutEmail").value.trim();
  let hashedEmail = sha256(email);
  const optObj = new OptOutObj(hashedEmail);
  document.optOut.reset();
  DY.API("event", optObj);
  snackbar("Opt out: " + email);
  $(".toast").toast("show");
  console.log(optObj);
}

function sha256(str) {
  let wordArray = CryptoJS.SHA256(str);
  let hashedStr = wordArray.toString(CryptoJS.enc.Hex);
  return hashedStr;
}

function changeLngContext() {
  event.preventDefault();
  let lang = $("#lngId").val();
  if (lang) {
    addToSessionStorage("context_lang", lang);
  }
  reload();
}

function changeContext() {
  event.preventDefault();
  let context = document.context.context.value.trim();
  let SKU = document.context.SKU.value.trim();
  var tempSKU = splitByComma(SKU);
  var contextUpperCase = context.toLocaleUpperCase();
  if (
    contextUpperCase == "PRODUCT" &&
    contextUpperCase == "CATEGORY" &&
    contextUpperCase == "CART"
  ) {
    DY.API("context", {
      type: contextUpperCase,
      data: tempSKU
    });
  } else if (contextUpperCase == "HOMEPAGE" && contextUpperCase == "OTHER") {
    DY.API("context", {
      type: contextUpperCase
    });
  }
  reloadsObjectsToThePage();
  removeFromSessionStorage("context_type");
  removeFromSessionStorage("context_data");
  addToSessionStorage("context_type", contextUpperCase);
  if (contextUpperCase != "HOMEPAGE" && contextUpperCase != "OTHER") {
    addToSessionStorage("context_data", tempSKU);
  }
  reload();
  console.log(
    `Context changed to: ${contextUpperCase} <br> Data changed to: ${SKU}`
  );
}

function reloadsObjectsToThePage() {
  DYO.smartObject("context change API", {
    target: "dy_context_change_API",
    inline: true
  });
}

function removeFromSessionStorage(key) {
  sessionStorage.removeItem(key);
}

function addToSessionStorage(key, value) {
  sessionStorage.setItem(key, value);
}

function reload() {
  location.reload();
}

function changeSection() {
  event.preventDefault();
  let newSectionID = document.ChangeSection.sectionID.value.trim();
  let originalURL = document.location.href;
  let alteredURL = removeParam("sectionId", originalURL);
  sessionStorage.clear();
  localStorage.clear();

  addToSessionStorage("sectionID", newSectionID);
  let locationBySection = getLocationFromSectionId();
  console.log(locationBySection);
  addToSessionStorage("location", locationBySection);
  console.log(`Section changed to: ${newSectionID}`);
  insertParam("sectionId", newSectionID);
}

function getLocationFromSectionId() {
  if (sessionStorage.getItem("sectionID").charAt(0) == "9") {
    return "eu";
  } else {
    return "us";
  }
}

function removeParam(key, sourceURL) {
  var rtn = sourceURL.split("?")[0],
    param,
    params_arr = [],
    queryString = sourceURL.indexOf("?") !== -1 ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
    params_arr = queryString.split("&");
    for (var i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split("=")[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    rtn = rtn + "?" + params_arr.join("&");
  }
  return rtn;
}

function insertParam(key, value) {
  key = encodeURI(key);
  value = encodeURI(value);
  var kvp = document.location.search.substr(1).split("&");
  var i = kvp.length;
  var x;

  while (i--) {
    x = kvp[i].split("=");
    if (x[0] == key) {
      x[1] = value;
      kvp[i] = x.join("=");
      break;
    }
  }

  if (i < 0) {
    kvp[kvp.length] = [key, value].join("=");
  }

  document.location.search = kvp.join("&");
}

function logIn() {
  event.preventDefault();
  let userCuid = document.Login.cuid.value.trim();
  let userType = document.Login.type.value.trim();
  DY.API("event", {
    name: "Login",
    properties: {
      dyType: "login-v1",
      cuid: userCuid,
      cuidType: userType
    }
  });
  document.Login.reset();
  snackbar("Login by " + userType + ": " + userCuid);
}

function splitByComma(str) {
  var temp = new Array();
  temp = str.split(", ");
  return temp;
}

function snackbar(str) {
  let snackbar = document.getElementById("snackbar");

  snackbar.className = "show";
  snackbar.innerHTML = str;

  setTimeout(function () {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
  console.log(str);
}

function printVersion() {
  document.getElementById("thisScriptVersion").innerHTML = window.DYO.version;
}

function printDyid() {
  document.getElementById("dyid").innerHTML = DY.dyid;
}

function checkIfDataNeeded() {
  if (
    document.getElementById("HOMEPAGE").selected ||
    document.getElementById("OTHER").selected
  ) {
    document.getElementById("sku_conteiner").style.display = "none";
  } else {
    document.getElementById("sku_conteiner").style.display = "block";
  }
}

async function getAudience() {
  let audiences = "";
  let audienceForURL = "";
  let sharedAudiences = "";
  try {
    audiences = DY.ServerUtil.getUserAudiences();
    sharedAudiences = DY.shrAud;
    audienceForURL = audiences.toString().replace(/,/g, ".");
  } catch {
    console.log("No section ID");
  }
  let resToPrint = "";
  addToSessionStorage("audiences", audienceForURL);
  addToSessionStorage("shared_audiences", sharedAudiences);

  if (sessionStorage.getItem("location") == "us") {
    try {
      fetch(
          `https://adm.dyqa.io/public/audiences_names?audiences=${sessionStorage.getItem(
          "audiences"
        )}&sectionId=${sessionStorage.getItem(
          "sectionID"
        )}&shared=${sessionStorage.getItem("shared_audiences")}`, {
            credentials: "include"
          }
        )
        .then(res => res.json())
        .then(aud => {
          aud.audiences.forEach(element => {
            resToPrint += `<div>${element.name}</div>`;
          });
          aud.shared.forEach(element => {
            resToPrint += `<div>${element.name}</div>`;
          });
          document.getElementById("printAudiences").innerHTML = resToPrint;
        });
    } catch {
      console.log("You are not logged in to the admin a DY admin user");
    }
  } else if (sessionStorage.getItem("location") == "eu") {
    try {
      fetch(
          `https://adm.dynamicyield.eu/public/audiences_names?audiences=${sessionStorage.getItem(
          "audiences"
        )}&sectionId=${sessionStorage.getItem(
          "sectionID"
        )}&shared=${sessionStorage.getItem("shared_audiences")}`, {
            credentials: "include"
          }
        )
        .then(res => res.json())
        .then(aud => {
          aud.audiences.forEach(element => {
            resToPrint += `<div>${element.name}</div>`;
          });
          aud.shared.forEach(element => {
            resToPrint += `<div>${element.name}</div>`;
          });
          document.getElementById("printAudiences").innerHTML = resToPrint;
        });
    } catch {
      console.log("You are not logged in to the admin a DY admin user");
    }
  }
}
$(init);