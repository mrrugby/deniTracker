// src/stores/items.js
import { defineStore } from "pinia"
import { db } from "@/db"
import { fetchItems } from "@/services/api"

export const useItemStore = defineStore("items", {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {

    /* ------------------------------------------------------------------ */
    /* 1. Load items: Dexie first → then fetch API and add new items      */
    /* ------------------------------------------------------------------ */
    async loadItems() {
      this.loading = true
      this.error = null

      try {
        // Always load Dexie first
        const localItems = await db.items.toArray()
        this.items = localItems

        // Try to fetch remote items if online
        const remoteItems = await fetchItems()

        // Only add remote items that don't exist in Dexie
        const newItems = remoteItems.filter(
          r => !localItems.some(
            l => l.name.trim().toLowerCase() === r.name.trim().toLowerCase()
          )
        )

        if (newItems.length > 0) {
          await db.items.bulkPut(newItems)
          this.items = await db.items.toArray()
        }
      } catch (e) {
        console.warn("API unavailable, using offline only:", e)

        // Never treat offline as a user error
        this.error = null
        this.items = await db.items.toArray()
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
