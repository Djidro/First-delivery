// Driver Module
class DriverManager {
    constructor() {
        this.currentUser = null;
        this.availableDeliveries = [];
        this.activeDelivery = null;
        this.earningsHistory = [];
        this.initializeEventListeners();
    }

    initialize() {
        this.currentUser = JSON.parse(localStorage.getItem('quickbite_current_user'));
        this.loadDriverData();
        this.loadAvailableDeliveries();
        
        // Set driver name in header
        document.getElementById('driver-name-display').textContent = this.currentUser.name;
        
        // Add logout listener
        document.getElementById('driver-logout').addEventListener('click', () => {
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

        // Delivery actions
        document.getElementById('pickup-order').addEventListener('click', () => {
            this.markOrderPickedUp();
        });

        document.getElementById('deliver-order').addEventListener('click', () => {
            this.markOrderDelivered();
        });

        // Earnings period filter
        document.getElementById('earnings-period').addEventListener('change', () => {
            this.updateEarningsSummary();
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
        if (section === 'deliveries') {
            this.loadAvailableDeliveries();
        } else if (section === 'active') {
            this.showActiveDelivery();
        } else if (section === 'earnings') {
            this.updateEarningsSummary();
        }
    }

    loadDriverData() {
        // Load earnings history from driver data
        this.earningsHistory = this.currentUser.earningsHistory || [];
    }

    loadAvailableDeliveries() {
        // In a real app, this would come from a server
        // For demo, we'll create some sample deliveries
        this.availableDeliveries = [
            {
                id: 'delivery-1',
                orderId: 'order-1',
                restaurantName: 'Pizza Palace',
                customerName: 'John Doe',
                customerAddress: '123 Main St, Apt 4B',
                total: 25.97,
                deliveryFee: 3.99,
                distance: '1.2 miles',
                restaurantAddress: '456 Restaurant Row'
            },
            {
                id: 'delivery-2',
                orderId: 'order-2',
                restaurantName: 'Burger Barn',
                customerName: 'Jane Smith',
                customerAddress: '789 Oak Ave',
                total: 18.50,
                deliveryFee: 2.99,
                distance: '0.8 miles',
                restaurantAddress: '321 Food Court'
            }
        ];

        this.showAvailableDeliveries();
    }

    showAvailableDeliveries() {
        const container = document.getElementById('deliveries-list');
        container.innerHTML = '';

        if (this.availableDeliveries.length === 0) {
            container.innerHTML = '<p class="no-deliveries">No available deliveries at the moment</p>';
            return;
        }

        this.availableDeliveries.forEach(delivery => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <div style="flex: 1;">
                        <div class="card-title">Delivery to ${delivery.customerName}</div>
                        <div class="card-subtitle">From: ${delivery.restaurantName}</div>
                        <div class="card-subtitle">Distance: ${delivery.distance}</div>
                        <div class="card-subtitle">Address: ${delivery.customerAddress}</div>
                    </div>
                    <div class="card-price">$${delivery.deliveryFee.toFixed(2)}</div>
                </div>
                <div class="card-actions">
                    <button class="btn-primary accept-delivery-btn" data-delivery-id="${delivery.id}">
                        Accept Delivery
                    </button>
                    <button class="btn-secondary reject-delivery-btn" data-delivery-id="${delivery.id}">
                        Reject
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners
        document.querySelectorAll('.accept-delivery-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deliveryId = e.target.dataset.deliveryId;
                this.acceptDelivery(deliveryId);
            });
        });

        document.querySelectorAll('.reject-delivery-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deliveryId = e.target.dataset.deliveryId;
                this.rejectDelivery(deliveryId);
            });
        });
    }

    acceptDelivery(deliveryId) {
        const delivery = this.availableDeliveries.find(d => d.id === deliveryId);
        if (!delivery) return;

        this.activeDelivery = delivery;
        
        // Remove from available deliveries
        this.availableDeliveries = this.availableDeliveries.filter(d => d.id !== deliveryId);
        
        // Update order status to "on the way" in customer's data
        this.updateOrderStatus(delivery.orderId, 'on the way');
        
        this.switchSection('active');
        authManager.showMessage('Delivery accepted!', 'success');
    }

    rejectDelivery(deliveryId) {
        this.availableDeliveries = this.availableDeliveries.filter(d => d.id !== deliveryId);
        this.showAvailableDeliveries();
        authManager.showMessage('Delivery rejected', 'info');
    }

    showActiveDelivery() {
        const container = document.getElementById('active-delivery-details');
        const pickupBtn = document.getElementById('pickup-order');
        const deliverBtn = document.getElementById('deliver-order');

        if (!this.activeDelivery) {
            container.innerHTML = '<p class="no-active-delivery">No active delivery</p>';
            pickupBtn.disabled = true;
            deliverBtn.disabled = true;
            return;
        }

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div style="flex: 1;">
                        <div class="card-title">Active Delivery</div>
                        <div class="card-subtitle">To: ${this.activeDelivery.customerName}</div>
                        <div class="card-subtitle">From: ${this.activeDelivery.restaurantName}</div>
                        <div class="card-subtitle">Earnings: $${this.activeDelivery.deliveryFee.toFixed(2)}</div>
                    </div>
                </div>
                <div class="delivery-info">
                    <div class="info-section">
                        <h4>Restaurant Details</h4>
                        <p>${this.activeDelivery.restaurantName}</p>
                        <p>${this.activeDelivery.restaurantAddress}</p>
                    </div>
                    <div class="info-section">
                        <h4>Customer Details</h4>
                        <p>${this.activeDelivery.customerName}</p>
                        <p>${this.activeDelivery.customerAddress}</p>
                    </div>
                </div>
            </div>
        `;

        pickupBtn.disabled = false;
        deliverBtn.disabled = true;

        // Update customer location display
        document.getElementById('customer-location').textContent = this.activeDelivery.customerAddress;
    }

    markOrderPickedUp() {
        if (!this.activeDelivery) return;

        // Update order status to "picked up"
        this.updateOrderStatus(this.activeDelivery.orderId, 'picked up');
        
        // Enable deliver button
        document.getElementById('deliver-order').disabled = false;
        document.getElementById('pickup-order').disabled = true;
        
        authManager.showMessage('Order picked up!', 'success');
    }

    markOrderDelivered() {
        if (!this.activeDelivery) return;

        // Add to earnings
        const earningsRecord = {
            id: authManager.generateId(),
            deliveryId: this.activeDelivery.id,
            amount: this.activeDelivery.deliveryFee,
            date: new Date().toISOString(),
            customerName: this.activeDelivery.customerName,
            restaurantName: this.activeDelivery.restaurantName
        };

        this.earningsHistory.unshift(earningsRecord);
        
        // Update driver data
        this.currentUser.earningsHistory = this.earningsHistory;
        this.currentUser.completedDeliveries = (this.currentUser.completedDeliveries || 0) + 1;
        this.currentUser.earnings = (this.currentUser.earnings || 0) + this.activeDelivery.deliveryFee;
        
        this.saveUserData();

        // Update order status to "delivered"
        this.updateOrderStatus(this.activeDelivery.orderId, 'delivered');
        
        // Clear active delivery
        this.activeDelivery = null;
        
        this.switchSection('deliveries');
        authManager.showMessage('Delivery completed! Earnings added.', 'success');
    }

    updateOrderStatus(orderId, status) {
        // In a real app, this would update the order status on the server
        // For demo, we'll update it in all users' data
        const allUsers = JSON.parse(localStorage.getItem('quickbite_users')) || [];
        
        allUsers.forEach(user => {
            if (user.orders) {
                user.orders.forEach(order => {
                    // Using a simple match on order ID ending for demo
                    if (order.id.endsWith(orderId.split('-')[1])) {
                        order.status = status;
                    }
                });
            }
        });

        localStorage.setItem('quickbite_users', JSON.stringify(allUsers));
    }

    updateEarningsSummary() {
        const period = document.getElementById('earnings-period').value;
        const now = new Date();
        let startDate;

        if (period === 'today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'week') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        }

        const filteredEarnings = this.earningsHistory.filter(earning => 
            new Date(earning.date) >= startDate
        );

        const totalDeliveries = filteredEarnings.length;
        const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);
        const avgEarnings = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

        document.getElementById('total-deliveries').textContent = totalDeliveries;
        document.getElementById('total-earnings').textContent = `$${totalEarnings.toFixed(2)}`;
        document.getElementById('avg-delivery-earnings').textContent = `$${avgEarnings.toFixed(2)}`;

        // Update earnings history list
        const historyList = document.getElementById('earnings-history-list');
        historyList.innerHTML = '';

        const recentEarnings = filteredEarnings.slice(0, 10);
        recentEarnings.forEach(earning => {
            const earningEl = document.createElement('div');
            earningEl.className = 'earning-record';
            earningEl.innerHTML = `
                <div class="earning-info">
                    <div>${earning.restaurantName} → ${earning.customerName}</div>
                    <div>${new Date(earning.date).toLocaleDateString()}</div>
                </div>
                <div class="earning-amount">+$${earning.amount.toFixed(2)}</div>
            `;
            historyList.appendChild(earningEl);
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

// Initialize driver manager
const driverManager = new DriverManager();
