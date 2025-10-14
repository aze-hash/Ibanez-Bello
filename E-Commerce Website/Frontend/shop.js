// ===== Review Popup Logic with Inputable Reviews & Delete =====
const modal = document.getElementById('reviewModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalReviews = document.getElementById('modalReviews');
const closeModal = document.getElementById('closeModal');
const reviewText = document.getElementById('reviewText');
const submitReview = document.getElementById('submitReview');
const stars = document.querySelectorAll('#starRatingContainer span');

let reviewsData = JSON.parse(localStorage.getItem('reviews')) || {};
let selectedRating = 5;

// ===== Functions =====
function updateStars(rating) {
  stars.forEach(star => {
    star.classList.toggle('filled', parseInt(star.dataset.value) <= rating);
  });
}

function renderReviews(productName) {
  const reviews = reviewsData[productName] || [];
  modalReviews.innerHTML = reviews.length
    ? reviews.map((r, index) => `
        <p>${'⭐'.repeat(r.rating)} - ${r.comment}
          <button class="delete-review" data-index="${index}">&times;</button>
        </p>`).join('')
    : `<p>No reviews yet.</p>`;

  // Add delete functionality
  document.querySelectorAll('.delete-review').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      reviewsData[productName].splice(idx, 1);
      localStorage.setItem('reviews', JSON.stringify(reviewsData));
      renderReviews(productName);
    });
  });
}

// ===== Event Listeners =====

// Open modal on product image click
document.querySelectorAll('.product-card img').forEach(img => {
  img.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    const name = card.querySelector('h3').textContent;
    const imageSrc = card.querySelector('img').src;

    modalImg.src = imageSrc;
    modalTitle.textContent = name;

    renderReviews(name);

    selectedRating = 5;
    updateStars(selectedRating);

    modal.style.display = 'flex';
  });
});

// Close modal
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });

// Clickable stars
stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.value);
    updateStars(selectedRating);
  });
});

// Submit review
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

// ===== Add to Cart =====
document.querySelectorAll('.add-cart').forEach(btn => {
  btn.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    const name = card.querySelector('h3').textContent;
    const price = card.querySelector('.price')?.textContent || card.querySelectorAll('p')[1].textContent;
    const image = card.querySelector('img').src;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) existingItem.quantity = (existingItem.quantity || 1) + 1;
    else cart.push({ name, price, image, quantity: 1 });

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} added to cart!`);
  });
});

// ===== Buy Now =====
document.querySelectorAll('.buy-now').forEach(btn => {
  btn.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    const name = card.querySelector('h3').textContent;
    const price = card.querySelector('.price')?.textContent || card.querySelectorAll('p')[1].textContent;
    const image = card.querySelector('img').src;

    localStorage.setItem('cart', JSON.stringify([{ name, price, image, quantity: 1 }]));
    alert(`Proceeding to checkout for: ${name}`);
    window.location.href = 'cart.html';
  });
});

// ===== Search Filter =====
document.getElementById('searchInput').addEventListener('input', function() {
  const term = this.value.toLowerCase();
  document.querySelectorAll('.product-card').forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    card.style.display = title.includes(term) ? 'block' : 'none';
  });
});

// ===== Category Filter =====
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const category = btn.dataset.category;
    document.querySelectorAll('.product-card').forEach(card => {
      card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
    });
  });
});

// ===== Favorites =====
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
document.querySelectorAll('.favorite-icon i').forEach(icon => {
  const card = icon.closest('.product-card');
  const name = card.querySelector('h3').textContent;

  if (favorites.some(f => f.name === name)) {
    icon.classList.replace('bx-heart', 'bxs-heart');
    icon.style.color = 'red';
  }

  icon.addEventListener('click', () => {
    const price = card.querySelector('.price')?.textContent || card.querySelectorAll('p')[1].textContent;
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
