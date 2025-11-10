import { defineStore } from "pinia"
import { db } from "@/db"

export const useCustomerStore = defineStore("customers", {
    state: () =>({
        customers: [],

    }),

    actions: {
        async loadCustomers() {
            this.customers = awaitdb.customers.toArray()
        },

        async addCustomer(customer) {
            const id = await db.customers.add(customer)
            this.customers.push({...customer, id })
        },

        async updateCustomer(id, updates) {
            await db.customers.update(id, updates)
            await this.loadCustomers()
        },

        async deleteCustomer(id) {
            await db.customers.delete(id)
            await this.loadCustomers()
        },
    },
})