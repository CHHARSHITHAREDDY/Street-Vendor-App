# Street Vendor App

A web/mobile app connecting customers with nearby street vendors in real-time. Customers can search products, view live vendor locations, and track search history. Vendors can manage products, prices, operating hours, and share live location.  

---

## Features

### Customer
- Login/Register  
- Search products  
- View live vendor location on map  
- Track search history  

### Vendor
- Login/Register  
- Add/update products & prices  
- Set operating hours (online/offline auto)  
- Share live location with customers  

---

## Screenshots

### Homepage
![Homepage](screenshots/homepage.png)

### Customer Dashboard
![Customer Dashboard](screenshots/customer_dashboard.png)

### Vendor Dashboard
![Vendor Dashboard](screenshots/vendor_dashboard.png)

### Customer Search
![Customer Search](screenshots/customer_search.png)

### Vendor Product
![Vendor Product](screenshots/vendor_product.png)

---

## Tech Stack
- **Frontend:** React.js  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB  
- **Real-time Location:** Socket.IO / WebSockets  
- **Maps:** OpenStreetMap  

---

## Setup

```bash
# Clone repo
git clone <repo-link>
cd street-vendor-app

# Install backend & frontend
cd backend
npm install
cd ../frontend
npm install

# Run backend
cd backend
npm start

# Run frontend
cd ../frontend
npm start
