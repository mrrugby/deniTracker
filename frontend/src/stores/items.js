import { defineStore } from "pinia"
import { db } from "@/db"

export const useItemStore = defineStore("items", {
  state: () => ({
    items: [],
  }),

  actions: {
    async loadItems() {
      this.items = await db.items.toArray()
    },

    async addItem(item) {
      const id = await db.items.add(item)
      this.items.push({ ...item, id })
    },

    async seedDefaultItems() {
      const existing = await db.items.count()
      if (existing === 0) {
        const defaults = [
          { name: "Milk", price: 50 },
          { name: "Bread", price: 40 },
          { name: "Sugar", price: 120 },
        ]
        await db.items.bulkAdd(defaults)
        this.items = defaults
      } else {
        await this.loadItems()
      }
    },
  },
})
