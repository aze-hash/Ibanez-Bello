// ======== CART LOGIC ========
const cartContainer = document.querySelector('.cart-items');
const totalDisplay = document.getElementById('total');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Ensure numeric price and quantity
cart = cart.map(item => ({
  ...item,
  price: Number(item.price) || 0,
  quantity: item.quantity || 1
}));

// Update header cart count
function updateCartCount() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalCount);
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Render cart items
function renderCart() {
  cartContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p class='empty-cart'>Your cart is empty.</p>";
    totalDisplay.textContent = "Total: ₱0.00";
    updateCartCount();
    return;
  }

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.dataset.index = index;
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-info">
        <h4>${item.name}</h4>
        <p class="price">Price: ${item.price.toLocaleString('en-PH', { style:'currency', currency:'PHP' })}</p>
        <div class="quantity-controls">
          <button class="qty-btn decrease">−</button>
          <span class="quantity">${item.quantity}</span>
          <button class="qty-btn increase">+</button>
        </div>
        <p class="subtotal">Subtotal: ${subtotal.toLocaleString('en-PH', { style:'currency', currency:'PHP' })}</p>
        <button class="remove-btn"><i class='bx bx-trash'></i> Remove</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  totalDisplay.textContent = `Total: ${total.toLocaleString('en-PH', { style:'currency', currency:'PHP' })}`;
  updateCartCount();
}

// Handle increase / decrease / remove
cartContainer.addEventListener('click', e => {
  const cartItem = e.target.closest('.cart-item');
  if (!cartItem) return;
  const index = Number(cartItem.dataset.index);

  if (e.target.classList.contains('increase')) {
    cart[index].quantity++;
  } else if (e.target.classList.contains('decrease')) {
    if (cart[index].quantity > 1) cart[index].quantity--;
    else cart.splice(index, 1);
  } else if (e.target.closest('.remove-btn')) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
});

// ======== CHECKOUT MODAL LOGIC ========
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutItems = document.getElementById('checkoutItems');
const checkoutSubtotal = document.getElementById('checkoutSubtotal');
const checkoutDiscount = document.getElementById('checkoutDiscount');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutVoucher = document.getElementById('checkoutVoucher');
const checkoutProductImg = document.getElementById('checkoutProductImg');
const checkoutProductName = document.getElementById('checkoutProductName');
const checkoutProductPrice = document.getElementById('checkoutProductPrice');
const checkoutQty = document.getElementById('checkoutQty');

// Open checkout modal on button click
document.querySelector('.checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Populate modal with first product for preview
  const firstItem = cart[0];
  checkoutProductImg.src = firstItem.image;
  checkoutProductName.textContent = firstItem.name;
  checkoutProductPrice.textContent = firstItem.price.toLocaleString('en-PH', { style:'currency', currency:'PHP' });
  checkoutQty.value = firstItem.quantity;

  // Populate modal with all items for summary
  checkoutItems.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const div = document.createElement('div');
    div.classList.add('checkout-item');
    div.innerHTML = `<p><strong>${item.name}</strong> x ${item.quantity} - ${itemSubtotal.toLocaleString('en-PH', { style:'currency', currency:'PHP' })}</p>`;
    checkoutItems.appendChild(div);
  });

  checkoutSubtotal.textContent = subtotal.toLocaleString('en-PH', { style:'currency', currency:'PHP' });
  checkoutDiscount.textContent = '0.00';
  checkoutTotal.textContent = subtotal.toLocaleString('en-PH', { style:'currency', currency:'PHP' });

  checkoutModal.style.display = 'flex'; // show modal
});

// Close modal
closeCheckout.addEventListener('click', () => {
  checkoutModal.style.display = 'none';
});

// Update totals when voucher changes
checkoutVoucher.addEventListener('change', () => {
  const discount = Number(checkoutVoucher.value);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  checkoutDiscount.textContent = discount.toLocaleString('en-PH', { style:'currency', currency:'PHP' });
  checkoutTotal.textContent = (subtotal - discount).toLocaleString('en-PH', { style:'currency', currency:'PHP' });
});

// Initial render
renderCart();
