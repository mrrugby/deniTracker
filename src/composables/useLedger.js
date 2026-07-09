import { computed, ref } from 'vue';
import {
  createCustomer,
  createTransaction,
  deleteItem,
  exportDatabase,
  importDatabase,
  listCustomers,
  listItems,
  listTransactions,
  resetDatabase,
  saveItem,
  toggleItemAvailability
} from '../services/ledgerService';

const customers = ref([]);
const items = ref([]);
const transactions = ref([]);
const isReady = ref(false);
const isLoading = ref(false);

async function hydrate() {
  isLoading.value = true;

  try {
    const [customerRows, itemRows, transactionRows] = await Promise.all([
      listCustomers(),
      listItems(),
      listTransactions()
    ]);

    customers.value = customerRows.filter(Boolean).sort((left, right) => left.name.localeCompare(right.name));
    items.value = itemRows.filter(Boolean).sort((left, right) => right.created_at.localeCompare(left.created_at));
    transactions.value = transactionRows.filter(Boolean).sort((left, right) => {
      const rightDate = right.date || right.created_at || '';
      const leftDate = left.date || left.created_at || '';
      return rightDate.localeCompare(leftDate);
    });
  } finally {
    isLoading.value = false;
    isReady.value = true;
  }
}

const summaryMap = computed(() => {
  const map = new Map();

  customers.value.forEach((customer) => {
    map.set(customer.id, {
      id: customer.id,
      totalDebt: 0,
      totalPayments: 0,
      balance: 0,
      transactions: 0
    });
  });

  transactions.value.forEach((transaction) => {
    const existing = map.get(transaction.customer_id) || {
      id: transaction.customer_id,
      totalDebt: 0,
      totalPayments: 0,
      balance: 0,
      transactions: 0
    };

    if (transaction.transaction_type === 'payment') {
      existing.totalPayments += Number(transaction.amount) || 0;
    } else {
      existing.totalDebt += Number(transaction.amount) || 0;
    }

    existing.balance = existing.totalDebt - existing.totalPayments;
    existing.transactions += 1;
    map.set(transaction.customer_id, existing);
  });

  return map;
});

const customerSummaries = computed(() => customers.value.map((customer) => ({
  ...customer,
  ...(summaryMap.value.get(customer.id) || {
    totalDebt: 0,
    totalPayments: 0,
    balance: 0,
    transactions: 0
  })
})));

const activeItems = computed(() => items.value.filter((item) => item.is_active));

const dashboardStats = computed(() => {
  let totalDebt = 0;
  let totalPayments = 0;

  transactions.value.forEach((transaction) => {
    if (transaction.transaction_type === 'payment') {
      totalPayments += Number(transaction.amount) || 0;
    } else {
      totalDebt += Number(transaction.amount) || 0;
    }
  });

  return {
    totalDebt,
    totalPayments,
    balanceOutstanding: totalDebt - totalPayments,
    customerCount: customers.value.length
  };
});

function findCustomerById(id) {
  const customerId = Number(id);
  return customers.value.find((customer) => customer.id === customerId) || null;
}

function getCustomerSummary(id) {
  return summaryMap.value.get(Number(id)) || {
    totalDebt: 0,
    totalPayments: 0,
    balance: 0,
    transactions: 0
  };
}

function getTransactionsByCustomer(id) {
  const customerId = Number(id);
  return transactions.value.filter((transaction) => transaction.customer_id === customerId);
}

async function withRefresh(action) {
  const result = await action();
  await hydrate();
  return result;
}

export function useLedger() {
  return {
    customers,
    items,
    transactions,
    activeItems,
    customerSummaries,
    dashboardStats,
    isReady,
    isLoading,
    async init() {
      if (!isReady.value && !isLoading.value) {
        await hydrate();
      }
    },
    hydrate,
    findCustomerById,
    getCustomerSummary,
    getTransactionsByCustomer,
    async addCustomer(payload) {
      return withRefresh(() => createCustomer(payload));
    },
    async saveItem(payload) {
      return withRefresh(() => saveItem(payload));
    },
    async deleteItem(id) {
      return withRefresh(() => deleteItem(id));
    },
    async toggleItemAvailability(id, nextValue) {
      return withRefresh(() => toggleItemAvailability(id, nextValue));
    },
    async recordTransaction(payload) {
      return withRefresh(() => createTransaction(payload));
    },
    async exportBackup() {
      return exportDatabase();
    },
    async importBackup(payload) {
      await withRefresh(() => importDatabase(payload));
    },
    async resetApp() {
      await withRefresh(() => resetDatabase());
    }
  };
}
