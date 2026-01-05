# Fakhama Mobile Application – Frontend & Backend

This repository contains the **complete mobile application project**, including the **backend API**, the **frontend application**, the **project documentation**, and a **demo video**.

---

## 📁 Project Structure

```
FakhamaFrontBack/
├── BackendMobileVS/        # Backend (Laravel API)
├── FakhamaFrontEnd/        # Frontend application
├── docs/                  # Project documentation
│   └── Cahier des Charges Mobile.pdf
├── videos/                # Application demo video
│   └── vidapplication.mp4
```

---

## ⚙️ Backend

- **Technology:** Laravel
- **Architecture:** REST API
- **Authentication:** Laravel Sanctum
- **Main Features:**
  - User authentication
  - Product management
  - Reservations
  - Favorites
  - Admin access control (middleware)

📂 Backend location: `BackendMobileVS/`

---

## 🎨 Frontend

- **Type:** Mobile / Frontend application
- **Role:** Consumes the Laravel REST API
- **Purpose:** User interaction with backend services

📂 Frontend location: `FakhamaFrontEnd/`

---

## 📄 Documentation

The full project specification (Cahier des Charges) is available in PDF format:

📘 **Cahier des Charges Mobile:**  
👉 [View the documentation](docs/Cahier%20des%20Charges%20Mobile.pdf)

---

## 🎥 Application Demo Video

⚠️ GitHub does not preview video files directly.

📥 **Download and watch the demo video:**  
👉 [Application Demo Video](videos/vidapplication.mp4)

---

## 🚀 How to Run the Project (Quick Guide)

### Backend Setup
```bash
cd BackendMobileVS
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup
Frontend Setup - Fakhama (Expo/React Native)
Installation & Getting Started
Install dependencies:


npm install
Start the development server:


$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.103"npx expo start --lan -c
Set the IP to your local network IP
Use --lan flag for LAN connection
Use -c flag to clear cache
Run the app:

Scan the QR code with Expo Go on your mobile device, or
Run on emulator: npx expo start --android or npx expo start --ios
Key Stack
Framework: React Native (Expo) with Expo Router (file-based routing)
Language: TypeScript/TSX
HTTP Client: Axios
State Management: React Context (CartContext)
Storage: AsyncStorage (cart persistence)
Key Libraries: vector-icons, expo-image-picker, datetimepicker, react-navigation
Project Structure
app/ — Pages (Expo Router routes)
client/ — User pages (home, catalog, product, cart, favorites, profile)
admin/ — Admin pages (add-product, reservations, manage-products)
app/context/CartContext.tsx — Global cart state management
src/services/api.js — Axios instance with auth interceptor
assets/ — Images & videos
Main Features
Product catalog with category filters
Product details with date/size selection
Shopping cart with persistence
CIN (ID document) upload for orders
Admin dashboard for product & reservation management
Favorites system
User profile management
Backend API Endpoints Used
Auth: POST /auth/login, POST /auth/register
Products: GET /products, POST /products, PUT /products/{id}
Favorites: POST /favorites/toggle, GET /favorites
Reservations: POST /reservations, GET /reservations, PUT /reservations/{id}/return
Profile: POST /api/profile/update, GET /api/my-reservations

## 👤 Author

- **GitHub:** https://github.com/Mehdi77-dev

---

## 📌 Notes

- This repository is intended for **academic and project demonstration purposes**
- Large media files are provided as downloadable resources
- For a full overview, please consult the documentation and demo video

---

✅ **Project Status:** Completed

