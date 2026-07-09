import Dexie from 'dexie';

export const db = new Dexie('DeniTrackerDB');

db.version(1).stores({
  customers: '++id, name, phone, created_at',
  items: '++id, name, price, is_active, created_at',
  transactions: '++id, customer_id, customer_name, transaction_type, amount, date, created_at'
});

export default db;
