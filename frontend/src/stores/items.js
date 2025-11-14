// src/stores/items.js
import { defineStore } from "pinia"
import { db } from "@/db"
import {
  fetchItems,
  addItem as apiAddItem,
  updateItem as apiUpdateItem,
  deleteItem as apiDeleteItem,
} from "@/services/api"

export const useItemStore = defineStore("items", {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    /* ------------------------------------------------------------------ */
    /* 1. Load: Django → Dexie → Seed defaults                            */
    /* ------------------------------------------------------------------ */
    async loadItems() {
      this.loading = true
      this.error = null

      try {
        // 1. Try Django
        const remote = await fetchItems()
        this.items = remote

        // 2. Mirror to Dexie for offline
        await db.items.clear()
        await db.items.bulkAdd(remote)
      } catch (e) {
        console.warn("API failed, falling back to IndexedDB:", e)

        const local = await db.items.toArray()
        if (local.length > 0) {
          this.items = local
        } else {
          await this.seedDefaultItems()
        }
      } finally {
        this.loading = false
      }
    },

    /* ------------------------------------------------------------------ */
    /* 2. Seed default items (offline first)                              */
    /* ------------------------------------------------------------------ */
    async seedDefaultItems() {
      const count = await db.items.count()
      if (count === 0) {
        const defaults = [
          { name: "Milk", price: 50, is_active: true },
          { name: "Bread", price: 40, is_active: true },
          { name: "Sugar", price: 120, is_active: true },
        ]
        await db.items.bulkAdd(defaults)
        this.items = defaults
      } else {
        this.items = await db.items.toArray()
      }
    },

    /* ------------------------------------------------------------------ */
    /* 3. Add item → API + Dexie (add(), not put!)                        */
    /* ------------------------------------------------------------------ */
    async addItem(payload) {
  try {
    const created = await apiAddItem(payload)
    if (!created?.id) throw new Error("Server did not return item ID")

    await db.items.put(created)   // ← PUT
    this.items.push(created)
    return created
  } catch (e) {
    const tempId = Date.now() * -1
    const offlineItem = { ...payload, id: tempId, _offline: true }
    const localId = await db.items.add(offlineItem)
    this.items.push({ ...offlineItem, id: localId })
    throw e
  }
},

    /* ------------------------------------------------------------------ */
    /* 4. Update item → API + Dexie (update(), not put!)                  */
    /* ------------------------------------------------------------------ */
    async updateItem(id, payload) {
  try {
    const updated = await apiUpdateItem(id, payload)
    await db.items.put(updated)   // ← PUT
    const idx = this.items.findIndex(i => i.id === id)
    if (idx > -1) this.items.splice(idx, 1, updated)
    return updated
  } catch (e) {
    await db.items.update(id, payload)
    const idx = this.items.findIndex(i => i.id === id)
    if (idx > -1) Object.assign(this.items[idx], payload)
    throw e
  }
},

    /* ------------------------------------------------------------------ */
    /* 5. Delete item → API + Dexie                                       */
    /* ------------------------------------------------------------------ */
    async deleteItem(id) {
      try {
        await apiDeleteItem(id)
        await db.items.delete(id)
        this.items = this.items.filter(i => i.id !== id)
      } catch (e) {
        // Offline delete
        await db.items.delete(id)
        this.items = this.items.filter(i => i.id !== id)
        throw e
      }
    },
  },
})

