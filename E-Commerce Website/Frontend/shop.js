// ======== SHOP.JS (FULLY FIXED) ========

// ----- DOM Elements -----
const modal = document.getElementById("reviewModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalReviews = document.getElementById("modalReviews");
const closeModal = document.getElementById("closeModal");
const reviewText = document.getElementById("reviewText");
const submitReview = document.getElementById("submitReview");
const stars = document.querySelectorAll("#starRatingContainer span");

const searchInput = document.getElementById("searchInput");
const categoryBtns = document.querySelectorAll(".cat-btn");

const modalAddToCart = document.getElementById("modalAddCart");
const modalBuyNow = document.getElementById("modalBuyNow");

// Checkout Modal
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");
const checkoutProductImg = document.getElementById("checkoutProductImg");
const checkoutProductName = document.getElementById("checkoutProductName");
const checkoutProductPrice = document.getElementById("checkoutProductPrice");
const checkoutQty = document.getElementById("checkoutQty");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutDiscount = document.getElementById("checkoutDiscount");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutVoucher = document.getElementById("checkoutVoucher");
const checkoutMethod = document.getElementById("checkoutMethod");
const checkoutAddress = document.getElementById("checkoutAddress");
const confirmCheckout = document.getElementById("confirmCheckout");

// ----- Data Storage -----
let reviewsData = JSON.parse(localStorage.getItem("reviews")) || {};
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let selectedRating = 5;
let currentProduct = null;

// ----- Utility Functions -----
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Parse price safely
function getPrice(card) {
  let priceText = card.querySelector(".price")?.textContent.trim()
    || card.querySelectorAll("p")[1].textContent.trim();

  return parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;
}

// ====== FIXED: ALWAYS REFRESH CART BEFORE COUNTING ======
function updateCartCount() {
  cart = JSON.parse(localStorage.getItem("cart")) || []; // refresh global cart

  const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = total;
  });
}

// ----- Save Order -----
function placeOrder(product, qty = 1) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  const newOrder = {
    id: Date.now(),
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: qty,
    status: "Order Placed",
    date: new Date().toLocaleString()
  };

  orders.push(newOrder);
  saveToStorage("orders", orders);
}

// ----- Star Rating -----
function updateStars(rating) {
  stars.forEach(star => {
    star.classList.toggle("filled", parseInt(star.dataset.value) <= rating);
  });
}

// ----- Render Reviews -----
function renderReviews(productName) {
  const reviews = reviewsData[productName] || [];

  modalReviews.innerHTML = reviews.length
    ? reviews.map((r, i) =>
        `<p>${"⭐".repeat(r.rating)} - ${r.comment}
          <button class="delete-review" data-index="${i}">&times;</button>
        </p>`).join("")
    : `<p>No reviews yet.</p>`;

  modalReviews.querySelectorAll(".delete-review").forEach(btn => {
    btn.addEventListener("click", () => {
      reviewsData[productName].splice(btn.dataset.index, 1);
      saveToStorage("reviews", reviewsData);
      renderReviews(productName);
    });
  });
}

// ----- Product Modal -----
document.querySelectorAll(".product-card img").forEach(img => {
  img.addEventListener("click", e => {
    const card = e.target.closest(".product-card");
    const name = card.querySelector("h3").textContent;

    currentProduct = {
      name,
      desc: card.querySelector(".desc")?.textContent || "",
      extraDesc: card.dataset.extra || "",
      image: img.src,
      price: getPrice(card) // number for calculations
    };

    modalImg.src = currentProduct.image;
    modalTitle.textContent = name;

    document.getElementById("modalDescription").textContent = currentProduct.desc;
    document.getElementById("modalExtraDesc").innerHTML =
      currentProduct.extraDesc.replace(/\n/g, "<br>");

    selectedRating = 5;
    updateStars(selectedRating);

    renderReviews(name);

    modal.style.display = "flex";
  });
});

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

// ----- Submit Review -----
submitReview.addEventListener("click", () => {
  const product = modalTitle.textContent;
  const comment = reviewText.value.trim();
  if (!comment) return alert("Please write a comment!");

  reviewsData[product] = reviewsData[product] || [];
  reviewsData[product].push({ rating: selectedRating, comment });

  saveToStorage("reviews", reviewsData);

  reviewText.value = "";
  selectedRating = 5;
  updateStars(selectedRating);
  renderReviews(product);
});

// ----- Add to Cart -----
modalAddToCart.addEventListener("click", () => {
  if (!currentProduct) return;

  const formattedPrice = "₱" + Number(currentProduct.price).toLocaleString();

  const item = {
    name: currentProduct.name,
    price: formattedPrice,
    image: currentProduct.image,
    quantity: 1
  };

  let existing = cart.find(p => p.name === item.name);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push(item);
  }

  saveToStorage("cart", cart);
  updateCartCount();
});

// ----- BUY NOW → CHECKOUT -----
modalBuyNow.addEventListener("click", () => {
  if (!currentProduct) return;

  modal.style.display = "none";

  checkoutProductImg.src = currentProduct.image;
  checkoutProductName.textContent = currentProduct.name;
  checkoutProductPrice.textContent = currentProduct.price.toFixed(2);
  checkoutQty.value = 1;

  updateCheckoutPrices();
  checkoutModal.style.display = "flex";
});

// ----- Checkout Modal Close -----
closeCheckout.addEventListener("click", () => checkoutModal.style.display = "none");
window.addEventListener("click", e => { if (e.target === checkoutModal) checkoutModal.style.display = "none"; });

// ----- Update Checkout Prices -----
function updateCheckoutPrices() {
  let price = parseFloat(checkoutProductPrice.textContent) || 0;
  let qty = parseInt(checkoutQty.value) || 1;

  if (qty < 1) qty = checkoutQty.value = 1;

  const discount = parseFloat(checkoutVoucher.value) || 0;
  const subtotal = price * qty;
  const total = Math.max(subtotal - discount, 0);

  checkoutSubtotal.textContent = subtotal.toLocaleString('en-PH', { minimumFractionDigits:2 });
  checkoutDiscount.textContent = discount.toLocaleString('en-PH', { minimumFractionDigits:2 });
  checkoutTotal.textContent = total.toLocaleString('en-PH', { minimumFractionDigits:2 });
}

checkoutQty.addEventListener("input", updateCheckoutPrices);
checkoutVoucher.addEventListener("change", updateCheckoutPrices);

// ----- Confirm Checkout -----
confirmCheckout.addEventListener("click", () => {
  if (checkoutAddress.value.trim() === "") {
    return alert("Please enter your delivery address.");
  }

  let qty = parseInt(checkoutQty.value) || 1;
  placeOrder(currentProduct, qty);

  checkoutModal.style.display = "none";
  window.location.href = "account.html";
});

// ----- Search + Category Filter -----
function filterProducts() {
  const term = searchInput.value.toLowerCase();
  const activeCat = document.querySelector(".cat-btn.active")?.dataset.category || "all";

  document.querySelectorAll(".product-card").forEach(card => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    const desc = card.querySelector(".desc")?.textContent.toLowerCase() || "";
    const category = card.dataset.category;

    const matchSearch = name.includes(term) || desc.includes(term);
    const matchCat = activeCat === "all" || category === activeCat;

    card.style.display = matchSearch && matchCat ? "block" : "none";
  });
}

searchInput.addEventListener("input", filterProducts);
categoryBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    categoryBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filterProducts();
  });
});

// ----- Favorites -----
document.querySelectorAll(".favorite-icon i").forEach(icon => {
  const card = icon.closest(".product-card");
  const name = card.querySelector("h3").textContent;
  const image = card.querySelector("img").src;
  const price = "₱" + getPrice(card).toLocaleString();

  if (favorites.some(f => f.name === name)) {
    icon.classList.replace("bx-heart", "bxs-heart");
    icon.style.color = "red";
  }

  icon.addEventListener("click", () => {
    const isFav = favorites.some(f => f.name === name);

    if (isFav) {
      favorites = favorites.filter(f => f.name !== name);
      icon.classList.replace("bxs-heart", "bx-heart");
      icon.style.color = "";
    } else {
      favorites.push({ name, price, image });
      icon.classList.replace("bx-heart", "bxs-heart");
      icon.style.color = "red";
    }

    saveToStorage("favorites", favorites);
  });
});

// ----- Initialize -----
updateCartCount();
