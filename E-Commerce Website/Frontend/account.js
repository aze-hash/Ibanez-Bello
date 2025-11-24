// ------------------ Edit Profile ------------------
const editBtn = document.querySelector('.edit-profile');
const modal = document.getElementById('editModal');
const closeBtn = document.getElementById('closeModal');
const saveBtn = document.getElementById('saveChanges');

editBtn.addEventListener('click', () => {
  document.getElementById('editName').value = document.getElementById('fullName').textContent;
  document.getElementById('editEmail').value = document.getElementById('email').textContent;
  document.getElementById('editPhone').value = document.getElementById('phone').textContent;
  document.getElementById('editAddress').value = document.getElementById('address').textContent;
  modal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

saveBtn.addEventListener('click', () => {
  document.getElementById('fullName').textContent = document.getElementById('editName').value;
  document.getElementById('username').textContent = document.getElementById('editName').value;
  document.getElementById('email').textContent = document.getElementById('editEmail').value;
  document.getElementById('userEmail').textContent = document.getElementById('editEmail').value;
  document.getElementById('phone').textContent = document.getElementById('editPhone').value;
  document.getElementById('address').textContent = document.getElementById('editAddress').value;
  modal.style.display = 'none';
});

// ------------------ Tabs ------------------
const tabs = document.querySelectorAll(".order-tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    contents.forEach(c => c.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");

    if (tab.dataset.tab === "orders") loadOrders();
    if (tab.dataset.tab === "cancelled") loadCancelledOrders();
  });
});

// ------------------ Load Active Orders ------------------
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const ordersContainer = document.getElementById("orders");

  if (orders.length === 0) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  ordersContainer.innerHTML = orders.map((order, index) => `
    <div class="order-item" data-index="${index}">
      <img src="${order.image}" class="order-img" />
      <div class="order-details">
        <h4>${order.name}</h4>
        <p>₱${order.price}</p>
      </div>
      <button class="cancel-order" data-index="${index}">Cancel Order</button>
    </div>
  `).join("");

  setupCancelButtons(orders, ordersContainer);
  setupOrderDetails(orders, ordersContainer);
}

// ------------------ Load Cancelled Orders (UPDATED) ------------------
function loadCancelledOrders() {
  const cancelledOrders = JSON.parse(localStorage.getItem("cancelledOrders")) || [];
  const cancelledContainer = document.getElementById("cancelled");

  if (cancelledOrders.length === 0) {
    cancelledContainer.innerHTML = "<p>No cancelled orders.</p>";
    return;
  }

  cancelledContainer.innerHTML = cancelledOrders.map((order, index) => `
    <div class="order-item cancelled" data-index="${index}">
      <img src="${order.image}" class="order-img" />
      <div class="order-details">
        <h4>${order.name}</h4>
        <p>₱${order.price}</p>
        <span class="order-status cancelled">Cancelled</span>
        <small>Reason: ${order.reason}</small>
      </div>

      <button class="remove-cancelled" data-index="${index}">Delete</button>
    </div>
  `).join("");

  setupRemoveCancelled();
}

// ------------------ Remove Cancelled Order (NEW) ------------------
function setupRemoveCancelled() {
  const cancelledOrders = JSON.parse(localStorage.getItem("cancelledOrders")) || [];
  const removeButtons = document.querySelectorAll(".remove-cancelled");

  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);

      cancelledOrders.splice(index, 1);
      localStorage.setItem("cancelledOrders", JSON.stringify(cancelledOrders));

      loadCancelledOrders();
    });
  });
}

// ------------------ Cancel Order Logic ------------------
function setupCancelButtons(orders, container) {
  const cancelModal = document.getElementById("cancelModal");
  const closeCancelModal = document.getElementById("closeCancelModal");
  const confirmCancelBtn = document.getElementById("confirmCancel");
  const cancelOtherInput = document.getElementById("cancelOtherReason");
  let orderToCancelIndex = null;

  cancelModal.querySelectorAll('input[name="cancelReason"]').forEach(radio => {
    radio.addEventListener("change", () => {
      cancelOtherInput.style.display = radio.value === "Other" ? "block" : "none";
    });
  });

  container.querySelectorAll(".cancel-order").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      orderToCancelIndex = parseInt(btn.dataset.index);
      cancelModal.style.display = "flex";
      cancelOtherInput.value = "";
      cancelModal.querySelectorAll('input[name="cancelReason"]').forEach(r => r.checked = false);
    });
  });

  confirmCancelBtn.addEventListener("click", () => {
    let selectedRadio = cancelModal.querySelector('input[name="cancelReason"]:checked');
    if (!selectedRadio) return alert("Please select a reason.");

    let reason = selectedRadio.value === "Other" ? cancelOtherInput.value.trim() : selectedRadio.value;
    if (!reason) return alert("Please specify the reason.");

    const cancelledOrder = orders[orderToCancelIndex];
    cancelledOrder.status = "Cancelled";
    cancelledOrder.reason = reason;

    let cancelledOrders = JSON.parse(localStorage.getItem("cancelledOrders")) || [];
    cancelledOrders.push(cancelledOrder);
    localStorage.setItem("cancelledOrders", JSON.stringify(cancelledOrders));

    orders.splice(orderToCancelIndex, 1);
    localStorage.setItem("orders", JSON.stringify(orders));

    cancelModal.style.display = "none";
    loadOrders();
  });

  closeCancelModal.addEventListener("click", () => { cancelModal.style.display = "none"; });
  window.addEventListener("click", e => { if (e.target === cancelModal) cancelModal.style.display = "none"; });
}

// ------------------ Order Details Modal ------------------
function setupOrderDetails(orders, container) {
  const orderModal = document.getElementById("orderDetailsModal");
  const closeOrderModal = document.getElementById("closeOrderModal");

  container.querySelectorAll(".order-item").forEach(item => {
    item.addEventListener("click", e => {
      if (e.target.classList.contains("cancel-order")) return;

      const order = orders[item.dataset.index];

      document.getElementById("orderDetailImg").src = order.image;
      document.getElementById("orderDetailName").textContent = order.name;
      document.getElementById("orderDetailPrice").textContent = parseFloat(order.price).toFixed(2);
      document.getElementById("orderDetailQty").textContent = order.quantity;
      document.getElementById("orderDetailDate").textContent = order.date;
      document.getElementById("orderDetailTotal").textContent =
        (parseFloat(order.price) * order.quantity).toFixed(2);

      orderModal.style.display = "flex";
    });
  });

  closeOrderModal.addEventListener("click", () => { orderModal.style.display = "none"; });
  window.addEventListener("click", e => { if (e.target === orderModal) orderModal.style.display = "none"; });
}

// ------------------ Cart Count ------------------
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = total;
  });
}

// ------------------ Initialize ------------------
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  loadCancelledOrders();
  updateCartCount();
});

// ------------------ Mobile Nav ------------------
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.shop-nav');
navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});
