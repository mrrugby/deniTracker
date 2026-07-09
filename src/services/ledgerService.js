import db from '../db';
import { safeNumber } from '../local';

function isoNow() {
  return new Date().toISOString();
}

function normalizeString(value) {
  return String(value ?? '').trim();
}

function normalizeItemSnapshot(items = []) {
  return (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map((entry) => {
      const quantity = Math.max(1, Math.round(safeNumber(entry.quantity) || 1));
      const price = safeNumber(entry.price);

      return {
        item_id: safeNumber(entry.item_id || entry.id),
        name: normalizeString(entry.name),
        price,
        quantity,
        total: price * quantity
      };
    })
    .filter((entry) => entry.name && entry.quantity > 0);
}

export async function listCustomers() {
  const rows = await db.customers.toArray();
  return Array.isArray(rows) ? rows : [];
}

export async function listItems() {
  const rows = await db.items.toArray();
  return Array.isArray(rows) ? rows : [];
}

export async function listTransactions() {
  const rows = await db.transactions.toArray();
  return Array.isArray(rows) ? rows : [];
}

export async function createCustomer(payload) {
  const name = normalizeString(payload?.name);
  const phone = normalizeString(payload?.phone);

  if (!name) {
    throw new Error('Customer name is required');
  }

  const customer = {
    name,
    phone,
    created_at: isoNow()
  };

  const id = await db.customers.add(customer);
  return { ...customer, id };
}

export async function saveItem(payload) {
  const id = safeNumber(payload?.id);
  const name = normalizeString(payload?.name);
  const price = safeNumber(payload?.price);
  const is_active = payload?.is_active !== false;

  if (!name) {
    throw new Error('Item name is required');
  }

  if (price <= 0) {
    throw new Error('Item price must be greater than zero');
  }

  const baseItem = {
    name,
    price,
    is_active,
    created_at: normalizeString(payload?.created_at) || isoNow()
  };

  if (id > 0) {
    await db.items.put({ ...baseItem, id });
    return { ...baseItem, id };
  }

  const newId = await db.items.add(baseItem);
  return { ...baseItem, id: newId };
}

export async function toggleItemAvailability(id, isActive) {
  await db.items.update(id, { is_active: !!isActive });
}

export async function deleteItem(id) {
  await db.items.delete(id);
}

export async function createTransaction(payload) {
  const customerId = safeNumber(payload?.customer_id);
  const customer = await db.customers.get(customerId);

  if (!customer) {
    throw new Error('Customer was not found');
  }

  const transactionType = payload?.transaction_type === 'payment' ? 'payment' : 'debt';
  const items = transactionType === 'debt' ? normalizeItemSnapshot(payload?.items) : [];
  const itemsTotal = items.reduce((sum, item) => sum + safeNumber(item.total), 0);
  const amount = transactionType === 'debt' && items.length > 0 ? itemsTotal : safeNumber(payload?.amount);

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  const dateCandidate = normalizeString(payload?.date);
  const parsedDate = dateCandidate ? new Date(dateCandidate) : new Date();

  const record = {
    customer_id: customerId,
    customer_name: customer.name,
    transaction_type: transactionType,
    amount,
    description: normalizeString(payload?.description),
    items,
    date: Number.isNaN(parsedDate.getTime()) ? isoNow() : parsedDate.toISOString(),
    created_at: isoNow()
  };

  const id = await db.transactions.add(record);
  return { ...record, id };
}

export async function resetDatabase() {
  await db.transaction('rw', db.customers, db.items, db.transactions, async () => {
    await Promise.all([db.customers.clear(), db.items.clear(), db.transactions.clear()]);
  });
}

export async function exportDatabase() {
  const [customers, items, transactions] = await Promise.all([
    listCustomers(),
    listItems(),
    listTransactions()
  ]);

  return {
    exported_at: isoNow(),
    customers,
    items,
    transactions
  };
}

export async function importDatabase(payload) {
  const customers = Array.isArray(payload?.customers) ? payload.customers : [];
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const transactions = Array.isArray(payload?.transactions) ? payload.transactions : [];

  await db.transaction('rw', db.customers, db.items, db.transactions, async () => {
    await Promise.all([db.customers.clear(), db.items.clear(), db.transactions.clear()]);

    if (customers.length) {
      await db.customers.bulkPut(
        customers.map((customer) => ({
          id: safeNumber(customer?.id),
          name: normalizeString(customer?.name),
          phone: normalizeString(customer?.phone),
          created_at: normalizeString(customer?.created_at) || isoNow()
        }))
      );
    }

    if (items.length) {
      await db.items.bulkPut(
        items.map((item) => ({
          id: safeNumber(item?.id),
          name: normalizeString(item?.name),
          price: safeNumber(item?.price),
          is_active: item?.is_active !== false,
          created_at: normalizeString(item?.created_at) || isoNow()
        }))
      );
    }

    if (transactions.length) {
      await db.transactions.bulkPut(
        transactions.map((transaction) => ({
          id: safeNumber(transaction?.id),
          customer_id: safeNumber(transaction?.customer_id),
          customer_name: normalizeString(transaction?.customer_name),
          transaction_type: transaction?.transaction_type === 'payment' ? 'payment' : 'debt',
          amount: safeNumber(transaction?.amount),
          description: normalizeString(transaction?.description),
          items: normalizeItemSnapshot(transaction?.items),
          date: normalizeString(transaction?.date) || isoNow(),
          created_at: normalizeString(transaction?.created_at) || isoNow()
        }))
      );
    }
  });
}
