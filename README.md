# MyApp - AI-Powered Movie Companion 🎬🤖

A modern React Native app combining movie discovery with an intelligent AI assistant using TMDB + OpenAI.

---

## 📱 About

MyApp is your personal movie companion that:
- Suggests movies based on taste
- Remembers chats for 24 hours
- Gives exact release dates
- Learns your favorite genres
- Lets you favorite movies from AI chat

Built with React Native + TypeScript + Redux + Node.js.

---

## 🎬 Movie Discovery

- 🔥 Popular  
- 🎬 Now Playing  
- 📅 Upcoming  
- ⭐ Top Rated  

Features:
- Smart search
- Genre filters
- Ratings & descriptions
- Favorites system
- Persistent storage

---

## 🤖 AI Companion

You can ask:
- "Suggest rom-com movies"
- "When is Avatar 3 releasing?"
- "Pick something for tonight"
- "Best action movies"

AI Features:
- ✅ 24-hour memory
- ✅ Exact release dates
- ✅ Personalized recommendations
- ✅ Smart favorite filtering
- ✅ AI won’t suggest already-favorited movies
- ✅ Quick suggestion buttons

---
## 🎭 Theatre Finder

Find nearby movie theaters with ease:
- 📍 Location-based search using GPS
- 🔢 Zip code search option
- 🗺️ Integration with Google Places API
- 📏 Distance calculation from your location
- 🧭 One-tap directions via Google Maps/Apple Maps
- ↻ Pull to refresh functionality
- 🎯 Filters theaters within 20-mile radius

Features:
- Automatic location permission handling
- Real-time theater information
- Sorted by distance (nearest first)
- Direct navigation integration
- Cross-platform map support (iOS/Android)

---
## 🛠 Tech Stack

Frontend:
- React Native
- TypeScript
- Redux Toolkit
- React Navigation
- AsyncStorage

Backend:
- Node.js
- Express
- OpenAI API
- TMDB API

---

## System Architecture Overview

```
+---------------------+         +------------------------+
|  Google/Apple SSO   |         |   Movie Data APIs      |
|    (SSO Provider)   |         |   (External/Backend)   |
+----------+----------+         +-----------+------------+
           |                                ^
           v                                |
+---------------------+         +-----------+------------+
|      Firebase       |<------->| movie-companion-backend |
|   (Auth & SSO)      |         |   (movie data, etc.)    |
+----------+----------+         +-----------+------------+
           |                                ^
           v                                |
+---------------------+         +-----------+------------+
|    Mobile App       |<------->|      auth-server        |
|   (React Native)    |  REST   |  (Node.js/Express)      |
|                     |  APIs   | (Token validation,      |
+----------+----------+         |  user, favorites,       |
           |                    |  reminders, etc.)       |
           +------------------->|                        |
                                +------------------------+
```

- **Mobile App**: React Native client, authenticates via Firebase SSO, communicates with backend via REST APIs.
- **Firebase**: Handles authentication (Google/Apple SSO), issues tokens.
- **auth-server**: Node.js/Express backend, validates tokens, manages user data, favorites, reminders.
- **movie-companion-backend**: Provides movie data, interacts with external movie APIs.
- **Movie Data APIs**: External sources for movie information.

**Data Flow:**
- User logs in via SSO (Google/Apple) → Firebase issues token → App uses token for API calls → auth-server validates token and serves data → movie-companion-backend fetches movie info as needed.

<img src="screenshots/architecture.png" width="250" alt="Architecture">

## 🚀 Running the App

Install:
```bash
yarn install
cd ios && pod install && cd ..
```

---

## 📸 Screenshots

### Authentication & Dashboard
<img src="screenshots/auth-1-location-access.png" width="250" alt="Location Access Dialog">  <img src="screenshots/auth-2-login-page.png" width="250" alt="Login Page"> <img src="screenshots/auth-3-favs-dashboard.png" width="250" alt="Favs Dashboard">

### AI Movie Companion
<img src="screenshots/ai-1-companion-helper.png" width="250" alt="Movie Companion Helper">  <img src="screenshots/ai-2-companion-prompt.png" width="250" alt="Movie Companion Prompt"> <img src="screenshots/ai-3-recommendations.png" width="250" alt="Movie Comp Recommendations">  

<img src="screenshots/ai-4-companion-fav.png" width="250" alt="Movie Companion Fav">  <img src="screenshots/ai-5-fav-added.png" width="250" alt="Movie Companion Fav Added">  <img src="screenshots/ai-6-movie-list.png" width="250" alt="Movie List">

### Movie Details & Trailers
<img src="screenshots/movie-1-detail-screen.png" width="250" alt="Movie Detail Screen">  <img src="screenshots/movie-2-trailer-linking.png" width="250" alt="Trailer Linking">  <img src="screenshots/movie-3-linking-yt.png" width="250" alt="Linking YT">

### Theatre Finder
<img src="screenshots/theatre-1-tab-menu.png" width="250" alt="Theatres Tab Menu">  <img src="screenshots/theatre-2-zip-modal.png" width="250" alt="Zip Modal">  <img src="screenshots/theatre-3-nearest-theatres.png" width="250" alt="Nearest Theatres">

### Additional Features
<img src="screenshots/additional-1-directions-matrix.png" width="250" alt="Directions Matrix"> <img src="screenshots/additional-2-fav-sorted-year.png" width="250" alt="Fav Sorted By Year">  <img src="screenshots/additional-3-favs-sorted-title.png" width="250" alt="Favs Sorted By Title">

### Dark Mode & User Management
<img src="screenshots/darkmode-1-toggle.png" width="250" alt="Dark Mode / Light Mode Toggle">  <img src="screenshots/darkmode-2-signup.png" width="250" alt="Sign Up">  

### Feedback
<img src="screenshots/feedback.png" width="250" alt="Feedback">

### Backend (MongoDB)
<img src="screenshots/backend-3-users-db.png" width="750" alt="Users">
<img src="screenshots/backend-2-favorites.png" width="750" alt="Favorites">








