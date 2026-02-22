const API_URL = 'http://localhost:3000/api';

// GET all orders
export async function getOrders() {
  try {
    const r = await fetch(`${API_URL}/orders`);
    return await r.json();
  } catch (err) {
    console.log('orders error');
    return [];
  }
}

// GET menu
export async function getMenu() {
  try {
    const r = await fetch(`${API_URL}/menu`);
    return await r.json();
  } catch (err) {
    console.log('menu error');
    return [];
  }
}

// POST new order
export async function createOrder(dishName) {
  try {
    const r = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dish_name: dishName })
    });
    return await r.json();
  } catch (err) {
    console.log('create order error');
    return null;
  }
}

// POST admin login
export async function adminLogin(username, password) {
  const r = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (!r.ok) throw new Error('bad login');
  return await r.json();
}

// PUT mark order ready
export async function markOrderReady(id) {
  try {
    await fetch(`${API_URL}/orders/${id}/ready`, { method: 'PUT' });
  } catch (err) {
    console.log('ready error');
  }
}

// PUT mark order served
export async function markOrderServed(id) {
  try {
    await fetch(`${API_URL}/orders/${id}/served`, { method: 'PUT' });
  } catch (err) {
    console.log('served error');
  }
}

// POST add menu item
export async function addMenuItem(dishName) {
  try {
    await fetch(`${API_URL}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dish_name: dishName })
    });
    return true;
  } catch (err) {
    console.log('menu add error');
    return false;
  }
}
