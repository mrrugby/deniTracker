# 💸 Debtly

**Debtly** is a simple, mobile-friendly web app built with **Vue** that helps small business owners track daily credit transactions without relying on physical paper records.

The app stores data directly in the phone’s local memory, making it lightweight, fast, and usable even for businesses that don’t want complex setups or cloud accounts.

Debtly is especially useful for kiosks, shops, and informal businesses that offer goods on credit and need a simple way to track customers, repayments, and outstanding balances.

---

## 🚀 Features

- 📒 **Customer Management**
  - Add and view customers
  - Individual customer profiles with transaction history

- 💳 **Credit Tracking**
  - Record new credit (deni)
  - Record repayments
  - Automatically calculate outstanding balances

- 📊 **Business Insights**
  - Landing dashboard with key metrics
  - View number of customers, total debt, and repayments at a glance

- 📦 **Stock Management**
  - Add, edit, and delete products
  - Track prices and availability

- 📱 **Mobile-First Design**
  - Optimized for phone usage
  - Clean and simple UI for daily use

- 💾 **Offline-Friendly**
  - Data is stored in the phone’s local memory
  - No internet or account required

---

## 🧱 Tech Stack

- **Vue** – Frontend framework  
- **JavaScript** – Application logic  
- **CSS** – Styling and layout  
- **Python** – Supporting utilities / tooling  

### Language Breakdown
- JavaScript: **39.4%**
- CSS: **35.0%**
- Vue: **18.4%**
- Python: **7.0%**

---

## 🖼️ Screenshots & Walkthrough

### 1️⃣ Customer Profile & Debt Overview

![Customer Profile](./screenshots/customer-profile.png)

This screen shows an individual customer’s profile.  
It displays:
- **Total Debt** – Total amount of credit issued
- **Total Paid** – Total repayments made
- **Outstanding** – Remaining balance

From here, you can:
- Add a **New Deni** (credit)
- Record a **New Payment** (repayment)

This gives business owners a clear snapshot of each customer’s financial status.

---

### 2️⃣ Stock Management

![Stock Page](./screenshots/stock-page.png)

The Stock tab allows users to manage shop inventory.

Features include:
- Viewing all available products
- Displaying product prices
- Showing stock availability
- Editing or deleting existing items
- Adding new products quickly

This helps shop owners keep track of what they sell alongside credit tracking.

---

### 3️⃣ Add New Product Modal

![Add Product](./screenshots/add-product.png)

This modal allows users to add products to their stock list.

Fields include:
- **Product Name**
- **Price (Ksh)**
- **In Stock** toggle

The simple form ensures products can be added in seconds without slowing down daily operations.

---

## 📂 App Structure

The app is organized into clear tabs:
- **Dashboard** – Business insights and key metrics
- **Customers** – Customer list and profiles
- **Transactions** – Credit issuance and repayments
- **Stock** – Product and inventory management

Each customer has a dedicated profile showing all related transactions.

---

## 🎯 Target Users

Debtly is designed for:
- Small business owners
- Kiosk operators
- Shopkeepers who sell goods on credit
- Anyone looking to replace paper-based debt records

---

## 📌 Project Goals

- Replace physical notebooks for tracking credit
- Keep things simple and fast
- Work well on mobile devices
- Require minimal technical knowledge

---

## 🛠️ Setup & Development

```bash
# install dependencies
npm install

# run development server
npm run dev

# build for production
npm run build
