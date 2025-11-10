import Dexie from "dexie"

export const db = new Dexie("DeniTrackerDb")

db.version(1).stores({
    customers: "++id, name, phone",
    items: "++id, name, price",
    transactions: "++id, customerId, transaction_type, date",
    transaction_items: "++id, transactionId, itemId, quantity, unit_price",
})