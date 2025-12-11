/**
 * Main admin application JavaScript
 * Handles general UI interactions
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Load selected store from localStorage
  const storedStoreId = localStorage.getItem('selectedStoreId');
  if (storedStoreId && window.AdminData) {
    window.AdminData.selectedStoreId = storedStoreId;
  }
});
