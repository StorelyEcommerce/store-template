/**
 * Main application JavaScript
 * Handles general UI interactions and utilities
 */

// Format price helper
function formatPrice(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

// Make formatPrice available globally
window.formatPrice = formatPrice;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Update cart count
  if (window.CartAPI) {
    updateCartCount();
  }
  
  // Handle mobile menu toggle visibility
  function updateMobileMenuVisibility() {
    const toggle = document.getElementById('mobile-menu-toggle');
    if (toggle && window.innerWidth >= 768) {
      toggle.style.display = 'none';
    } else if (toggle) {
      toggle.style.display = 'block';
    }
  }
  
  updateMobileMenuVisibility();
  window.addEventListener('resize', updateMobileMenuVisibility);
});
