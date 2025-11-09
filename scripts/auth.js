// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('quickbite_users')) || [];
        this.initializeEventListeners();
        this.checkExistingSession();
    }

    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Role-specific fields
        document.getElementById('register-role').addEventListener('change', (e) => {
            this.toggleRoleSpecificFields(e.target.value);
        });

        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    switchTab(tab) {
        // Update active tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
        });

        // Reset forms when switching tabs
        if (tab === 'register') {
            document.getElementById('register-form').reset();
            this.toggleRoleSpecificFields(document.getElementById('register-role').value);
        } else {
            document.getElementById('login-form').reset();
        }
    }

    toggleRoleSpecificFields(role) {
        // Hide all role-specific fields first
        document.querySelectorAll('.role-specific-fields').forEach(field => {
            field.classList.add('hidden');
        });

        // Show relevant fields based on role
        if (role === 'restaurant') {
            document.getElementById('restaurant-fields').classList.remove('hidden');
        } else if (role === 'driver') {
            document.getElementById('driver-fields').classList.remove('hidden');
        }
    }

    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;

        if (!email || !password || !role) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        const user = this.users.find(u => 
            u.email === email && u.password === password && u.role === role
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('quickbite_current_user', JSON.stringify(user));
            this.showDashboard(user.role);
            this.showMessage(`Welcome back, ${user.name}!`, 'success');
        } else {
            this.showMessage('Invalid credentials or role mismatch', 'error');
        }
    }

    handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;

        if (!name || !email || !password || !role) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Check if user already exists
        if (this.users.find(u => u.email === email)) {
            this.showMessage('User with this email already exists', 'error');
            return;
        }

        // Create user object
        const user = {
            id: this.generateId(),
            name,
            email,
            password,
            role,
            createdAt: new Date().toISOString()
        };

        // Add role-specific data
        if (role === 'restaurant') {
            user.restaurantName = document.getElementById('restaurant-name').value;
            user.restaurantAddress = document.getElementById('restaurant-address').value;
            user.menu = this.getDefaultMenu();
        } else if (role === 'driver') {
            user.vehicleType = document.getElementById('driver-vehicle').value;
            user.licenseNumber = document.getElementById('driver-license').value;
            user.earnings = 0;
            user.completedDeliveries = 0;
        } else if (role === 'customer') {
            user.orders = [];
            user.cart = [];
        }

        // Save user
        this.users.push(user);
        localStorage.setItem('quickbite_users', JSON.stringify(this.users));

        this.currentUser = user;
        localStorage.setItem('quickbite_current_user', JSON.stringify(user));
        
        this.showDashboard(role);
        this.showMessage(`Account created successfully! Welcome, ${name}!`, 'success');
    }

    getDefaultMenu() {
        return [
            {
                id: this.generateId(),
                name: 'Margherita Pizza',
                description: 'Classic pizza with tomato sauce and mozzarella',
                price: 12.99,
                category: 'Pizza',
                available: true
            },
            {
                id: this.generateId(),
                name: 'Pepperoni Pizza',
                description: 'Pizza with pepperoni and cheese',
                price: 14.99,
                category: 'Pizza',
                available: true
            },
            {
                id: this.generateId(),
                name: 'Caesar Salad',
                description: 'Fresh salad with Caesar dressing',
                price: 8.99,
                category: 'Salads',
                available: true
            },
            {
                id: this.generateId(),
                name: 'Chicken Burger',
                description: 'Grilled chicken burger with fries',
                price: 10.99,
                category: 'Burgers',
                available: true
            }
        ];
    }

    checkExistingSession() {
        const savedUser = localStorage.getItem('quickbite_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDashboard(this.currentUser.role);
        }
    }

    showDashboard(role) {
        // Hide all screens first
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show appropriate dashboard
        if (role === 'customer') {
            document.getElementById('customer-dashboard').classList.add('active');
            customerManager.initialize();
        } else if (role === 'restaurant') {
            document.getElementById('restaurant-dashboard').classList.add('active');
            restaurantManager.initialize();
        } else if (role === 'driver') {
            document.getElementById('driver-dashboard').classList.add('active');
            driverManager.initialize();
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('quickbite_current_user');
        
        // Hide all dashboards
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show auth screen
        document.getElementById('auth-screen').classList.add('active');
        this.switchTab('login');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showMessage(message, type) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            messageEl.style.background = '#28a745';
        } else if (type === 'error') {
            messageEl.style.background = '#dc3545';
        }

        document.body.appendChild(messageEl);

        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
