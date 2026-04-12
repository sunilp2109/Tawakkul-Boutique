export const getCart = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const addToCart = (product, quantity = 1, customData = {}) => {
  const cart = getCart();
  const maxStock = product.stock !== undefined ? product.stock : Infinity;

  // Check if identical item (same ID and identical customizations) exists
  const existingIndex = cart.findIndex(item => 
    item._id === product._id && 
    JSON.stringify(item.customData) === JSON.stringify(customData)
  );

  let currentQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
  if (currentQty + quantity > maxStock) {
    return { success: false, message: `Only ${maxStock} items available in stock. You already have ${currentQty} in your cart.` };
  }

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,    
      quantity: quantity,
      stock: maxStock,
      customData: customData
    });
  }
  
  saveCart(cart);
  return { success: true };
};

export const updateCartItemQuantity = (index, quantity) => {
  const cart = getCart();
  if (cart[index]) {
    const maxStock = cart[index].stock !== undefined ? cart[index].stock : Infinity;
    
    if (quantity > maxStock) {
      return { success: false, message: `Only ${maxStock} items available in stock.` };
    }
    
    cart[index].quantity = quantity;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
    return { success: true };
  }
  return { success: false, message: "Item not found in cart." };
};

export const removeFromCart = (index) => {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartItemCount = () => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};

export const clearCart = () => {
  saveCart([]);
};
