const API_BASE_URL = 'http://localhost:5000/api';
const authTokenKey = 'restaurantAuthToken';
const authUserKey = 'restaurantAuthUser';
const authRoleKey = 'restaurantAuthRole';

const showNotification = (msg, type='info') => {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 3000);
};

const setAuthMode = mode => {
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
  document.getElementById('auth-title').textContent = mode === 'signup' ? 'Create Account' : 'Sign In';
  document.querySelector('#auth-form .submit-btn').dataset.mode = mode;
};

const displayAuthStatus = () => {
  const username = localStorage.getItem(authUserKey);
  const status = document.getElementById('auth-status');
  status.textContent = username ? `Signed in as ${username}` : 'Not signed in';
};

const adminRedirect = new URLSearchParams(window.location.search).get('admin') === 'true';

const displayOrders = async () => {
  const username = localStorage.getItem(authUserKey);
  const token = localStorage.getItem(authTokenKey);
  const section = document.getElementById('order-history-section');
  const list = document.getElementById('order-history');
  if (!username || !token) {
    section.style.display = 'none';
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/orders/customer/${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Unable to load orders');
    const orders = await res.json();
    section.style.display = 'block';
    if (!orders.length) {
      list.innerHTML = '<p class="loading">You have no orders yet.</p>';
      return;
    }
    list.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <span>Order #${order._id.slice(-6)}</span>
          <span class="status-chip ${order.status}">${order.status}</span>
        </div>
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Total:</strong> ₦${order.totalAmount.toFixed(2)}</p>
        <p><strong>Placed:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <div class="order-items">
          ${order.items.map(item => `<div class="order-item"><span>${item.quantity}×</span><span>₦${item.price.toFixed(2)}</span></div>`).join('')}
        </div>
      </div>
    `).join('');
  } catch (err) {
    section.style.display = 'block';
    list.innerHTML = `<p class="loading error">${err.message}</p>`;
  }
};

const handleAuth = async e => {
  e.preventDefault();
  const mode = document.querySelector('.auth-tab.active').dataset.mode;
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value.trim();
  if (!username || !password) return showNotification('Enter username and password','error');

  try {
    const res = await fetch(`${API_BASE_URL}/auth/${mode}`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });

    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) return showNotification(body.message || body || 'Auth failed','error');

    if (mode === 'login') {
      localStorage.setItem(authTokenKey, body.token);
      localStorage.setItem(authUserKey, body.username);
      localStorage.setItem(authRoleKey, body.role || 'user');
      displayAuthStatus();
      showNotification('Login successful','success');
      setTimeout(async () => {
        if (body.role === 'admin' || adminRedirect) location.href = 'admin.html';
        else {
          await displayOrders();
        }
      }, 600);
    } else {
      showNotification('Account created. Please sign in.','success');
      setAuthMode('login');
    }
  } catch(err){
    showNotification(err.message || 'Network error','error');
  }
};

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.auth-tab').forEach(btn=>btn.addEventListener('click', ()=>setAuthMode(btn.dataset.mode)));
  document.getElementById('auth-form').addEventListener('submit', handleAuth);
  displayAuthStatus();
  displayOrders();
});
