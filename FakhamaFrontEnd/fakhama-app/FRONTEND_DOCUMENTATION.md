# Documentation Frontend — Fakhama (Expo / React Native)

Date: 2025-12-27

Ce document décrit en détail l'architecture, les dossiers, les pages, les fonctionnalités et les API utilisées par le frontend "Fakhama" (application Expo / React Native). Il sert de guide technique pour les développeurs et pour les tests d'intégration avec le backend.

---

## 1) Aperçu du projet
- Stack principal : React Native (Expo) + Expo Router (file-based routing). UI construite en TSX/JSX React. Axios est l'HTTP client principal. Quelques bibliothèques importantes : `@expo/vector-icons`, `expo-image-picker`, `expo-av` (vidéo), `@react-native-community/datetimepicker`.
- Objectif : application mobile pour la location/gestion de costumes (client + admin).

## 2) Arborescence clé (résumé)
- `app/` : pages Expo Router (chaque fichier = route). Exemples notables :
  - `app/_layout.tsx` — layout global (Stack, status bar). Ici on enveloppe l'app avec `CartProvider`.
  - `app/client/home.tsx` — page d'accueil (hero, featured products).
  - `app/client/catalog.tsx` — catalogue client (filtres de catégorie existants).
  - `app/client/product.tsx` — détail produit (sélection date/taille, ajout au panier, favoris).
  - `app/client/cart.tsx` — page panier (liste des items, upload/scan CIN, envoi d'une commande groupée).
  - `app/client/favorites.tsx` — page des favoris.
  - `app/client/profile.tsx` ou `app/client/account.tsx` — profil utilisateur (si présent)
  - `app/admin/add-product.tsx` — création / modification produit (support `is_featured`).
  - `app/admin/reservations.tsx` — gestion des réservations (admin), modal "Voir CIN".
- `app/context/CartContext.tsx` — contexte pour le panier (add/remove/clear/getCartTotal).
- `src/services/api.js` — instance axios centralisée (baseURL = backend local LAN IP) + interceptor pour token.
- `assets/` — images & vidéos (hero video, photos produits, etc.).

## 3) Principales fonctionnalités (front-end)
- Navigation file-based via Expo Router.
- Catalogue produit filtrable par catégories strictes (enum). Products fetched from API.
- Product details : images, description, date pickers, taille, toggle favoris (optimistic).
- Panier (CartContext) : ajouter article avec dates/taille/prix, retirer, calcul total, page panier avec mise en lot (bulk) des commandes et upload de la CIN.
- Favorites : toggle via `POST /favorites/toggle`, listing via `GET /favorites` (gestion des pivot objects).
- Admin : ajouter/éditer produits (multipart FormData), marquer réservations comme rendues, visualiser CIN via modal.

## 4) API endpoints observés (contrat utilisé dans le frontend)
Les noms et comportements sont ceux utilisés par le frontend tel qu'implémenté :

- Auth
  - POST `/auth/login` — login (retourne `access_token`, `user`).
  - POST `/auth/register` — création utilisateur.

- Produits
  - GET `/products` — liste (option `?category=...`).
  - GET `/products/featured` — liste des produits mis en avant.
  - GET `/products/{id}` — détail produit.
  - POST `/products` — création (multipart/form-data).
  - POST `/products/{id}` avec `_method=PUT` — update (multipart/form-data).

- Favoris
  - POST `/favorites/toggle` — toggle favori, corps: `{ product_id }`.
  - GET `/favorites` — liste des favoris (peut renvoyer pivot contenant `product`).

- Réservations / Commandes
  - POST `/reservations` — envoi d'une réservation unique ou d'une commande groupée (bulk). Le frontend envoie `FormData` avec : `cin` (fichier image) et `items` (JSON string d'items simplifiés). Chaque item : `{ product_id, start_date, end_date, size, price? }`.
  - GET `/reservations` — admin list des réservations (retourne `cin_url` pour l'image de la CIN et champs `user`, `product`, `status`, `start_date`, `end_date`, `id`).
  - PUT `/reservations/{id}/return` — marquer rendu.

- Profil utilisateur
  - (Observé dans la demande) POST `/api/profile/update` — endpoint d'update du profil (multipart/form-data) acceptant photo, email, ancien mot de passe et nouveau mot de passe.
  - GET `/api/my-reservations` — récupérer l'historique du client.

Remarques : certains chemins peuvent être préfixés par `/api` selon configuration backend (ex: `/api/profile/update`). L'instance axios `src/services/api.js` configure le `baseURL`.

## 5) Flux importants et exemples
- Ajout au panier (client)
  1. Depuis `product.tsx`, l'utilisateur sélectionne taille + dates.
  2. Appuie `AJOUTER AU PANIER 🛒` → `CartContext.addToCart()` avec item contenant `productId, name, image, size, startDate, endDate, pricePerDay, days, totalPrice`.
  3. Le panier s'affiche dans `app/client/cart.tsx` (FlatList).

- Envoi d'une commande groupée
  1. Sur `cart.tsx`, l'utilisateur importe/scan sa CIN (ImagePicker) et appuie `CONFIRMER LA DEMANDE`.
  2. `submitOrder()` construit `FormData` : `cin` (fichier) + `items` (JSON stringifié) et fait `api.post('/reservations', formData, headers multipart)`. Backend traite la commande groupée.

- Visualiser CIN (admin)
  1. Admin consulte `app/admin/reservations.tsx`, la réservation contient `cin_url` renvoyée par le backend.
  2. Bouton `VOIR CIN` ouvre une `Modal` affichant l'image en grand.

## 6) Points techniques / décisions observées
- Backend enum catégories strict : `['TOUT','MARIAGE','BUSINESS','SOIRÉE','ACCESSOIRES']` — frontend envoie ces valeurs exactement.
- `is_featured` est envoyé en FormData comme `'1'`/`'0'` pour compatibilité Laravel multipart.
- `params.data` est utilisée quand on veut éviter un re-fetch (ex: navigation depuis favorites vers product page) — si `params.data` présent, le product est parsé et utilisé.
- `/favorites` peut renvoyer des objets pivot — le frontend prend `item.product ? item.product : item` pour s'adapter.

## 7) Fichiers clés (liste & brève description)
- `app/_layout.tsx` — enveloppe l'application (StatusBar + `CartProvider`).
- `app/context/CartContext.tsx` — contexte du panier avec fonctions `addToCart`, `removeFromCart`, `clearCart`, `getCartTotal`.
- `app/client/home.tsx` — page d'accueil, fetch `/products/featured`.
- `app/client/catalog.tsx` — catalogue, fetch `/products` (+category).
- `app/client/product.tsx` — page produit, sélection dates/taille, ajout au panier, toggle favoris.
- `app/client/cart.tsx` — page panier (FlatList), scan/import CIN (expo-image-picker), `submitOrder()` pour `POST /reservations` multipart.
- `app/client/favorites.tsx` — favorites listing.
- `app/admin/add-product.tsx` — admin product create/edit (FormData + is_featured support).
- `app/admin/reservations.tsx` — admin list reservations, `VOIR CIN` modal, `PUT /reservations/{id}/return`.
- `src/services/api.js` — axios instance (baseURL, auth interceptor, response handling).

## 8) Sécurité & confidentialité
- Les images de CIN contiennent des données personnelles sensibles (PII). Recommandations :
  - Transmettre en HTTPS uniquement (backend doit supporter TLS). Ne pas logguer l'image/local uri.
  - Backend : stocker ces images de manière sécurisée et restreindre l'accès (signed URLs, expirations, ou stockage chiffré).
  - Frontend : supprimer l'image locale après upload si nécessaire et éviter la persistance non-chiffrée.

## 9) Commandes pour développement & debugging
- Installer dépendances : `npm install` ou `yarn`.
- Lancer Metro / Expo (recommandé : LAN + clear cache) :
```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.103"
npx expo start --lan -c
```
- Si Metro indique des erreurs de cache : supprimer `.expo`, `.expo-shared`, `node_modules/.cache` puis relancer.

## 10) Tests manuels recommandés
- Auth : vérifier que `api` envoie Authorization header après login.
- Parcours Client : ajouter 2 produits au panier → `/client/cart` → importer CIN → `CONFIRMER LA DEMANDE` → vérifier payload `cin` + `items` côté backend.
- Parcours Admin : ouvrir réservations → Voir CIN modal → Marquer rendu (PUT) → vérifier rafraîchissement.

## 11) Améliorations & roadmap suggérées
- Persistance du panier via `AsyncStorage` (sur redémarrage), gestion edge-cases (duplicates, mises à jour prix).  
- UX : indicateurs de progression, toast au lieu d'Alert, previews zoomables pour la CIN (image zoom/gesture).  
- Tests : Introduire tests unitaires/vituels pour le `CartContext` et les utilitaires de FormData.  
- Sécurité : s'assurer que `cin_url` est restreinte (signed URL), token refresh automatique côté `src/services/api.js`.

---

Si vous voulez, je peux :
- Générer un `README.md` à la racine tiré de ce document (formaté),
- Ajouter la persistence du `CartContext` (AsyncStorage),
- Écrire des tests unitaires de base pour `CartContext` et `submitOrder()`.

Indiquez l'option souhaitée et je l'implémente.
