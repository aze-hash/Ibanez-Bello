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
  });
});

// ------------------ Load Orders ------------------
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
        <span class="order-status">${order.status || ''}</span>
      </div>
      <button class="cancel-order" data-index="${index}">Cancel Order</button>
    </div>
  `).join("");

  // ------------------ Cancel Order Modal ------------------
  const cancelModal = document.getElementById("cancelModal");
  const closeCancelModal = document.getElementById("closeCancelModal");
  const confirmCancelBtn = document.getElementById("confirmCancel");
  const cancelOtherInput = document.getElementById("cancelOtherReason");
  let orderToCancelIndex = null;

  cancelModal.querySelectorAll('input[name="cancelReason"]').forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "Other") cancelOtherInput.style.display = "block";
      else cancelOtherInput.style.display = "none";
    });
  });

  ordersContainer.querySelectorAll(".cancel-order").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      orderToCancelIndex = parseInt(btn.dataset.index);
      cancelModal.style.display = "flex";
      cancelOtherInput.style.display = "none";
      cancelOtherInput.value = "";
      cancelModal.querySelectorAll('input[name="cancelReason"]').forEach(r => r.checked = false);
    });
  });

  confirmCancelBtn.addEventListener("click", () => {
    let selectedRadio = cancelModal.querySelector('input[name="cancelReason"]:checked');
    if (!selectedRadio) { alert("Please select a reason."); return; }
    let reason = selectedRadio.value;
    if (reason === "Other") {
      if (cancelOtherInput.value.trim() === "") { alert("Please specify the reason."); return; }
      reason = cancelOtherInput.value.trim();
    }
    // Remove the order completely
    orders.splice(orderToCancelIndex, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    cancelModal.style.display = "none";
    loadOrders();
  });

  closeCancelModal.addEventListener("click", () => { cancelModal.style.display = "none"; });
  window.addEventListener("click", (e) => { if (e.target === cancelModal) cancelModal.style.display = "none"; });

  // ------------------ Order Details ------------------
  const orderModal = document.getElementById("orderDetailsModal");
  const closeOrderModal = document.getElementById("closeOrderModal");
  ordersContainer.querySelectorAll(".order-item").forEach(item => {
    item.addEventListener("click", e => {
      if (e.target.classList.contains("cancel-order")) return;
      const order = orders[parseInt(item.dataset.index)];
      document.getElementById("orderDetailImg").src = order.image;
      document.getElementById("orderDetailName").textContent = order.name;
      document.getElementById("orderDetailPrice").textContent = parseFloat(order.price).toFixed(2);
      document.getElementById("orderDetailQty").textContent = order.quantity;
      document.getElementById("orderDetailDate").textContent = order.date;
      document.getElementById("orderDetailTotal").textContent = (parseFloat(order.price) * order.quantity).toFixed(2);
      orderModal.style.display = "flex";
    });
  });

  closeOrderModal.addEventListener("click", () => { orderModal.style.display = "none"; });
  window.addEventListener("click", e => { if (e.target === orderModal) orderModal.style.display = "none"; });
}

document.addEventListener("DOMContentLoaded", loadOrders);
