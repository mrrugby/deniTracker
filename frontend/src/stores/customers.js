import { defineStore } from "pinia";
import { db } from "@/db";
import { fetchCustomers } from "@/services/api"; 

export const useCustomerStore = defineStore("customers", {
  state: () => ({
    customers: [],
  }),

  actions: {

    async loadCustomers() {
      try {
        // Try getting updated list from server
        const online = await fetchCustomers();

        // Replace local DB with fresh data
        await db.customers.clear();
        await db.customers.bulkPut(online);

        this.customers = online;
      } catch (err) {
        // Offline fallback
        this.customers = await db.customers.toArray();
      }
    },

    async addCustomer(customer) {
      const id = await db.customers.add(customer);
      this.customers.push({ ...customer, id });
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
