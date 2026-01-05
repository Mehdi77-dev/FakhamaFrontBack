📱 Fakhama Mobile Application – Frontend & Backend
This repository contains the complete mobile application project, including the backend API, the frontend application, the project documentation, and a demo video.

The project is designed to manage luxury costume rentals with a complete user flow (browsing, favorites, cart, ID verification) and a comprehensive admin dashboard.

📁 Project Structure
Plaintext

FakhamaFrontBack/
├── BackendMobileVS/        # Backend (Laravel API)
├── FakhamaFrontEnd/        # Frontend application (Expo / React Native)
├── docs/                   # Project documentation
│   └── Cahier des Charges Mobile.pdf
├── videos/                 # Application demo video
│   └── vidapplication.mp4
⚙️ Backend
The backend serves as the REST API provider for the mobile application.

📂 Location: BackendMobileVS/

🛠 Technology: Laravel

🏗 Architecture: REST API

🔐 Authentication: Laravel Sanctum

✨ Main Features:

User Authentication (Login/Register)

Product Management (CRUD)

Reservation System

Favorites/Wishlist Management

Admin Access Control (Middleware)

🎨 Frontend
The frontend is a cross-platform mobile application built to consume the Laravel API.

📂 Location: FakhamaFrontEnd/

📱 Framework: React Native (Expo) with Expo Router

💻 Language: TypeScript / TSX

🛠 Key Stack & Libraries
HTTP Client: Axios (with auth interceptor)

State Management: React Context (CartContext)

Storage: AsyncStorage (Cart persistence)

Routing: File-based routing (Expo Router)

Key Libs: vector-icons, expo-image-picker, datetimepicker, react-navigation

📱 Frontend Project Structure
app/ — Pages (Expo Router routes)

app/client/ — User pages (Home, Catalog, Product, Cart, Favorites, Profile)

app/admin/ — Admin pages (Add Product, Reservations, Manage Products)

app/context/ — Global state management (CartContext.tsx)

src/services/ — Axios instance configuration (api.js)

assets/ — Images & resources

✨ Main Frontend Features
🛍️ Product catalog with category filters

👕 Product details with date/size selection

🛒 Shopping cart with local persistence

🆔 CIN (ID document) scanning/upload for orders

❤️ Favorites system (Wishlist)

👤 User profile management

🛠️ Admin Dashboard: Full product & reservation management

🔗 API Endpoints Integration
The frontend communicates with the backend via the following endpoints:

Auth: POST /auth/login, POST /auth/register

Products: GET /products, POST /products, PUT /products/{id}

Favorites: POST /favorites/toggle, GET /favorites

Reservations: POST /reservations, GET /reservations, PUT /reservations/{id}/return

Profile: POST /api/profile/update, GET /api/my-reservations

📄 Documentation
The full project specification (Cahier des Charges) is available in PDF format.

📘 Cahier des Charges Mobile: 👉 View the documentation

🎥 Application Demo Video
⚠️ Note: GitHub does not preview video files directly.

📥 Download and watch the demo video here: 👉 Application Demo Video

🚀 How to Run the Project (Quick Guide)
1️⃣ Backend Setup (Laravel)
Bash

cd BackendMobileVS

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database migration
php artisan migrate

# Start the server
php artisan serve
2️⃣ Frontend Setup (Expo/React Native)
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
👤 Author
GitHub: Mehdi77-dev

📌 Notes
This repository is intended for academic and project demonstration purposes.

Large media files are provided as downloadable resources.

For a full overview, please consult the documentation folder and the demo video.
