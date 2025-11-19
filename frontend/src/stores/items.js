// src/stores/items.js
import { defineStore } from "pinia"
import { db } from "@/db"

export const useItemStore = defineStore("items", {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {

    /* ------------------------------------------------------------------ */
    /* 1. Load items from Dexie only                                      */
    /* ------------------------------------------------------------------ */
    async loadItems() {
      this.loading = true
      this.error = null
      try {
        this.items = await db.items.toArray()
      } catch (e) {
        console.error("Failed to load items:", e)
        this.error = e
      } finally {
        this.loading = false
      }
    },

    /* ------------------------------------------------------------------ */
    /* 2. Add item → Dexie only                                           */
    /* ------------------------------------------------------------------ */
    async addItem(payload) {
      const id = await db.items.add(payload)
      const newItem = { ...payload, id }
      this.items.push(newItem)
      return newItem
    },

    /* ------------------------------------------------------------------ */
    /* 3. Update item → Dexie only                                        */
    /* ------------------------------------------------------------------ */
    async updateItem(id, payload) {
      await db.items.update(id, payload)
      const index = this.items.findIndex(i => i.id === id)
      if (index !== -1) Object.assign(this.items[index], payload)
    },

    /* ------------------------------------------------------------------ */
    /* 4. Delete item → Dexie only                                        */
    /* ------------------------------------------------------------------ */
    async deleteItem(id) {
      await db.items.delete(id)
      this.items = this.items.filter(i => i.id !== id)
    },
  },
})
