document.addEventListener('DOMContentLoaded', () => {
    // Get cart data from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItemsContainer = document.querySelector('.checkout-items');
    const totalAmountElements = document.querySelectorAll('.total-amount');
    const cartCount = document.querySelector('.cart-count');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // Debug: Log the cart data to see what we're working with
    console.log('Cart data loaded:', cart);

    // Update cart count
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        console.log('Cart count updated:', totalItems);
    }

    // Calculate cart total - central function for all total calculations
    function calculateCartTotal() {
        let total = 0;
        
        // Calculate total by iterating through each item
        cart.forEach(item => {
            // Ensure price is a number
            let price;
            
            // Check if price is a string (with currency symbol) or a number
            if (typeof item.price === 'string') {
                // Remove any currency symbols and convert to number
                price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
            } else {
                // If it's already a number, use it directly
                price = parseFloat(item.price);
            }
            
            // Check if price is a valid number
            if (isNaN(price)) {
                console.error('Invalid price for item:', item);
                price = 0; // Default to 0 if price is invalid
            }
            
            // Add to total
            total += price * item.quantity;
            console.log(`Item: ${item.name}, Price: ${price}, Quantity: ${item.quantity}, Subtotal: ${price * item.quantity}`);
        });
        
        return total;
    }

    // Update cart total display
    function updateCartTotal() {
        const total = calculateCartTotal();
        
        // Update all total amount displays with proper formatting
        totalAmountElements.forEach(element => {
            element.textContent = `$${total.toFixed(2)}`;
        });
        
        console.log('Cart total updated:', total);
    }

    // Parse price from item - central function for all price parsing
    function parseItemPrice(item) {
        // Ensure price is a number
        let price;
        
        // Check if price is a string (with currency symbol) or a number
        if (typeof item.price === 'string') {
            // Remove any currency symbols and convert to number
            price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
        } else {
            // If it's already a number, use it directly
            price = parseFloat(item.price);
        }
        
        // Check if price is a valid number
        if (isNaN(price)) {
            console.error('Invalid price for item:', item);
            price = 0; // Default to 0 if price is invalid
        }
        
        return price;
    }

    // Render cart items in checkout page
    function renderCheckoutItems() {
        if (cart.length === 0) {
            checkoutItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            return;
        }

        checkoutItemsContainer.innerHTML = cart.map(item => {
            const price = parseItemPrice(item);
            const itemTotal = price * item.quantity;
            
            return `
                <div class="checkout-item">
                    <div class="checkout-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="checkout-item-details">
                        <h4>${item.name}</h4>
                        <p class="checkout-item-price">$${price.toFixed(2)} × ${item.quantity}</p>
                    </div>
                    <div class="checkout-item-total">
                        $${itemTotal.toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
        
        // Update the total after rendering items
        updateCartTotal();
    }

    // Initialize checkout page
    updateCartCount();
    renderCheckoutItems();
    
    // Set up a MutationObserver to watch for changes to the cart items in the cart sidebar
    // This will ensure the checkout page stays in sync with any changes made in the cart sidebar
    const cartItemsContainer = document.querySelector('.cart-items');
    if (cartItemsContainer) {
        const observer = new MutationObserver(() => {
            // Reload cart data from localStorage to get the latest state
            cart = JSON.parse(localStorage.getItem('cart')) || [];
            renderCheckoutItems();
        });
        
        observer.observe(cartItemsContainer, { childList: true, subtree: true });
    }
    
    // Handle form submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(checkoutForm);
        const orderData = {
            items: cart,
            shipping: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
                country: formData.get('country')
            },
            payment: {
                cardName: formData.get('cardName'),
                cardNumber: formData.get('cardNumber'),
                expiryDate: formData.get('expiryDate'),
                cvv: formData.get('cvv')
            },
            notes: formData.get('notes'),
            total: `$${calculateCartTotal().toFixed(2)}`
        };
        
        // In a real application, you would send this data to a server
        console.log('Order submitted:', orderData);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your purchase. Your order has been received and is being processed.</p>
            <p>Order confirmation has been sent to: ${orderData.shipping.email}</p>
            <button class="continue-shopping-btn" onclick="window.location.href='index.html'">Continue Shopping</button>
        `;
        
        // Clear the form and cart
        checkoutForm.style.display = 'none';
        document.querySelector('.checkout-summary').style.display = 'none';
        document.querySelector('.checkout-container h1').textContent = 'Order Confirmation';
        
        // Add success message to the page
        document.querySelector('.checkout-container').appendChild(successMessage);
        
        // Clear cart from localStorage
        localStorage.removeItem('cart');
    });

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
        mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
        }
    });

    // Go to Top Button Functionality
    const goToTopButton = document.getElementById('go-to-top');
    
    // Show button when user scrolls down 300px
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            goToTopButton.classList.add('visible');
        } else {
            goToTopButton.classList.remove('visible');
        }
    });
    
    // Scroll to top when button is clicked
    goToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'instant'
        });
    });
}); 