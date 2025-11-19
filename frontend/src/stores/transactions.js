import { defineStore } from "pinia";
import { db } from "@/db";

export const useTransactionStore = defineStore("transactions", {
  state: () => ({
    transactions: [],
  }),

  actions: {
    async loadTransactions() {
      this.transactions = await db.transactions.toArray();
    },

    async getCustomerTransactions(customerId) {
      return await db.transactions
        .where("customer_id")
        .equals(customerId)
        .reverse()
        .sortBy("date");
    },

    async addDebt(customerId, items) {
      const total = items.reduce(
        (acc, i) => acc + i.price * i.quantity,
        0
      );

      const transactionId = await db.transactions.add({
        customer_id: customerId,
        transaction_type: "debt",
        total_amount: total,
        date: new Date().toISOString(),
        items: items.map(i => ({
          item: i.id,
          quantity: i.quantity,
          price: i.price
        }))
      });

      await this.loadTransactions();
      return transactionId;
    },

    async addPayment(customerId, amount) {
      await db.transactions.add({
        customer_id: customerId,
        transaction_type: "payment",
        total_amount: parseFloat(amount),
        date: new Date().toISOString(),
      });

      await this.loadTransactions();
    },

    async getCustomerBalance(customerId) {
      const transactions = await this.getCustomerTransactions(customerId);

      let totalDebt = 0;
      let totalPayments = 0;

      for (const t of transactions) {
        if (t.transaction_type === "debt") {
          totalDebt += t.total_amount;
        } else if (t.transaction_type === "payment") {
          totalPayments += t.total_amount;
        }
      }

      return totalDebt - totalPayments;
    },
  },
});
