// ======== SHOP.JS ========

// ----- DOM Elements -----
const modal = document.getElementById('reviewModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalReviews = document.getElementById('modalReviews');
const closeModal = document.getElementById('closeModal');
const reviewText = document.getElementById('reviewText');
const submitReview = document.getElementById('submitReview');
const stars = document.querySelectorAll('#starRatingContainer span');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.cat-btn');
const cartCountEl = document.getElementById("cartCount");

// Modal buttons
const modalAddToCart = document.createElement("button");
modalAddToCart.textContent = "Add to Cart";
modalAddToCart.className = "btn";
const modalBuyNow = document.createElement("button");
modalBuyNow.textContent = "Buy Now";
modalBuyNow.className = "btn";

// Append buttons to modal dynamically
const addReviewDiv = document.querySelector(".add-review");
addReviewDiv.appendChild(modalAddToCart);
addReviewDiv.appendChild(modalBuyNow);

let currentProduct = null; // Track product for modal actions

// ----- Utility -----
function getPrice(card) {
  const priceEl = card.querySelector(".price");
  return priceEl ? priceEl.textContent.trim() : card.querySelectorAll("p")[1].textContent.trim();
}

// ----- Reviews -----
let reviewsData = JSON.parse(localStorage.getItem('reviews')) || {};
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedRating = 5;

function updateStars(rating) {
  stars.forEach(star => {
    star.classList.toggle('filled', parseInt(star.dataset.value) <= rating);
  });
}

function renderReviews(productName) {
  const reviews = reviewsData[productName] || [];
  modalReviews.innerHTML = reviews.length
    ? reviews.map((r, idx) => `
        <p>${'⭐'.repeat(r.rating)} - ${r.comment}
          <button class="delete-review" data-index="${idx}">&times;</button>
        </p>`).join('')
    : `<p>No reviews yet.</p>`;

  document.querySelectorAll('.delete-review').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      reviewsData[productName].splice(idx, 1);
      localStorage.setItem('reviews', JSON.stringify(reviewsData));
      renderReviews(productName);
    });
  });
}

// ----- Open Modal on Product Click -----
document.querySelectorAll('.product-card img').forEach(img => {
  img.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    const name = card.querySelector('h3').textContent;
    const desc = card.querySelector(".desc")?.textContent || "";
    const imageSrc = card.querySelector('img').src;
    const price = getPrice(card);

    // Track current product for modal actions
    currentProduct = { name, desc, image: imageSrc, price };

    modalImg.src = imageSrc;
    modalTitle.textContent = name;
    renderReviews(name);
    selectedRating = 5;
    updateStars(selectedRating);
    modal.style.display = 'flex';
  });
});

// ----- Close Modal -----
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

// ----- Star Rating -----
stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.value);
    updateStars(selectedRating);
  });
});

// ----- Submit Review -----
submitReview.addEventListener('click', () => {
  const name = modalTitle.textContent;
  const comment = reviewText.value.trim();
  if (!comment) return alert("Please write a comment!");

  if (!reviewsData[name]) reviewsData[name] = [];
  reviewsData[name].push({ rating: selectedRating, comment });

  localStorage.setItem('reviews', JSON.stringify(reviewsData));
  renderReviews(name);

  reviewText.value = "";
  selectedRating = 5;
  updateStars(selectedRating);
  alert("Review submitted!");
});

// ----- Cart and Buy Now inside Modal -----
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCountEl.textContent = count;
}

modalAddToCart.addEventListener("click", () => {
  if (!currentProduct) return;

  const existing = cart.find(item => item.name === currentProduct.name);
  if (existing) existing.quantity++;
  else cart.push({ ...currentProduct, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${currentProduct.name} added to cart!`);
});

modalBuyNow.addEventListener("click", () => {
  if (!currentProduct) return;

  localStorage.setItem("cart", JSON.stringify([{ ...currentProduct, quantity: 1 }]));
  alert(`Proceeding to checkout for: ${currentProduct.name}`);
  window.location.href = 'cart.html';
});

// ----- Search + Category Filter -----
function filterProducts() {
  const term = searchInput.value.toLowerCase().trim();
  const activeCategory = document.querySelector(".cat-btn.active")?.dataset.category || "all";

  document.querySelectorAll(".product-card").forEach(card => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    const desc = card.querySelector(".desc")?.textContent.toLowerCase() || "";
    const category = card.dataset.category;

    const matchesSearch = name.includes(term) || desc.includes(term);
    const matchesCategory = activeCategory === "all" || category === activeCategory;

    card.style.display = matchesSearch && matchesCategory ? "block" : "none";
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
document.querySelectorAll('.favorite-icon i').forEach(icon => {
  const card = icon.closest('.product-card');
  const name = card.querySelector('h3').textContent;

  if (favorites.some(f => f.name === name)) {
    icon.classList.replace('bx-heart', 'bxs-heart');
    icon.style.color = 'red';
  }

  icon.addEventListener('click', () => {
    const price = getPrice(card);
    const image = card.querySelector('img').src;
    const existing = favorites.find(f => f.name === name);

    if (existing) {
      favorites = favorites.filter(f => f.name !== name);
      icon.classList.replace('bxs-heart', 'bx-heart');
      icon.style.color = '';
      alert(`${name} removed from favorites.`);
    } else {
      favorites.push({ name, price, image });
      icon.classList.replace('bx-heart', 'bxs-heart');
      icon.style.color = 'red';
      alert(`${name} added to favorites!`);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
  });
});

// Initialize cart count on load
updateCartCount();
