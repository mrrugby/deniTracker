import { defineStore } from "pinia"
import { db } from "@/db"

export const useTransactionStore = defineStore("transactions", {
  state: () => ({
    transactions: [],
  }),

  actions: {
    async loadTransactions() {
      this.transactions = await db.transactions.toArray()
    },

    async addDebt(customer_id, items) {
      const transactionId = await db.transactions.add({
        customer_id,
        transaction_type: "debt",
        date: new Date().toISOString(),
      })

      // save each item
      for (const i of items) {
        await db.transaction_items.add({
          transactionId,
          itemId: i.id,
          quantity: i.quantity,
          unit_price: i.price,
        })
      }
      await this.loadTransactions()
    },

    async addPayment(customer_id, amount) {
      await db.transactions.add({
        customer_id,
        transaction_type: "payment",
        amount,
        date: new Date().toISOString(),
      })
      await this.loadTransactions()
    },

    async getCustomerBalance(customer_id) {
      const transactions = await db.transactions
        .where("customer_id")
        .equals(customer_id)
        .toArray()

      let totalDebt = 0
      let totalPayments = 0

      for (const t of transactions) {
        if (t.transaction_type === "debt") {
          const items = await db.transaction_items
            .where("transactionId")
            .equals(t.id)
            .toArray()
          const sum = items.reduce(
            (acc, i) => acc + i.unit_price * i.quantity,
            0
          )
          totalDebt += sum
        } else if (t.transaction_type === "payment") {
          totalPayments += t.amount || 0
        }
      }

      return totalDebt - totalPayments
    },
  },
})
