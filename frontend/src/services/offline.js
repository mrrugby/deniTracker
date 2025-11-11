import { db } from "@/db";
import { addDebt } from "@/services/api";

export async function queueTransaction(transaction) {
  transaction.synced = false;
  await db.transactions.add(transaction);
}

export async function syncOfflineTransactions() {
  const unsynced = await db.transactions.where({ synced: false }).toArray();

  for (const t of unsynced) {
    try {
      if (t.transaction_type === "debt") {
        await addDebt(t.customer, t.items);
      } else {
        const res = await fetch("http://127.0.0.1:8000/api/transactions/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: t.customer,
            transaction_type: "payment",
            amount: t.amount,
          }),
        });
        if (!res.ok) throw new Error("Failed to sync payment");
      }
      await db.transactions.update(t.id, { synced: true });
    } catch (e) {
      console.warn("Sync failed for transaction:", t, e);
    }
  }
}
