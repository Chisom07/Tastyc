const API_BASE_URL = 'http://localhost:5000/api';
let cart = JSON.parse(localStorage.getItem('restaurantCart') || '[]');
const authTokenKey = 'restaurantAuthToken';
const authUserKey = 'restaurantAuthUser';
const authRoleKey = 'restaurantAuthRole';

const foodImages = {
    appetizers: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=60',
    mains: 'https://images.unsplash.com/photo-1604908811234-1a1a88f38969?auto=format&fit=crop&w=700&q=60',
    desserts: 'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&w=700&q=60',
    beverages: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=60',
    default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=60'
};

const parsePrice = value => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (!value) return 0;
    const cleaned = String(value).replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getPrice = value => `₦${parsePrice(value).toFixed(2)}`;

const normalize = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const categorySynonyms = {
    mains: ['main', 'maincourse', 'maincourse', 'mains', 'maincourse', 'main course'],
    appetizers: ['appetizer', 'appetizers', 'starter', 'starters'],
    desserts: ['dessert', 'desserts', 'sweet'],
    beverages: ['beverage', 'beverages', 'drink', 'drinks']
};

const setActiveFilter = category => {
    const normSelected = normalize(category);
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', normalize(btn.dataset.category) === normSelected);
    });
    document.querySelectorAll('.menu-item').forEach(card => {
        const cardCat = normalize(card.dataset.category || '');
        if (normSelected === 'all') {
            card.style.display = 'block';
            return;
        }
        const synonyms = categorySynonyms[normSelected] || [normSelected];
        const synNorm = synonyms.map(normalize);
        const match = synNorm.some(s => cardCat.includes(s) || s.includes(cardCat));
        card.style.display = match ? 'block' : 'none';
    });
};

const renderMenuItem = item => {
    const category = (item.category || 'default').toLowerCase();
    const image = item.image ? item.image : (foodImages[category] || foodImages.default);
    return `
        <div class="menu-item" data-category="${category}">
            <img src="${image}" alt="${item.name}" loading="lazy">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p class="category">${item.category || 'Menu Item'}</p>
                <p>${item.description || 'Delicious choice.'}</p>
                <div class="menu-item-footer">
                    <span class="price">${getPrice(item.price)}</span>
                    <button class="add-to-cart-btn" data-id="${item._id}" data-name="${item.name}" data-price="${parsePrice(item.price)}">ADD TO CART</button>
                </div>
            </div>
        </div>`;
};

const updateCartUI = () => {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (!cart.length) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '₦0.00';
        return;
    }

    cartItems.innerHTML = cart.map(item => {
        const priceValue = Number(item.price);
        const safePrice = Number.isFinite(priceValue) ? priceValue : 0;
        const itemTotal = safePrice * item.quantity;
        return `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>${getPrice(safePrice)} x 
                        <input class="qty-input" type="number" min="1" value="${item.quantity}" data-id="${item.id}">
                    </p>
                </div>
                <div class="cart-item-actions">
                    <span class="cart-item-price">${getPrice(itemTotal)}</span>
                    <button class="remove-btn" data-id="${item.id}">Remove</button>
                </div>
            </div>`;
    }).join('');

    cartTotal.textContent = getPrice(cart.reduce((sum, item) => {
        const priceValue = Number(item.price);
        return sum + (Number.isFinite(priceValue) ? priceValue : 0) * item.quantity;
    }, 0));
};

const saveCart = () => localStorage.setItem('restaurantCart', JSON.stringify(cart));

const addToCart = (id, name, price) => {
    const existing = cart.find(item => item.id === id);
    const priceValue = Number(price);
    const safePrice = Number.isFinite(priceValue) ? priceValue : 0;
    if (existing) existing.quantity += 1;
    else cart.push({ id, name, price: safePrice, quantity: 1 });
    saveCart();
    updateCartUI();
    showNotification(`${name} added to cart!`, 'success');
};

const removeFromCart = id => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
};

const changeQuantity = (id, value) => {
    const qty = parseInt(value, 10);
    if (qty < 1) return removeFromCart(id);
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = qty;
        saveCart();
        updateCartUI();
    }
};

const showNotification = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
};

const loadMenuItems = async () => {
    const menuItems = document.getElementById('menu-items');
    menuItems.innerHTML = '<div class="loading">Loading menu items...</div>';
    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        if (!response.ok) throw new Error(response.statusText);
        const items = await response.json();
        menuItems.innerHTML = items.length ? items.map(renderMenuItem).join('') : '<p class="loading">No menu items available</p>';
        menuItems.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', () => addToCart(button.dataset.id, button.dataset.name, button.dataset.price));
        });
    } catch (error) {
        console.error(error);
        menuItems.innerHTML = '<p class="loading error">Error loading menu items. Make sure your backend is running.</p>';
    }
};

const handleOrderSubmit = async e => {
    e.preventDefault();
    if (!cart.length) return showNotification('Please add items to your cart.', 'error');

    const orderData = {
        customerName: document.getElementById('customer-name').value,
        customerPhone: document.getElementById('customer-phone').value,
        deliveryTime: document.getElementById('delivery-time').value,
        items: cart.map(item => ({ menuItemid: item.id, quantity: item.quantity, price: item.price })),
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        customerUsername: localStorage.getItem(authUserKey) || ''
    };

    const submitBtn = document.querySelector('.submit-btn');
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (!response.ok) throw new Error('Order failed');
        const result = await response.json();
        cart = [];
        saveCart();
        updateCartUI();
        document.getElementById('order-form-element').reset();
        showNotification(`Order placed! ID: ${result._id}`, 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error(error);
        showNotification(error.message || 'Error placing order.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
    }
};

const clearCart = () => {
    if (!cart.length) return;
    if (confirm('Clear your cart?')) {
        cart = [];
        saveCart();
        updateCartUI();
        showNotification('Cart cleared.', 'info');
    }
};

const setAuthMode = mode => {
    const tabs = document.querySelectorAll('.auth-tab');
    const title = document.getElementById('auth-title');
    const submit = document.querySelector('#auth-form .submit-btn');

    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
    if (title) title.textContent = mode === 'signup' ? 'Create Account' : 'Sign In';
    if (submit) {
        submit.textContent = mode === 'signup' ? 'Create Account' : 'Continue';
    }
};

const displayAuthStatus = () => {
    const status = document.getElementById('auth-status');
    if (!status) return;

    const username = localStorage.getItem(authUserKey);
    const role = localStorage.getItem(authRoleKey);
    if (!username) {
        status.textContent = 'Not signed in';
        return;
    }

    status.innerHTML = `Signed in as <strong>${username}</strong> (${role}) <button id="logout-btn" class="clear-cart-btn">Logout</button>`;
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
};

const handleLogout = async () => {
    const token = localStorage.getItem(authTokenKey);
    if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
    }
    localStorage.removeItem(authTokenKey);
    localStorage.removeItem(authUserKey);
    localStorage.removeItem(authRoleKey);
    displayAuthStatus();
    showNotification('Logged out successfully.', 'success');
};

const handleAuthSubmit = async event => {
    event.preventDefault();
    const mode = document.querySelector('.auth-tab.active')?.dataset.mode || 'login';
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!username || !password) {
        showNotification('Please enter username and password.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/${mode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : { message: await response.text() };
        if (!response.ok) {
            throw new Error(data.message || 'Auth failed');
        }

        if (mode === 'login') {
            localStorage.setItem(authTokenKey, data.token);
            localStorage.setItem(authUserKey, data.username);
            localStorage.setItem(authRoleKey, data.role || 'user');
            displayAuthStatus();
            showNotification('Login successful', 'success');
        } else {
            setAuthMode('login');
            showNotification('Account created. Please sign in.', 'success');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
};

const updateAdminNavLink = () => {
    const adminLink = document.getElementById('admin-nav-link');
    if (!adminLink) return;
    const role = localStorage.getItem(authRoleKey);
    adminLink.href = role === 'admin' ? 'admin.html' : 'auth.html?admin=true';
};

window.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    updateCartUI();
    displayAuthStatus();
    updateAdminNavLink();

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', event => {
            setActiveFilter(event.currentTarget.dataset.category);
        });
    });

    document.querySelectorAll('.auth-tab').forEach(button => {
        button.addEventListener('click', () => setAuthMode(button.dataset.mode));
    });
    document.getElementById('auth-form')?.addEventListener('submit', handleAuthSubmit);

    document.getElementById('order-form-element')?.addEventListener('submit', handleOrderSubmit);
    document.getElementById('cart-items').addEventListener('click', event => {
        if (event.target.matches('.remove-btn')) removeFromCart(event.target.dataset.id);
    });
    document.getElementById('cart-items').addEventListener('change', event => {
        if (event.target.matches('.qty-input')) changeQuantity(event.target.dataset.id, event.target.value);
    });
});
