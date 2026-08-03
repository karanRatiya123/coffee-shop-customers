// --- Velvet Roast Product Catalog Integration ---
// TODO: Fetch products from MenuServlet

let products = [];

// Dynamic product loader prepared for MenuServlet
async function fetchProductsFromServlet(category = 'All', search = '') {
  if (typeof ApiService !== 'undefined' && ApiService.loadProducts) {
    // TODO: Fetch products from MenuServlet
    products = await ApiService.loadProducts(category, search);
  } else {
    products = [];
  }
  return products;
}

// Function to get current products array safely
function getProducts() {
  return products;
}

// Function to set products dynamically
function setProducts(newProducts) {
  products = Array.isArray(newProducts) ? newProducts : [];
}
