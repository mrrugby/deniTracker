const API_BASE = import.meta.env.VITE_API_BASE;

export async function fetchCustomers() {
  const res = await fetch(`${API_BASE}/customers/`);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return await res.json();
}

export async function fetchCustomer(id) {
  const res = await fetch(`${API_BASE}/customers/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch customer");
  return await res.json();
}

export async function addTransaction(customerId, type, payload) {
  const body = {
    customer: customerId,
    transaction_type: type,
    ...payload,
  };

  const res = await fetch(`${API_BASE}/transactions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to add transaction");
  return await res.json();
}

export async function addCustomer(data) {
  const res = await fetch(`${API_BASE}/customers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to add customer");
  return await res.json();
}

export async function fetchItems() {
  const res = await fetch(`${API_BASE}/items/`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return await res.json();
}

export async function addDebt(customerId, items) {
  const payload = {
    customer: customerId,
    transaction_type: "debt",
    items: items.map(i => ({
      item: i.id,
      quantity: i.quantity
    }))
  };

  const res = await fetch(`${API_BASE}/transactions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to add debt");
  return await res.json();
}
