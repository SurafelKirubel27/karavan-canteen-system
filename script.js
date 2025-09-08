// Sample data for restaurants and cuisines
const restaurantsData = [
    {
        id: 1,
        name: "Bella Italia",
        cuisine: "Italian",
        rating: 4.8,
        deliveryTime: "25-35 min",
        image: "🍝",
        description: "Authentic Italian cuisine with fresh ingredients",
        menu: [
            { id: 1, name: "Margherita Pizza", price: 12.99, description: "Fresh tomatoes, mozzarella, basil" },
            { id: 2, name: "Spaghetti Carbonara", price: 14.99, description: "Creamy pasta with bacon and parmesan" },
            { id: 3, name: "Tiramisu", price: 6.99, description: "Classic Italian dessert" }
        ]
    },
    {
        id: 2,
        name: "Spice Garden",
        cuisine: "Indian",
        rating: 4.6,
        deliveryTime: "30-40 min",
        image: "🍛",
        description: "Authentic Indian flavors and spices",
        menu: [
            { id: 4, name: "Chicken Tikka Masala", price: 15.99, description: "Tender chicken in creamy tomato sauce" },
            { id: 5, name: "Biryani", price: 13.99, description: "Fragrant rice with spices and meat" },
            { id: 6, name: "Naan Bread", price: 3.99, description: "Fresh baked Indian bread" }
        ]
    },
    {
        id: 3,
        name: "Burger Palace",
        cuisine: "American",
        rating: 4.5,
        deliveryTime: "20-30 min",
        image: "🍔",
        description: "Gourmet burgers and classic American food",
        menu: [
            { id: 7, name: "Classic Cheeseburger", price: 11.99, description: "Beef patty with cheese, lettuce, tomato" },
            { id: 8, name: "BBQ Bacon Burger", price: 13.99, description: "BBQ sauce, bacon, onion rings" },
            { id: 9, name: "Sweet Potato Fries", price: 5.99, description: "Crispy sweet potato fries" }
        ]
    },
    {
        id: 4,
        name: "Sushi Zen",
        cuisine: "Japanese",
        rating: 4.9,
        deliveryTime: "35-45 min",
        image: "🍣",
        description: "Fresh sushi and Japanese delicacies",
        menu: [
            { id: 10, name: "Salmon Roll", price: 8.99, description: "Fresh salmon with avocado" },
            { id: 11, name: "Chicken Teriyaki", price: 12.99, description: "Grilled chicken with teriyaki sauce" },
            { id: 12, name: "Miso Soup", price: 4.99, description: "Traditional Japanese soup" }
        ]
    },
    {
        id: 5,
        name: "Taco Fiesta",
        cuisine: "Mexican",
        rating: 4.4,
        deliveryTime: "25-35 min",
        image: "🌮",
        description: "Authentic Mexican street food",
        menu: [
            { id: 13, name: "Beef Tacos", price: 9.99, description: "Three tacos with seasoned beef" },
            { id: 14, name: "Chicken Quesadilla", price: 10.99, description: "Grilled chicken with cheese" },
            { id: 15, name: "Guacamole & Chips", price: 6.99, description: "Fresh guacamole with tortilla chips" }
        ]
    },
    {
        id: 6,
        name: "Green Bowl",
        cuisine: "Healthy",
        rating: 4.7,
        deliveryTime: "20-30 min",
        image: "🥗",
        description: "Fresh, healthy, and organic meals",
        menu: [
            { id: 16, name: "Buddha Bowl", price: 11.99, description: "Quinoa, vegetables, and tahini dressing" },
            { id: 17, name: "Acai Bowl", price: 9.99, description: "Acai berries with granola and fruits" },
            { id: 18, name: "Green Smoothie", price: 5.99, description: "Spinach, banana, and mango smoothie" }
        ]
    }
];

const cuisinesData = [
    { name: "Italian", icon: "🍝", count: 45 },
    { name: "Indian", icon: "🍛", count: 38 },
    { name: "American", icon: "🍔", count: 52 },
    { name: "Japanese", icon: "🍣", count: 29 },
    { name: "Mexican", icon: "🌮", count: 34 },
    { name: "Chinese", icon: "🥡", count: 41 },
    { name: "Thai", icon: "🍜", count: 26 },
    { name: "Healthy", icon: "🥗", count: 33 }
];

// Global variables
let cart = [];
let currentRestaurant = null;

// DOM elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const cartCount = document.getElementById('cart-count');
const cartContent = document.getElementById('cart-content');
const cartFooter = document.getElementById('cart-footer');
const cartTotal = document.getElementById('cart-total');
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeLoginModal = document.getElementById('close-login-modal');
const searchInput = document.getElementById('search-input');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadRestaurants();
    loadCuisines();
    setupEventListeners();
    updateCartDisplay();
});

// Event listeners
function setupEventListeners() {
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Cart sidebar
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
    });

    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });

    // Login modal
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('show');
    });

    closeLoginModal.addEventListener('click', () => {
        loginModal.classList.remove('show');
    });

    // Close modal when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('show');
        }
    });

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartSidebar.contains(e.target) && !cartBtn.contains(e.target)) {
            cartSidebar.classList.remove('open');
        }
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterRestaurants(searchTerm);
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Close mobile menu
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Load restaurants
function loadRestaurants() {
    const restaurantGrid = document.getElementById('restaurant-grid');
    restaurantGrid.innerHTML = '';

    restaurantsData.forEach(restaurant => {
        const restaurantCard = createRestaurantCard(restaurant);
        restaurantGrid.appendChild(restaurantCard);
    });
}

// Create restaurant card
function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card fade-in-up';
    card.onclick = () => openRestaurantMenu(restaurant);

    card.innerHTML = `
        <div class="restaurant-image">
            <span style="font-size: 4rem;">${restaurant.image}</span>
        </div>
        <div class="restaurant-info">
            <h3 class="restaurant-name">${restaurant.name}</h3>
            <p class="restaurant-cuisine">${restaurant.cuisine}</p>
            <p style="color: #666; margin-bottom: 15px;">${restaurant.description}</p>
            <div class="restaurant-meta">
                <div class="restaurant-rating">
                    <i class="fas fa-star"></i>
                    <span>${restaurant.rating}</span>
                </div>
                <div class="restaurant-delivery">${restaurant.deliveryTime}</div>
            </div>
        </div>
    `;

    return card;
}

// Load cuisines
function loadCuisines() {
    const cuisineGrid = document.getElementById('cuisine-grid');
    cuisineGrid.innerHTML = '';

    cuisinesData.forEach(cuisine => {
        const cuisineCard = createCuisineCard(cuisine);
        cuisineGrid.appendChild(cuisineCard);
    });
}

// Create cuisine card
function createCuisineCard(cuisine) {
    const card = document.createElement('div');
    card.className = 'cuisine-card fade-in-up';
    card.onclick = () => filterByCuisine(cuisine.name);

    card.innerHTML = `
        <div class="cuisine-icon">${cuisine.icon}</div>
        <h3 class="cuisine-name">${cuisine.name}</h3>
        <p class="cuisine-count">${cuisine.count} restaurants</p>
    `;

    return card;
}

// Open restaurant menu
function openRestaurantMenu(restaurant) {
    currentRestaurant = restaurant;
    showRestaurantModal(restaurant);
}

// Show restaurant modal with menu
function showRestaurantModal(restaurant) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'restaurant-modal';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <div>
                    <h3>${restaurant.name}</h3>
                    <p style="color: #666; margin: 5px 0;">${restaurant.cuisine} • ${restaurant.deliveryTime}</p>
                    <div style="display: flex; align-items: center; gap: 5px; color: #ff6b35;">
                        <i class="fas fa-star"></i>
                        <span>${restaurant.rating}</span>
                    </div>
                </div>
                <button class="close-modal" onclick="closeRestaurantModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 30px; color: #666;">${restaurant.description}</p>
                <h4 style="margin-bottom: 20px; color: #333;">Menu</h4>
                <div class="menu-items">
                    ${restaurant.menu.map(item => `
                        <div class="menu-item" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; margin-bottom: 15px;">
                            <div style="flex: 1;">
                                <h5 style="margin-bottom: 5px; color: #333;">${item.name}</h5>
                                <p style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">${item.description}</p>
                                <span style="font-weight: 600; color: #ff6b35; font-size: 1.1rem;">$${item.price.toFixed(2)}</span>
                            </div>
                            <button onclick="addToCart({id: ${item.id}, name: '${item.name}', price: ${item.price}, restaurant: '${restaurant.name}'})"
                                    style="background: #ff6b35; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                                Add to Cart
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeRestaurantModal();
        }
    });
}

// Close restaurant modal
function closeRestaurantModal() {
    const modal = document.getElementById('restaurant-modal');
    if (modal) {
        modal.remove();
    }
}

// Filter restaurants by search term
function filterRestaurants(searchTerm) {
    const filteredRestaurants = restaurantsData.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm) ||
        restaurant.description.toLowerCase().includes(searchTerm)
    );

    const restaurantGrid = document.getElementById('restaurant-grid');
    restaurantGrid.innerHTML = '';

    filteredRestaurants.forEach(restaurant => {
        const restaurantCard = createRestaurantCard(restaurant);
        restaurantGrid.appendChild(restaurantCard);
    });

    if (filteredRestaurants.length === 0) {
        restaurantGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; color: #e0e0e0;"></i>
                <p>No restaurants found matching "${searchTerm}"</p>
            </div>
        `;
    }
}

// Filter by cuisine
function filterByCuisine(cuisineName) {
    const filteredRestaurants = restaurantsData.filter(restaurant =>
        restaurant.cuisine === cuisineName
    );

    const restaurantGrid = document.getElementById('restaurant-grid');
    restaurantGrid.innerHTML = '';

    filteredRestaurants.forEach(restaurant => {
        const restaurantCard = createRestaurantCard(restaurant);
        restaurantGrid.appendChild(restaurantCard);
    });

    // Scroll to restaurants section
    scrollToSection('restaurants');
}

// Load more restaurants (placeholder)
function loadMoreRestaurants() {
    alert('Load more restaurants functionality will be implemented in the next phase.');
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 70; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Cart functionality
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    updateCartDisplay();
    showCartNotification();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
}

function updateCartQuantity(itemId, quantity) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = quantity;
        }
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = totalPrice.toFixed(2);

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <p>Add some delicious items to get started!</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartContent.innerHTML = cart.map(item => `
            <div class="cart-item" style="padding: 15px; border-bottom: 1px solid #e0e0e0; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 5px; color: #333; font-size: 1rem;">${item.name}</h4>
                        ${item.restaurant ? `<p style="color: #666; font-size: 0.8rem; margin-bottom: 5px;">${item.restaurant}</p>` : ''}
                        <p style="color: #ff6b35; font-weight: 600;">$${item.price.toFixed(2)}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #999; cursor: pointer; font-size: 1.2rem; padding: 5px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})"
                                style="background: #f0f0f0; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                        <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})"
                                style="background: #f0f0f0; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
                    </div>
                    <span style="font-weight: 600; color: #333;">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
        cartFooter.style.display = 'block';
    }
}

function showCartNotification() {
    // Simple notification - could be enhanced with a toast notification
    const notification = document.createElement('div');
    notification.textContent = 'Item added to cart!';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #ff6b35;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1003;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Checkout functionality
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2.99; // Base delivery fee
    const finalTotal = total + deliveryFee;

    const checkoutModal = document.createElement('div');
    checkoutModal.className = 'modal show';
    checkoutModal.id = 'checkout-modal';

    checkoutModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Checkout</h3>
                <button class="close-modal" onclick="closeCheckoutModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 15px;">Order Summary</h4>
                    ${cart.map(item => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <hr style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Subtotal</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Delivery Fee</span>
                        <span>$${deliveryFee.toFixed(2)}</span>
                    </div>
                    <hr style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 1.1rem;">
                        <span>Total</span>
                        <span>$${finalTotal.toFixed(2)}</span>
                    </div>
                </div>

                <form onsubmit="completeOrder(event)">
                    <div class="form-group">
                        <input type="text" placeholder="Full Name" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" placeholder="Phone Number" required>
                    </div>
                    <div class="form-group">
                        <textarea placeholder="Delivery Address" rows="3" style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 10px; outline: none; font-family: inherit; resize: vertical;" required></textarea>
                    </div>
                    <div class="form-group">
                        <select style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 10px; outline: none; font-family: inherit;" required>
                            <option value="">Select Payment Method</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="cash">Cash on Delivery</option>
                            <option value="paypal">PayPal</option>
                        </select>
                    </div>
                    <button type="submit" class="submit-btn">Place Order - $${finalTotal.toFixed(2)}</button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(checkoutModal);

    // Close modal when clicking outside
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            closeCheckoutModal();
        }
    });
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.remove();
    }
}

function completeOrder(event) {
    event.preventDefault();

    // Simulate order processing
    const orderNumber = Math.floor(Math.random() * 1000000);

    alert(`Order placed successfully! Order #${orderNumber}\n\nEstimated delivery time: 30-45 minutes\nYou will receive SMS updates about your order.`);

    // Clear cart and close modals
    cart = [];
    updateCartDisplay();
    closeCheckoutModal();
    cartSidebar.classList.remove('open');
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});
