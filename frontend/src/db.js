import Dexie from "dexie";

// Initialize database
export const db = new Dexie("DeniTrackerDB");

db.version(1).stores({
  customers: "++id, name, phone",
  items: "++id, name, price",
  transactions: "++id, customer_id, transaction_type, synced",
});
