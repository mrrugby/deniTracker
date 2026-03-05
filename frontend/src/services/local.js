// src/services/local.js
// Production-grade Offline-First Storage Layer

// ===============================
// STORAGE HELPERS
// ===============================

const STORAGE_KEYS = {
  CUSTOMERS: "customers",
  ITEMS: "items",
  TRANSACTIONS: "transactions"
};

function getData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ===============================
// CUSTOMER DOMAIN
// ===============================

export async function fetchCustomers() {
  return getData(STORAGE_KEYS.CUSTOMERS);
}

export async function fetchCustomer(id) {
  const customers = getData(STORAGE_KEYS.CUSTOMERS);
  const customer = customers.find(c => c.id === Number(id));

  if (!customer) return null;

  return {
    ...customer,
    transactions: await fetchCustomerTransactions(id)
  };
}

export async function addCustomer(data) {
  const customers = getData(STORAGE_KEYS.CUSTOMERS);

  const newCustomer = {
    id: generateId(),
    name: (data.name || "").trim(),
    phone: data.phone || "",
    created_at: new Date().toISOString()
  };

  customers.push(newCustomer);
  saveData(STORAGE_KEYS.CUSTOMERS, customers);

  return newCustomer;
}

// ===============================
// ITEM DOMAIN
// ===============================

export async function fetchItems() {
  return getData(STORAGE_KEYS.ITEMS);
}

export async function addItem(data) {
  const items = getData(STORAGE_KEYS.ITEMS);

  const newItem = {
    id: generateId(),
    name: (data.name || "").trim(),
    price: Number(data.price) || 0,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString()
  };

  items.push(newItem);
  saveData(STORAGE_KEYS.ITEMS, items);

  return newItem;
}

export async function updateItem(id, payload) {
  const items = getData(STORAGE_KEYS.ITEMS);

  const index = items.findIndex(i => i.id === Number(id));
  if (index === -1) throw new Error("Item not found");

  items[index] = {
    ...items[index],
    ...payload,
    price: Number(payload.price) || 0,
    updated_at: new Date().toISOString()
  };

  saveData(STORAGE_KEYS.ITEMS, items);

  return items[index];
}

export async function deleteItem(id) {
  const items = getData(STORAGE_KEYS.ITEMS);

  const filtered = items.filter(i => i.id !== Number(id));

  saveData(STORAGE_KEYS.ITEMS, filtered);
}

// ===============================
// TRANSACTION DOMAIN (Ledger Pattern)
// ===============================

export async function addTransaction(customerId, type, payload = {}) {
  const customers = getData(STORAGE_KEYS.CUSTOMERS);
  const transactions = getData(STORAGE_KEYS.TRANSACTIONS);

  const customer = customers.find(c => c.id === Number(customerId));

  if (!customer) throw new Error("Customer not found");

  let amount = Number(payload.amount) || 0;

  // Normalize item debt calculation
  if (type === "debt" && payload.items?.length) {
    amount = payload.items.reduce(
      (sum, item) =>
        sum + (Number(item.price || item.unit_price || 0) *
        Number(item.quantity || 1)),
      0
    );
  }

  const transaction = {
    id: generateId(),
    customer_id: Number(customerId),
    customer_name: customer.name,
    transaction_type: type,
    amount,
    description: payload.description || "",
    items: payload.items || [],
    date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  transactions.push(transaction);

  saveData(STORAGE_KEYS.TRANSACTIONS, transactions);

  return transaction;
}

// Fetch all transactions (hydrated)
export async function fetchTransactions() {
  const transactions = getData(STORAGE_KEYS.TRANSACTIONS);

  return transactions
    .map(tx => ({
      ...tx,
      amount: Number(tx.amount) || 0
    }))
    .sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

// Fetch customer transactions
export async function fetchCustomerTransactions(customerId) {
  const transactions = getData(STORAGE_KEYS.TRANSACTIONS);

  return transactions
    .filter(tx => tx.customer_id === Number(customerId))
    .map(tx => ({
      ...tx,
      amount: Number(tx.amount) || 0
    }))
    .sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

// ===============================
// BALANCE ENGINE
// ===============================

export async function calculateCustomerBalance(customerId) {
  const transactions = await fetchCustomerTransactions(customerId);

  let debt = 0;
  let payments = 0;

  transactions.forEach(tx => {
    if (tx.transaction_type === "debt") debt += Number(tx.amount || 0);
    if (tx.transaction_type === "payment") payments += Number(tx.amount || 0);
  });

  return debt - payments;
}

export async function calculateTotals() {
  const transactions = getData(STORAGE_KEYS.TRANSACTIONS);

  let totalDebt = 0;
  let totalPayments = 0;

  transactions.forEach(tx => {
    if (tx.transaction_type === "debt")
      totalDebt += Number(tx.amount || 0);

    if (tx.transaction_type === "payment")
      totalPayments += Number(tx.amount || 0);
  });

  return { totalDebt, totalPayments };
}