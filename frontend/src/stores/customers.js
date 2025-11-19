import { defineStore } from "pinia";
import { db } from "@/db";


export const useCustomerStore = defineStore("customers", {
  state: () => ({
    customers: [],
    loading: true,
  }),

  actions: {

    async loadCustomers() {
      this.loading = true;

      const local = await db.customers.toArray();
      this.customers = local;
      this.loading = false;
    },

    async addCustomer(customer) {
      const id = await db.customers.add({
        ...customer,
        createdAt: Date.now(),
      })
      this.customers.push({ ...customer, id});
    },

    async updateCustomer(id, updates) {
      await db.customers.update(id, updates);
      this.customers = await db.customers.toArray();
    },

    async deleteCustomer(id) {
      await db.customers.delete(id);
      this.customers = await db.customers.toArray();
    }
  }
});
