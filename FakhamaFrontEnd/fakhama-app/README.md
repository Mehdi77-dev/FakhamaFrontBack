 # Fakhama — Frontend (Expo / React Native)

 Ce dépôt contient le frontend mobile de Fakhama — application Expo/React Native pour la location et la gestion de costumes (interfaces client et admin).

 Pour la documentation détaillée, voir `FRONTEND_DOCUMENTATION.md`.

 ## Fonctionnalités principales
 - Catalogue produit (filtres par catégorie)
 - Détails produit (sélection de taille & dates, favoris)
 - Panier global (`CartContext`) avec ajout/suppression, persistance et commande groupée (bulk)
 - Upload/scan de la CIN (ImagePicker) et envoi via `FormData`
 - Pages admin : création produit (multipart, `is_featured`), gestion réservations (visualiser CIN, marquer rendu)

 ## Arborescence (extraits)
 - `app/` : pages (expo-router)
    - `app/_layout.tsx` — layout global (`CartProvider`)
    - `app/client/home.tsx`, `catalog.tsx`, `product.tsx`, `cart.tsx`, `favorites.tsx`
    - `app/admin/add-product.tsx`, `reservations.tsx`
 - `app/context/CartContext.tsx` — contexte panier (persistance AsyncStorage)
 - `src/services/api.js` — axios instance + interceptors
 - `assets/` — images & vidéos

 ## Endpoints utilisés
 - Auth
    - POST `/auth/login` — login
    - POST `/auth/register` — register

 - Produits
    - GET `/products` (`?category=...`)
    - GET `/products/featured`
    - GET `/products/{id}`
    - POST `/products` (multipart)
    - POST `/products/{id}` + `_method=PUT` (multipart)

 - Favoris
    - POST `/favorites/toggle`
    - GET `/favorites`

 - Réservations / Commandes
    - POST `/reservations` — envoi bulk : `cin` (file) + `items` (JSON string)
    - GET `/reservations` — admin (inclut `cin_url`)
    - PUT `/reservations/{id}/return`

 - Profil
    - POST `/api/profile/update` — update profil (multipart)
    - GET `/api/my-reservations` — historique client

 > Remarque : l'instance axios dans `src/services/api.js` contient le `baseURL` (ex : `http://192.168.1.103:8000/api`).

 ## Installation & dév
 1. Installer dépendances :

 ```bash
 npm install
 ```

 2. Lancer Metro / Expo (LAN + clear cache recommandé) :

 ```powershell
 $env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.103"
 npx expo start --lan -c
 ```

 3. Ouvrir l'app dans Expo Go (scanner le QR) ou via un émulateur.

 ## Tests
 - Tests basiques de démonstration sont ajoutés dans `__tests__` (Jest + Testing Library). Pour exécuter :

 ```bash
 npm test
 ```

 > Vous devrez installer les dépendances de développement pour exécuter les tests (jest, testing-library, axios-mock-adapter, ...).

 ## Persistance du panier
 - Le `CartContext` persiste le panier dans `AsyncStorage` (clé `Fakhama:cartItems`).

 ## Sécurité & confidentialité
 - Les images de CIN (PII) doivent être transmises en HTTPS et stockées de manière sécurisée côté backend (signed URLs, expiration, accès restreint). Éviter de logguer ou persister les URIs non chiffrés.

 ## Recommandations / roadmap
 - Persister et synchroniser le panier (gestion des conflits).  
 - Améliorer UX (toasts, retries, loaders).  
 - Ajouter tests d'intégration et CI.  
 - S'assurer que `cin_url` est sécurisé côté backend.

 ---

 Si vous voulez, j'ajoute : persistance chiffrée, tests additionnels ou CI pipeline.
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
