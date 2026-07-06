# AI Travel Planner

An AI-powered travel planning app built with React + Vite. Users can generate personalized trip itineraries, explore destinations, book hotels and transport, and get AI travel assistance.

## Features

- AI-generated trip plans via Google Gemini
- Google Places autocomplete for departure/destination
- Hotel, transport, and place details with images
- Live trip tracker with map routing
- Multi-language AI travel chat with voice input/output
- Google Sign-In and manual login
- Admin panel to manage all trips
- Payment page integration
- Image fetching from Unsplash, Pexels, and Pixabay

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **AI:** Google Gemini 2.5 Flash
- **Database:** Firebase Firestore
- **Auth:** Firebase Auth + Google OAuth
- **APIs:** Google Places, Unsplash, Pexels, Pixabay, Twilio

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Google Gemini AI
VITE_GEMINI_API_KEY=

# Google Places API
VITE_GOOGLE_PLACES_API_KEY=

# Unsplash API (place/hotel images)
VITE_UNSPLASH_ACCESS_KEY=

# Pexels API (destination/offer images)
VITE_PEXELS_API_KEY=

# Pixabay API (transport images)
VITE_PIXABAY_API_KEY=

# Twilio (call feature - optional)
VITE_TWILIO_ACCOUNT_SID=
VITE_TWILIO_AUTH_TOKEN=
VITE_TWILIO_PHONE_NUMBER=
VITE_TWILIO_TWIML_URL=

# Admin email for admin panel access
VITE_ADMIN_EMAIL=
```

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Project Structure

```
src/
├── components/       # Reusable UI components
├── constants/        # Options, prompts, static data
├── create-trip/      # Trip creation form page
├── lib/              # Utility functions
├── pages/            # Route pages (PlaceDetail, HotelDetail, etc.)
├── service/          # Firebase, Gemini, API configs
└── viewTrip/         # Trip view, itinerary, admin page
```
