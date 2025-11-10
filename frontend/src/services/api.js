const API_BASE = "http://127.0.0.1:8000/api";

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

export async function addDebt(customerId, items) {
  const res = await fetch(`${API_BASE}/transactions/debt/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer: customerId, items }),
  });
  if (!res.ok) throw new Error("Failed to add debt");
  return await res.json();
}

export async function addPayment(customerId, amount) {
  const res = await fetch(`${API_BASE}/transactions/payment/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer: customerId, amount }),
  });
  if (!res.ok) throw new Error("Failed to record payment");
  return await res.json();
}