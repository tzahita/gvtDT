// Header Data
const queryString = window.location.search;
window.myUrlUs = "//cdn.dynamicyield.com/api/";
window.myUrlEu = "//cdn-eu.dynamicyield.com/api/";
window.DY = window.DY || {};
const intervalDYO = setInterval(checkDYO, 1000);
const intervalDY = setInterval(checkDY, 1000);
const endIntervalDYO = 10;
const endIntervalDY = 10;
let counter = 0;

function init() {
  $("#contextDD").change(checkIfDataNeeded);
  $("#sendOptIn").on("click", optIn);
  $("#sendOptOut").on("click", optOut);
  $("#changeSection").on("click", changeSection);
  $("#changeContext").on("click", changeContext);
  $("#purchase").on("click", purchase);
  $("#addToCart").on("click", addToCart);
  $("#logIn").on("click", logIn);
  document.getElementById("thisSectionID").innerHTML = sessionStorage.getItem(
    "sectionID"
  );
  document.getElementById("thisContext").innerHTML = sessionStorage.getItem(
    "context_type"
  );
  if (sessionStorage.getItem("context_data")) {
    document.getElementById("thisData").innerHTML =
      "Data - " + sessionStorage.getItem("context_data") + "<br>";
  }
}



if (searchParams("SectionId", queryString)) {
  sessionStorage.setItem("sectionID", searchParams("SectionId", queryString));
} else if (getParamsFromReferer()) {
  sessionStorage.setItem("sectionID", getParamsFromReferer());
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

console.log(
  (document.getElementById("api_dynamic").src =
    window.myUrlUs + sessionStorage.getItem("sectionID") + "/api_dynamic.js")
);

console.log(
  (document.getElementById("api_static").src =
    window.myUrlUs + sessionStorage.getItem("sectionID") + "/api_static.js")
);

if (sessionStorage.getItem("location") == "us") {
  document.getElementById("api_dynamic").src =
    window.myUrlUs + sessionStorage.getItem("sectionID") + "/api_dynamic.js";
  document.getElementById("api_static").src =
    window.myUrlUs + sessionStorage.getItem("sectionID") + "/api_static.js";
} else if (sessionStorage.getItem("location") == "eu") {
  document.getElementById("api_dynamic").src =
    window.myUrlEu + sessionStorage.getItem("sectionID") + "/api_dynamic.js";
  document.getElementById("api_static").src =
    window.myUrlEu + sessionStorage.getItem("sectionID") + "/api_static.js";
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

function checkDYO() {
  try {
    if (DYO) {
      printVersion();
      window.setTimeout(printDyid, 2000);
      clearInterval(intervalDYO);
    } else if (counter == endIntervalDYO) {
      clearInterval(intervalDYO);
    }
    counter++;
    console.log("DYO:" + counter);
  } catch (e) {
    console.error(e);
  }
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
  let skuStr = document.purchase.product01.value.trim();
  var str = skuStr.split(", ");
  let obj = [];

  for (var i = 0; i < str.length; i++) {
    obj.push({
      productId: str[i],
      quantity: 1,
      itemPrice: 45.0
    });
  }

  const purchaseObj = new Purchase(obj);
  document.purchase.reset();

  if (window.confirm("Do you want to fire this event?")) {
    DY.API("event", purchaseObj);
    snackbar("Purchased SKU: " + skuStr);
    $(".toast").toast("show");
  }
  console.log(purchaseObj);
}

function addToCart() {
  event.preventDefault();
  let skuStr = document.addToCart.product02.value;
  let obj = [];
  var str = skuStr.split(", ");
  for (var i = 0; i < str.length; i++) {
    obj.push({
      productId: str[i],
      quantity: 2,
      itemPrice: 12.34
    });
  }

  const addToCartObj = new AddToCart(obj, str);
  document.addToCart.reset();
  if (window.confirm("Do you want to fire this event?")) {
    DY.API("event", addToCartObj);
    snackbar("Add to cart SKU: " + skuStr);
    $(".toast").toast("show");
  }
  console.log(addToCartObj);
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

  DYO.smartObject("context change API", {
    target: "dy_context_change_API",
    inline: true
  }); //reloads objects to the page after context change API call has been made, useful for testing single page applications features.
  sessionStorage.removeItem("context_type");
  sessionStorage.removeItem("context_data");
  sessionStorage.setItem("context_type", contextUpperCase);
  if (contextUpperCase != "HOMEPAGE" && contextUpperCase != "OTHER") {
    sessionStorage.setItem("context_data", tempSKU);
  }
  location.reload();
  console.log(
    "Context changed to: " + contextUpperCase + "<br>Data changed to: " + SKU
  );
}

function changeSection() {
  event.preventDefault();
  let newSectionID = document.ChangeSection.sectionID.value.trim();
  sessionStorage.clear();
  localStorage.clear();
  sessionStorage.setItem("sectionID", newSectionID);
  sessionStorage.setItem("location", document.ChangeSection.location.value);
  location.reload();
  console.log("Section changed to: " + newSectionID);
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
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";
  document.getElementById("snackbar").innerHTML = str;
  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    x.className = x.className.replace("show", "");
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
  let audiences = DY.ServerUtil.getUserAudiences();
  let sharedAudiences = DY.shrAud;
  let audienceForURL = audiences.toString().replace(/,/g, ".");
  let resToPrint = "";
  sessionStorage.setItem("audiences", audienceForURL);
  sessionStorage.setItem("shared_audiences", sharedAudiences);

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
    } catch (e) {
      console.error(e);
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
    } catch (e) {
      console.error(e);
    }
  }
}
$(init);