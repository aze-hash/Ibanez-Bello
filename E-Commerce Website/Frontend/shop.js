// ======== SHOP.JS ========

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
const cartCountEl = document.getElementById("cartCount");
const modalAddToCart = document.getElementById("modalAddCart");
const modalBuyNow = document.getElementById("modalBuyNow");

// Checkout Modal
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");
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

// Append modal buttons to review section
document.querySelector(".add-review").append(modalAddToCart, modalBuyNow);

// ----- Data Storage -----
let reviewsData = JSON.parse(localStorage.getItem("reviews")) || {};
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedRating = 5;
let currentProduct = null;

// ----- Utilities -----
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getPrice(card) {
  return card.querySelector(".price")?.textContent.trim() ||
         card.querySelectorAll("p")[1].textContent.trim();
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = total;
  document.getElementById("modalCartCount").textContent = total;
}

function syncModalCartCount() {
  document.getElementById("modalCartCount").textContent = cartCountEl.textContent;
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
      image: img.src,
      price: getPrice(card)
    };

    modalImg.src = currentProduct.image;
    modalTitle.textContent = name;
    renderReviews(name);

    selectedRating = 5;
    updateStars(selectedRating);

    modal.style.display = "flex";
    syncModalCartCount();
  });
});

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if(e.target===modal) modal.style.display="none"; });

// ----- Star Click -----
stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = parseInt(star.dataset.value);
    updateStars(selectedRating);
  });
});

// ----- Submit Review -----
submitReview.addEventListener("click", () => {
  const product = modalTitle.textContent;
  const comment = reviewText.value.trim();
  if(!comment) return alert("Please write a comment!");

  reviewsData[product] = reviewsData[product] || [];
  reviewsData[product].push({ rating: selectedRating, comment });

  saveToStorage("reviews", reviewsData);

  reviewText.value = "";
  selectedRating = 5;
  updateStars(selectedRating);
  renderReviews(product);

  //alert("Review submitted!");
});

// ----- Add to Cart -----
modalAddToCart.addEventListener("click", () => {
  if(!currentProduct) return;

  const existing = cart.find(item => item.name === currentProduct.name);
  if(existing) existing.quantity++;
  else cart.push({ ...currentProduct, quantity: 1 });

  saveToStorage("cart", cart);
  updateCartCount();
});

// ----- Buy Now → Checkout Modal -----
modalBuyNow.addEventListener("click", () => {
  if(!currentProduct) return;

  // Add current product to cart for checkout (1 qty)
  saveToStorage("cart", [{ ...currentProduct, quantity: 1 }]);

  // Close review modal
  modal.style.display = "none";

  // Fill checkout modal
  checkoutProductName.textContent = currentProduct.name;
  checkoutProductPrice.textContent = currentProduct.price.replace("₱","");
  checkoutQty.value = 1;
  checkoutVoucher.value = 0;
  checkoutAddress.value = "";
  checkoutMethod.value = "cod";
  updateCheckoutPrices();

  checkoutModal.style.display = "flex";
});

// ----- Close Checkout -----
closeCheckout.addEventListener("click", () => checkoutModal.style.display="none");
window.addEventListener("click", e => { if(e.target===checkoutModal) checkoutModal.style.display="none"; });

// ----- Update Checkout Prices -----
function updateCheckoutPrices() {
  let price = parseFloat(checkoutProductPrice.textContent);
  let qty = parseInt(checkoutQty.value) || 1;
  if(qty < 1) qty = checkoutQty.value = 1;

  const discount = parseInt(checkoutVoucher.value) || 0;
  const subtotal = price * qty;
  const total = Math.max(subtotal - discount, 0);

  checkoutSubtotal.textContent = subtotal;
  checkoutDiscount.textContent = discount;
  checkoutTotal.textContent = total;
}

checkoutQty.addEventListener("input", updateCheckoutPrices);
checkoutVoucher.addEventListener("change", updateCheckoutPrices);

// ----- Confirm Checkout -----
confirmCheckout.addEventListener("click", () => {
  if(checkoutAddress.value.trim() === "") return alert("Please enter your delivery address.");

  alert(`Order placed successfully!\nPayment Method: ${checkoutMethod.value}`);
  checkoutModal.style.display = "none";
});

// ----- Search + Filter -----
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

  if(favorites.some(f => f.name===name)) {
    icon.classList.replace("bx-heart","bxs-heart");
    icon.style.color="red";
  }

  icon.addEventListener("click", () => {
    const price = getPrice(card);
    const image = card.querySelector("img").src;
    const isFav = favorites.some(f => f.name===name);

    if(isFav){
      favorites = favorites.filter(f=>f.name!==name);
      icon.classList.replace("bxs-heart","bx-heart");
      icon.style.color="";
    } else {
      favorites.push({name, price, image});
      icon.classList.replace("bx-heart","bxs-heart");
      icon.style.color="red";
    }
    saveToStorage("favorites", favorites);
  });
});

// ----- Initialize Cart Count -----
updateCartCount();
