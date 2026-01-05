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
Install Dependencies:

Bash

cd FakhamaFrontEnd
npm install
Start the Development Server:

Note: Replace the IP address with your machine's local Network IP.

PowerShell

# For Windows (PowerShell) - Example IP
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.103"; npx expo start --lan -c
Flags used:

--lan: Forces LAN connection (required to connect from a physical phone).

-c: Clears the cache to avoid stale bundler issues.

Run the App:

Scan the QR code generated in the terminal using the Expo Go app on your phone.

Or run on an emulator:

Bash

npx expo start --android
# or
npx expo start --ios

---

## 👤 Author

- **GitHub:** https://github.com/Mehdi77-dev

---

## 📌 Notes

- This repository is intended for **academic and project demonstration purposes**
- Large media files are provided as downloadable resources
- For a full overview, please consult the documentation and demo video

---

✅ **Project Status:** Completed
