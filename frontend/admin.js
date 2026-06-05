const API_BASE_URL = '/api';
const token = localStorage.getItem('restaurantAuthToken');
const role = localStorage.getItem('restaurantAuthRole');

const showNotification = (m,t='info')=>{const e=document.createElement('div');e.className=`toast ${t}`;e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.remove(),3000)};

let currentItems = [];

const displayAdminOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
  const container = document.getElementById('admin-orders');
  if (!res.ok) {
    container.innerHTML = '<p class="loading error">Unable to load orders.</p>';
    return;
  }
  const orders = await res.json();
  if (!orders.length) {
    container.innerHTML = '<p class="loading">No orders yet.</p>';
    return;
  }
  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <span>Order #${order._id.slice(-6)}</span>
        <span class="status-chip ${order.status}">${order.status}</span>
      </div>
      <p><strong>Customer:</strong> ${order.customerName} ${order.customerUsername ? `(${order.customerUsername})` : ''}</p>
      <p><strong>Total:</strong> ₦${order.totalAmount.toFixed(2)}</p>
      <p><strong>Placed:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <div class="order-items">
        ${order.items.map(item => `<div class="order-item"><span>${item.quantity}×</span><span>₦${item.price.toFixed(2)}</span></div>`).join('')}
      </div>
      <div class="order-actions">
        <select class="status-select" data-id="${order._id}">
          ${['pending','preparing','ready','completed','cancelled'].map(status => `<option value="${status}" ${order.status===status?'selected':''}>${status}</option>`).join('')}
        </select>
        <button class="update-status-btn" data-id="${order._id}">Update</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.update-status-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const select = container.querySelector(`.status-select[data-id="${id}"]`);
      const status = select.value;
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) return showNotification('Update failed','error');
      showNotification('Status updated','success');
      displayAdminOrders();
    });
  });
};

const fetchItems = async () => {
  const res = await fetch(`${API_BASE_URL}/menu`);
  const items = await res.json();
  currentItems = items;
  const container = document.getElementById('admin-items');
  container.innerHTML = items.map(it=>`
    <div class="menu-item">
      <img src="${it.image || 'https://via.placeholder.com/300x200'}" alt="${it.name}">
      <div class="menu-item-content">
        <h3>${it.name}</h3>
        <p class="category">${it.category}</p>
        <p>${it.description}</p>
        <div class="menu-item-footer">
          <span class="price">₦${(Number(it.price)||0).toFixed(2)}</span>
          <div>
            <button class="edit-btn" data-id="${it._id}">Edit</button>
            <button class="del-btn" data-id="${it._id}">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.del-btn').forEach(b=>b.addEventListener('click', async ()=>{
    if(!confirm('Delete item?')) return;
    const id=b.dataset.id;
    const res = await fetch(`${API_BASE_URL}/menu/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if(!res.ok) return showNotification('Delete failed','error');
    showNotification('Deleted','success');
    fetchItems();
  }));

  container.querySelectorAll('.edit-btn').forEach(b=>b.addEventListener('click', async ()=>{
    const id = b.dataset.id;
    const item = currentItems.find(x => x._id === id);
    if (!item) return showNotification('Item not found','error');

    const name = prompt('Name', item.name);
    if (name === null) return;
    const category = prompt('Category', item.category);
    if (category === null) return;
    const price = prompt('Price', item.price);
    if (price === null) return;
    const image = prompt('Image URL', item.image || '');
    if (image === null) return;
    const description = prompt('Description', item.description || '');
    if (description === null) return;

    const body = { name: name.trim() || item.name, category: category.trim() || item.category, price: Number(price) || item.price, image: image.trim() || item.image, description: description.trim() || item.description };
    const res = await fetch(`${API_BASE_URL}/menu/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return showNotification('Edit failed','error');
    showNotification('Updated','success');
    fetchItems();
  }));
};

document.getElementById('add-item-form').addEventListener('submit', async e=>{
  e.preventDefault();
  const name=document.getElementById('mi-name').value.trim();
  const category=document.getElementById('mi-category').value.trim();
  const price=Number(document.getElementById('mi-price').value.trim())||0;
  const image=document.getElementById('mi-image').value.trim();
  const description=document.getElementById('mi-desc').value.trim();
  if(!name||!category) return showNotification('Provide name and category','error');
  const res = await fetch(`${API_BASE_URL}/menu`, {
    method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name, category, price, description, image })
  });
  if(!res.ok) return showNotification('Add failed (auth?)','error');
  showNotification('Item added','success');
  fetchItems();
});

window.addEventListener('DOMContentLoaded', ()=>{
  if (role !== 'admin' || !token) {
    showNotification('Admin login required. Redirecting to sign in...','error');
    return setTimeout(()=>location.href='auth.html?admin=true',800);
  }
  fetchItems();
  displayAdminOrders();
});
