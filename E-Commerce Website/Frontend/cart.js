const cartContainer = document.querySelector('.cart-items');
const totalDisplay = document.getElementById('total');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

cart = cart.map(item => ({
  ...item,
  price: Number(item.price) || 0,
  quantity: item.quantity || 1
}));

function updateCartCount() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalCount);
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

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
      <input type="checkbox" class="item-checkbox" data-index="${index}" />
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
        <button class="remove-btn"><i class='bx bx-trash'></i> </button>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  totalDisplay.textContent = `Total: ${total.toLocaleString('en-PH', { style:'currency', currency:'PHP' })}`;
  updateCartCount();
}

cartContainer.addEventListener('click', e => {
  if (e.target.type === 'checkbox') return;

  const cartItem = e.target.closest('.cart-item');
  if (!cartItem) return;
  const index = Number(cartItem.dataset.index);

  if (e.target.classList.contains('increase')) {
    cart[index].quantity++;
  } else if (e.target.classList.contains('decrease')) {
    if (cart[index].quantity > 1) {
      cart[index].quantity--;
    }
  } else if (e.target.closest('.remove-btn')) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
});

cartContainer.addEventListener('change', e => {
  if (e.target.classList.contains('item-checkbox')) {
    const cartItem = e.target.closest('.cart-item');
    if (e.target.checked) {
      cartItem.classList.add('selected');
    } else {
      cartItem.classList.remove('selected');
    }
  }
});

const selectAllCheckbox = document.getElementById('selectAllCheckbox');

selectAllCheckbox.addEventListener('change', () => {
  const allCheckboxes = document.querySelectorAll('.item-checkbox');
  allCheckboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
    const cartItem = checkbox.closest('.cart-item');
    if (selectAllCheckbox.checked) {
      cartItem.classList.add('selected');
    } else {
      cartItem.classList.remove('selected');
    }
  });
});

const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutItems = document.getElementById('checkoutItems');
const checkoutSubtotal = document.getElementById('checkoutSubtotal');
const checkoutDiscount = document.getElementById('checkoutDiscount');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutVoucher = document.getElementById('checkoutVoucher');

document.querySelector('.checkout-btn').addEventListener('click', () => {
  const selectedItems = Array.from(document.querySelectorAll('.item-checkbox:checked'))
    .map(checkbox => cart[checkbox.dataset.index]);

  if (selectedItems.length === 0) {
    alert('Please select items to proceed to checkout!');
    return;
  }

  checkoutItems.innerHTML = '';
  let subtotal = 0;

  selectedItems.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const div = document.createElement('div');
    div.classList.add('checkout-item');
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="checkout-product-img">
      <div class="product-info">
        <p><strong>Product:</strong> ${item.name}</p>
        <p><strong>Price:</strong> ${item.price.toLocaleString('en-PH', { style:'currency', currency:'PHP' })}</p>
        <p><strong>Quantity:</strong> ${item.quantity}</p>
      </div>
    `;
    checkoutItems.appendChild(div);
  });

  checkoutSubtotal.textContent = subtotal.toLocaleString('en-PH', { style:'currency', currency:'PHP' });
  checkoutDiscount.textContent = '0.00';
  checkoutTotal.textContent = subtotal.toLocaleString('en-PH', { style:'currency', currency:'PHP' });

  checkoutModal.style.display = 'flex';
});

closeCheckout.addEventListener('click', () => {
  checkoutModal.style.display = 'none';
});

checkoutVoucher.addEventListener('change', () => {
  const selectedItems = Array.from(document.querySelectorAll('.item-checkbox:checked'))
    .map(checkbox => cart[checkbox.dataset.index]);

  const discount = Number(checkoutVoucher.value);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  checkoutDiscount.textContent = discount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }).replace('₱', '');
  checkoutTotal.textContent = (subtotal - discount).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
});

const checkoutMethod = document.getElementById('checkoutMethod');
const cardTypeContainer = document.getElementById('cardTypeContainer');

checkoutMethod.addEventListener('change', () => {
  if (checkoutMethod.value === 'card') {
    cardTypeContainer.style.display = 'block';
  } else {
    cardTypeContainer.style.display = 'none';
  }
});

const checkoutPhone = document.getElementById('checkoutPhone');
const cardType = document.getElementById('cardType');

document.getElementById('confirmCheckout').addEventListener('click', () => {
  const phoneNumber = checkoutPhone.value.trim();
  const selectedCardType = checkoutMethod.value === 'card' ? cardType.value : null;

  if (!phoneNumber) {
    alert('Please enter your phone number.');
    return;
  }

  const selectedItems = Array.from(document.querySelectorAll('.item-checkbox:checked'))
    .map(checkbox => parseInt(checkbox.dataset.index));

  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  selectedItems.forEach(index => {
    const item = cart[index];
    orders.push({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      date: new Date().toLocaleString(),
      status: 'Order Placed'
    });
  });

  // Remove placed items from the cart
  cart = cart.filter((_, index) => !selectedItems.includes(index));
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('orders', JSON.stringify(orders));

  alert('Order placed successfully!');
  checkoutModal.style.display = 'none';
  window.location.href = 'account.html';

  renderCart(); // Re-render the cart to reflect changes
});

renderCart();
