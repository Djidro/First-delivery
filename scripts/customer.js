// Customer Module
class CustomerManager {
    constructor() {
        this.currentUser = null;
        this.restaurants = this.getSampleRestaurants();
        this.orders = [];
        this.cart = [];
        this.initializeEventListeners();
    }

    initialize() {
        this.currentUser = JSON.parse(localStorage.getItem('quickbite_current_user'));
        this.loadUserData();
        this.showRestaurants();
        this.updateCartCount();
        
        // Set customer name in header
        document.getElementById('customer-name').textContent = this.currentUser.name;
        
        // Add logout listener
        document.getElementById('customer-logout').addEventListener('click', () => {
            authManager.logout();
        });
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Back buttons
        document.getElementById('back-to-restaurants').addEventListener('click', () => {
            this.switchSection('restaurants');
        });

        document.getElementById('back-to-orders').addEventListener('click', () => {
            this.switchSection('orders');
        });

        // Checkout
        document.getElementById('checkout-btn').addEventListener('click', () => {
            this.handleCheckout();
        });

        // Restaurant search
        document.getElementById('restaurant-search').addEventListener('input', (e) => {
            this.filterRestaurants(e.target.value);
        });
    }

    switchSection(section) {
        // Update active nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });

        // Update active sections
        document.querySelectorAll('.dashboard-section').forEach(sectionEl => {
            sectionEl.classList.toggle('active', sectionEl.id === `${section}-section`);
        });

        // Load section data
        if (section === 'restaurants') {
            this.showRestaurants();
        } else if (section === 'cart') {
            this.showCart();
        } else if (section === 'orders') {
            this.showOrders();
        }
    }

    getSampleRestaurants() {
        return [
            {
                id: '1',
                name: 'Pizza Palace',
                cuisine: 'Italian',
                rating: 4.5,
                deliveryTime: '25-35 min',
                image: '🍕',
                menu: [
                    { id: '1', name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce and mozzarella', price: 12.99, category: 'Pizza' },
                    { id: '2', name: 'Pepperoni Pizza', description: 'Pizza with pepperoni and cheese', price: 14.99, category: 'Pizza' },
                    { id: '3', name: 'Garlic Bread', description: 'Freshly baked garlic bread', price: 4.99, category: 'Sides' },
                    { id: '4', name: 'Caesar Salad', description: 'Fresh salad with Caesar dressing', price: 8.99, category: 'Salads' }
                ]
            },
            {
                id: '2',
                name: 'Burger Barn',
                cuisine: 'American',
                rating: 4.2,
                deliveryTime: '20-30 min',
                image: '🍔',
                menu: [
                    { id: '5', name: 'Classic Burger', description: 'Beef burger with lettuce and tomato', price: 9.99, category: 'Burgers' },
                    { id: '6', name: 'Cheeseburger', description: 'Burger with cheese and special sauce', price: 10.99, category: 'Burgers' },
                    { id: '7', name: 'Chicken Burger', description: 'Grilled chicken burger with fries', price: 11.99, category: 'Burgers' },
                    { id: '8', name: 'French Fries', description: 'Crispy golden fries', price: 3.99, category: 'Sides' }
                ]
            },
            {
                id: '3',
                name: 'Sushi Spot',
                cuisine: 'Japanese',
                rating: 4.7,
                deliveryTime: '30-40 min',
                image: '🍣',
                menu: [
                    { id: '9', name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.99, category: 'Sushi' },
                    { id: '10', name: 'Salmon Nigiri', description: 'Fresh salmon on rice', price: 6.99, category: 'Sushi' },
                    { id: '11', name: 'Miso Soup', description: 'Traditional Japanese soup', price: 2.99, category: 'Soups' },
                    { id: '12', name: 'Edamame', description: 'Steamed soybeans with salt', price: 4.99, category: 'Appetizers' }
                ]
            }
        ];
    }

    showRestaurants() {
        const container = document.getElementById('restaurants-list');
        container.innerHTML = '';

        this.restaurants.forEach(restaurant => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <div class="card-title">${restaurant.image} ${restaurant.name}</div>
                        <div class="card-subtitle">${restaurant.cuisine} • ${restaurant.deliveryTime}</div>
                        <div class="card-subtitle">⭐ ${restaurant.rating}</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-primary view-menu-btn" data-restaurant-id="${restaurant.id}">
                        View Menu
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners to view menu buttons
        document.querySelectorAll('.view-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const restaurantId = e.target.dataset.restaurantId;
                this.showMenu(restaurantId);
            });
        });
    }

    filterRestaurants(searchTerm) {
        const filtered = this.restaurants.filter(restaurant => 
            restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const container = document.getElementById('restaurants-list');
        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = '<p class="no-results">No restaurants found matching your search.</p>';
            return;
        }

        filtered.forEach(restaurant => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <div class="card-title">${restaurant.image} ${restaurant.name}</div>
                        <div class="card-subtitle">${restaurant.cuisine} • ${restaurant.deliveryTime}</div>
                        <div class="card-subtitle">⭐ ${restaurant.rating}</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-primary view-menu-btn" data-restaurant-id="${restaurant.id}">
                        View Menu
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        // Re-add event listeners
        document.querySelectorAll('.view-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const restaurantId = e.target.dataset.restaurantId;
                this.showMenu(restaurantId);
            });
        });
    }

    showMenu(restaurantId) {
        const restaurant = this.restaurants.find(r => r.id === restaurantId);
        if (!restaurant) return;

        document.getElementById('restaurant-menu-name').textContent = `${restaurant.image} ${restaurant.name} Menu`;
        
        const container = document.getElementById('menu-items');
        container.innerHTML = '';

        // Group menu items by category
        const categories = {};
        restaurant.menu.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        // Create category sections
        Object.keys(categories).forEach(category => {
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            categoryHeader.style.margin = '20px 0 10px 0';
            categoryHeader.style.color = '#495057';
            container.appendChild(categoryHeader);

            categories[category].forEach(item => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="card-header">
                        <div style="flex: 1;">
                            <div class="card-title">${item.name}</div>
                            <div class="card-subtitle">${item.description}</div>
                            <div class="card-price">$${item.price.toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-primary add-to-cart-btn" data-item='${JSON.stringify(item)}' data-restaurant='${JSON.stringify({id: restaurant.id, name: restaurant.name})}'>
                            Add to Cart
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        });

        this.switchSection('menu');
        
        // Add event listeners to add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = JSON.parse(e.target.dataset.item);
                const restaurant = JSON.parse(e.target.dataset.restaurant);
                this.addToCart(item, restaurant);
            });
        });
    }

    addToCart(item, restaurant) {
        const cartItem = {
            ...item,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            quantity: 1
        };

        // Check if item already exists in cart
        const existingItem = this.cart.find(ci => 
            ci.id === item.id && ci.restaurantId === restaurant.id
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(cartItem);
        }

        this.updateCartCount();
        this.saveUserData();
        authManager.showMessage(`${item.name} added to cart!`, 'success');
    }

    showCart() {
        const container = document.getElementById('cart-items');
        const subtotalEl = document.getElementById('cart-subtotal');
        const totalEl = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');

        container.innerHTML = '';

        if (this.cart.length === 0) {
            container.innerHTML = '<p class="no-items">Your cart is empty</p>';
            subtotalEl.textContent = '$0.00';
            totalEl.textContent = '$2.99';
            checkoutBtn.disabled = true;
            return;
        }

        let subtotal = 0;

        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-restaurant">${item.restaurantName}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-index="${index}">+</button>
                    </div>
                    <div class="item-total">$${itemTotal.toFixed(2)}</div>
                    <button class="btn-secondary remove-btn" data-index="${index}">Remove</button>
                </div>
            `;
            container.appendChild(itemEl);
        });

        const deliveryFee = 2.99;
        const total = subtotal + deliveryFee;

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
        checkoutBtn.disabled = false;

        // Add event listeners
        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.updateQuantity(index, -1);
            });
        });

        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.updateQuantity(index, 1);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeFromCart(index);
            });
        });
    }

    updateQuantity(index, change) {
        this.cart[index].quantity += change;

        if (this.cart[index].quantity <= 0) {
            this.cart.splice(index, 1);
        }

        this.updateCartCount();
        this.showCart();
        this.saveUserData();
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateCartCount();
        this.showCart();
        this.saveUserData();
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cart-count').textContent = count;
    }

    handleCheckout() {
        if (this.cart.length === 0) return;

        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const order = {
            id: authManager.generateId(),
            items: [...this.cart],
            total: this.calculateTotal(),
            paymentMethod,
            status: 'pending',
            createdAt: new Date().toISOString(),
            restaurantId: this.cart[0].restaurantId,
            restaurantName: this.cart[0].restaurantName
        };

        this.orders.unshift(order);
        this.cart = [];
        
        this.updateCartCount();
        this.saveUserData();
        
        this.switchSection('orders');
        authManager.showMessage('Order placed successfully!', 'success');
        
        // Simulate restaurant acceptance
        setTimeout(() => {
            this.updateOrderStatus(order.id, 'preparing');
        }, 3000);
    }

    calculateTotal() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return subtotal + 2.99; // Delivery fee
    }

    showOrders() {
        const container = document.getElementById('orders-list');
        container.innerHTML = '';

        if (this.orders.length === 0) {
            container.innerHTML = '<p class="no-orders">You have no orders yet</p>';
            return;
        }

        this.orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <div style="flex: 1;">
                        <div class="card-title">Order #${order.id.slice(-6)}</div>
                        <div class="card-subtitle">${order.restaurantName}</div>
                        <div class="card-subtitle">${new Date(order.createdAt).toLocaleDateString()}</div>
                        <div class="status-badge status-${order.status}">${order.status}</div>
                    </div>
                    <div class="card-price">$${order.total.toFixed(2)}</div>
                </div>
                <div class="card-actions">
                    <button class="btn-primary track-order-btn" data-order-id="${order.id}">
                        Track Order
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners to track order buttons
        document.querySelectorAll('.track-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.showOrderTracking(orderId);
            });
        });
    }

    showOrderTracking(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const container = document.getElementById('order-details');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div style="flex: 1;">
                        <div class="card-title">Order #${order.id.slice(-6)}</div>
                        <div class="card-subtitle">${order.restaurantName}</div>
                        <div class="card-subtitle">Placed on ${new Date(order.createdAt).toLocaleString()}</div>
                        <div class="status-badge status-${order.status}">${order.status}</div>
                    </div>
                    <div class="card-price">$${order.total.toFixed(2)}</div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.quantity}x ${item.name}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Update tracking steps based on order status
        this.updateTrackingSteps(order.status);
        
        this.switchSection('tracking');
    }

    updateTrackingSteps(status) {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => step.classList.remove('active'));

        if (status === 'pending') {
            steps[0].classList.add('active');
        } else if (status === 'preparing') {
            steps[0].classList.add('active');
            steps[1].classList.add('active');
        } else if (status === 'ready') {
            steps[0].classList.add('active');
            steps[1].classList.add('active');
            steps[2].classList.add('active');
        } else if (status === 'delivered') {
            steps.forEach(step => step.classList.add('active'));
        }
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            this.saveUserData();
            
            // If we're currently tracking this order, update the UI
            if (document.getElementById('tracking-section').classList.contains('active')) {
                const currentOrderId = this.orders.find(o => 
                    document.getElementById('order-details').textContent.includes(o.id.slice(-6))
                )?.id;
                
                if (currentOrderId === orderId) {
                    this.showOrderTracking(orderId);
                }
            }
            
            // Update orders list if visible
            if (document.getElementById('orders-section').classList.contains('active')) {
                this.showOrders();
            }
            
            authManager.showMessage(`Order status updated: ${status}`, 'success');
        }
    }

    loadUserData() {
        const savedUser = this.users.find(u => u.id === this.currentUser.id);
        if (savedUser) {
            this.cart = savedUser.cart || [];
            this.orders = savedUser.orders || [];
        }
    }

    saveUserData() {
        const users = JSON.parse(localStorage.getItem('quickbite_users')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].cart = this.cart;
            users[userIndex].orders = this.orders;
            localStorage.setItem('quickbite_users', JSON.stringify(users));
        }
    }

    get users() {
        return JSON.parse(localStorage.getItem('quickbite_users')) || [];
    }
}

// Initialize customer manager
const customerManager = new CustomerManager();
