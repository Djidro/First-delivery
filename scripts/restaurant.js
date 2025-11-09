// Restaurant Module
class RestaurantManager {
    constructor() {
        this.currentUser = null;
        this.orders = [];
        this.initializeEventListeners();
    }

    initialize() {
        this.currentUser = JSON.parse(localStorage.getItem('quickbite_current_user'));
        this.loadRestaurantData();
        this.showOrders();
        
        // Set restaurant name in header
        document.getElementById('restaurant-name-display').textContent = this.currentUser.restaurantName;
        
        // Add logout listener
        document.getElementById('restaurant-logout').addEventListener('click', () => {
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

        // Add menu item
        document.getElementById('add-menu-item').addEventListener('click', () => {
            this.showAddMenuItemModal();
        });

        // Sales period filter
        document.getElementById('sales-period').addEventListener('change', () => {
            this.updateSalesSummary();
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
        if (section === 'orders') {
            this.showOrders();
        } else if (section === 'menu') {
            this.showMenuManagement();
        } else if (section === 'sales') {
            this.updateSalesSummary();
        }
    }

    loadRestaurantData() {
        // Load orders from all customers that belong to this restaurant
        const allUsers = JSON.parse(localStorage.getItem('quickbite_users')) || [];
        this.orders = [];
        
        allUsers.forEach(user => {
            if (user.orders) {
                user.orders.forEach(order => {
                    if (order.restaurantId === this.currentUser.id) {
                        this.orders.push({
                            ...order,
                            customerName: user.name,
                            customerId: user.id
                        });
                    }
                });
            }
        });

        // Sort orders by creation date (newest first)
        this.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    showOrders() {
        const container = document.getElementById('restaurant-orders-list');
        container.innerHTML = '';

        const pendingOrders = this.orders.filter(order => 
            order.status === 'pending' || order.status === 'preparing'
        );

        if (pendingOrders.length === 0) {
            container.innerHTML = '<p class="no-orders">No pending orders</p>';
            return;
        }

        pendingOrders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <div style="flex: 1;">
                        <div class="card-title">Order #${order.id.slice(-6)}</div>
                        <div class="card-subtitle">Customer: ${order.customerName}</div>
                        <div class="card-subtitle">${new Date(order.createdAt).toLocaleString()}</div>
                        <div class="status-badge status-${order.status}">${order.status}</div>
                    </div>
                    <div class="card-price">$${order.total.toFixed(2)}</div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.quantity}x ${item.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="card-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn-primary accept-order-btn" data-order-id="${order.id}">
                            Accept Order
                        </button>
                        <button class="btn-secondary reject-order-btn" data-order-id="${order.id}">
                            Reject
                        </button>
                    ` : ''}
                    ${order.status === 'preparing' ? `
                        <button class="btn-primary ready-order-btn" data-order-id="${order.id}">
                            Mark as Ready
                        </button>
                    ` : ''}
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners
        document.querySelectorAll('.accept-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.updateOrderStatus(orderId, 'preparing');
            });
        });

        document.querySelectorAll('.reject-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.updateOrderStatus(orderId, 'cancelled');
            });
        });

        document.querySelectorAll('.ready-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.updateOrderStatus(orderId, 'ready');
            });
        });
    }

    showMenuManagement() {
        const container = document.getElementById('menu-management-list');
        container.innerHTML = '';

        if (!this.currentUser.menu || this.currentUser.menu.length === 0) {
            container.innerHTML = '<p class="no-items">No menu items added yet</p>';
            return;
        }

        this.currentUser.menu.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <div style="flex: 1;">
                        <div class="card-title">${item.name}</div>
                        <div class="card-subtitle">${item.description}</div>
                        <div class="card-subtitle">Category: ${item.category}</div>
                        <div class="card-price">$${item.price.toFixed(2)}</div>
                        <div class="availability ${item.available ? 'available' : 'unavailable'}">
                            ${item.available ? 'Available' : 'Unavailable'}
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-primary edit-item-btn" data-index="${index}">
                        Edit
                    </button>
                    <button class="btn-secondary toggle-availability-btn" data-index="${index}">
                        ${item.available ? 'Make Unavailable' : 'Make Available'}
                    </button>
                    <button class="btn-secondary delete-item-btn" data-index="${index}">
                        Delete
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners
        document.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.showEditMenuItemModal(index);
            });
        });

        document.querySelectorAll('.toggle-availability-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.toggleItemAvailability(index);
            });
        });

        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.deleteMenuItem(index);
            });
        });
    }

    showAddMenuItemModal() {
        const modal = document.getElementById('modal-overlay');
        const modalBody = document.querySelector('.modal-body');
        const modalTitle = document.getElementById('modal-title');

        modalTitle.textContent = 'Add Menu Item';
        modalBody.innerHTML = `
            <form id="add-menu-item-form">
                <div class="form-group">
                    <label for="item-name">Item Name</label>
                    <input type="text" id="item-name" required>
                </div>
                <div class="form-group">
                    <label for="item-description">Description</label>
                    <textarea id="item-description" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="item-price">Price ($)</label>
                    <input type="number" id="item-price" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="item-category">Category</label>
                    <input type="text" id="item-category" required>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="item-available" checked>
                        <span>Available for ordering</span>
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" id="cancel-add-item" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Add Item</button>
                </div>
            </form>
        `;

        modal.classList.remove('hidden');

        // Form submission
        document.getElementById('add-menu-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMenuItem();
        });

        // Cancel button
        document.getElementById('cancel-add-item').addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    showEditMenuItemModal(index) {
        const item = this.currentUser.menu[index];
        const modal = document.getElementById('modal-overlay');
        const modalBody = document.querySelector('.modal-body');
        const modalTitle = document.getElementById('modal-title');

        modalTitle.textContent = 'Edit Menu Item';
        modalBody.innerHTML = `
            <form id="edit-menu-item-form">
                <div class="form-group">
                    <label for="edit-item-name">Item Name</label>
                    <input type="text" id="edit-item-name" value="${item.name}" required>
                </div>
                <div class="form-group">
                    <label for="edit-item-description">Description</label>
                    <textarea id="edit-item-description" rows="3" required>${item.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-item-price">Price ($)</label>
                    <input type="number" id="edit-item-price" value="${item.price}" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="edit-item-category">Category</label>
                    <input type="text" id="edit-item-category" value="${item.category}" required>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-item-available" ${item.available ? 'checked' : ''}>
                        <span>Available for ordering</span>
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" id="cancel-edit-item" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Update Item</button>
                </div>
            </form>
        `;

        modal.classList.remove('hidden');

        // Form submission
        document.getElementById('edit-menu-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateMenuItem(index);
        });

        // Cancel button
        document.getElementById('cancel-edit-item').addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    addMenuItem() {
        const name = document.getElementById('item-name').value;
        const description = document.getElementById('item-description').value;
        const price = parseFloat(document.getElementById('item-price').value);
        const category = document.getElementById('item-category').value;
        const available = document.getElementById('item-available').checked;

        const newItem = {
            id: authManager.generateId(),
            name,
            description,
            price,
            category,
            available
        };

        if (!this.currentUser.menu) {
            this.currentUser.menu = [];
        }

        this.currentUser.menu.push(newItem);
        this.saveUserData();
        
        document.getElementById('modal-overlay').classList.add('hidden');
        this.showMenuManagement();
        authManager.showMessage('Menu item added successfully!', 'success');
    }

    updateMenuItem(index) {
        const name = document.getElementById('edit-item-name').value;
        const description = document.getElementById('edit-item-description').value;
        const price = parseFloat(document.getElementById('edit-item-price').value);
        const category = document.getElementById('edit-item-category').value;
        const available = document.getElementById('edit-item-available').checked;

        this.currentUser.menu[index] = {
            ...this.currentUser.menu[index],
            name,
            description,
            price,
            category,
            available
        };

        this.saveUserData();
        
        document.getElementById('modal-overlay').classList.add('hidden');
        this.showMenuManagement();
        authManager.showMessage('Menu item updated successfully!', 'success');
    }

    toggleItemAvailability(index) {
        this.currentUser.menu[index].available = !this.currentUser.menu[index].available;
        this.saveUserData();
        this.showMenuManagement();
        
        const status = this.currentUser.menu[index].available ? 'available' : 'unavailable';
        authManager.showMessage(`Item marked as ${status}`, 'success');
    }

    deleteMenuItem(index) {
        if (confirm('Are you sure you want to delete this menu item?')) {
            this.currentUser.menu.splice(index, 1);
            this.saveUserData();
            this.showMenuManagement();
            authManager.showMessage('Menu item deleted', 'success');
        }
    }

    updateOrderStatus(orderId, status) {
        // Update in restaurant's order list
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
        }

        // Update in customer's data
        const allUsers = JSON.parse(localStorage.getItem('quickbite_users')) || [];
        allUsers.forEach(user => {
            if (user.orders) {
                user.orders.forEach(order => {
                    if (order.id === orderId) {
                        order.status = status;
                    }
                });
            }
        });

        localStorage.setItem('quickbite_users', JSON.stringify(allUsers));

        // If order is marked as ready, create a delivery request
        if (status === 'ready') {
            this.createDeliveryRequest(order);
        }

        this.showOrders();
        authManager.showMessage(`Order ${status}`, 'success');
    }

    createDeliveryRequest(order) {
        // In a real app, this would be sent to a delivery service
        // For now, we'll just log it
        console.log('Delivery request created for order:', order.id);
        
        // Simulate driver assignment
        setTimeout(() => {
            // Update order status to delivered after some time
            this.updateOrderStatus(order.id, 'delivered');
        }, 10000);
    }

    updateSalesSummary() {
        const period = document.getElementById('sales-period').value;
        const now = new Date();
        let startDate;

        if (period === 'today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'week') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        }

        const filteredOrders = this.orders.filter(order => 
            new Date(order.createdAt) >= startDate
        );

        const totalOrders = filteredOrders.length;
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('avg-order-value').textContent = `$${avgOrderValue.toFixed(2)}`;

        // Update recent orders list
        const recentOrdersList = document.getElementById('recent-orders-list');
        recentOrdersList.innerHTML = '';

        const recentOrders = filteredOrders.slice(0, 5);
        recentOrders.forEach(order => {
            const orderEl = document.createElement('div');
            orderEl.className = 'recent-order';
            orderEl.innerHTML = `
                <div class="recent-order-info">
                    <div>Order #${order.id.slice(-6)}</div>
                    <div>${order.customerName}</div>
                    <div>${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="recent-order-amount">$${order.total.toFixed(2)}</div>
            `;
            recentOrdersList.appendChild(orderEl);
        });
    }

    saveUserData() {
        const users = JSON.parse(localStorage.getItem('quickbite_users')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('quickbite_users', JSON.stringify(users));
        }
    }
}

// Initialize restaurant manager
const restaurantManager = new RestaurantManager();
