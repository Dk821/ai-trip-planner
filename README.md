# 🌍 TravelAI – AI-Powered Trip Planner

An intelligent travel planning application that generates personalized trip itineraries using AI. Users input their origin, destination, budget, and preferences — and the app builds a complete day-by-day plan including hotels, places to visit, transport options, and real-time map routing.



## 🧠 How It Works

1. **User signs in** via Google OAuth (Firebase Auth).
2. **Creates a trip** by filling a form: origin, destination, dates, budget, number of travelers, and travel style (adventure, luxury, budget, etc.).
3. **AI generates an itinerary** — a prompt is sent to Google Gemini 2.5 Flash with the user's inputs, and the AI returns a structured JSON plan covering each day: hotels, places, activities, and transport.
4. **Trip is saved** to Firebase Firestore and displayed on a detailed trip view page with interactive maps, hotel/place cards, and transport listings.
5. **User can track the trip live** using Leaflet routing maps, chat with an AI assistant for travel tips, and manage everything from their profile or the admin panel.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **AI Trip Generation** | Google Gemini 2.5 Flash creates structured day-by-day itineraries from user inputs |
| **Google Places Autocomplete** | Real-time suggestions for origin and destination cities |
| **Hotel Cards** | Each hotel shows images, rating, price, and a link to booking |
| **Place Cards** | Tourist attractions with descriptions, photos, and maps |
| **Transport Options** | Lists available transport between locations with booking links |
| **Live Trip Map** | Leaflet-based routing map showing the full journey route |
| **AI Travel Chat** | Multi-language assistant with voice input/output for travel questions |
| **Live Weather** | Landing page shows real-time weather for the user's location |
| **Travel Quotes** | Random inspirational quotes fetched on landing |
| **Tour Offers** | Real-time offers from Firestore with notification bell |
| **Dark Mode** | System-aware theme toggle persistent across sessions |
| **Google Sign-In** | One-click authentication via Firebase Auth |
| **Profile Management** | User profile with photo, name, and trip history |
| **Admin Panel** | Admin users can view/edit all trips, manage offers |
| **Payment Page** | Mock payment flow for trip checkout |
| **Destination Guides** | Curated guides with local tips and recommendations |

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18 + Vite 6 | SPA build tooling and development |
| **Routing** | React Router 7 | Client-side page routing |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Utility-first CSS and component library |
| **Animation** | Framer Motion 12 | Scroll and mount animations |
| **AI Engine** | Google Gemini 2.5 Flash | Generates trip itineraries from prompts |
| **Database** | Firebase Firestore | Stores trips, users, offers, and bookings |
| **Auth** | Firebase Auth + Google OAuth | User authentication |
| **Maps** | Leaflet + React-Leaflet | Interactive maps and routing |
| **Places API** | Google Places API | Address autocomplete and place data |
| **Images** | Unsplash, Pexels, Pixabay APIs | Hotel, place, and destination photos |
| **Weather** | OpenWeather API + ipapi.co | Real-time weather on landing page |
| **Chat** | Google Gemini | AI travel assistant with voice I/O |
| **Notifications** | Twilio (optional) | Call-based notifications |
| **Charts** | Recharts + ApexCharts | Data visualization in admin panel |
| **Icons** | React Icons + Lucide | UI icon set |

---

## 🏗 Architecture & Data Flow

```
User
  │
  ▼
Google Sign-In ──► Firebase Auth ──► User Session
  │
  ▼
Create Trip Form ──► Google Places Autocomplete (origin/destination)
  │
  ▼
AI Prompt ──► Google Gemini 2.5 Flash ──► Structured JSON Itinerary
  │
  ▼
Firebase Firestore ──► Trips Collection
  │
  ▼
Trip View Page ──► Hotels │ Places │ Transport │ Map
  │
  ├── Live Trip Tracker (Leaflet Routing)
  ├── AI Chat Assistant (Gemini)
  ├── Profile / Settings
  └── Admin Panel (manage all)
```

**Key data flow:**

- **Trip Creation:** Form inputs → Gemini prompt → Gemini returns JSON → parsed and saved to Firestore.
- **Image fetching:** When displaying hotels/places, the app queries Unsplash/Pexels/Pixabay using the place name.
- **Live tracking:** Leaflet Routing Machine plots waypoints from the trip's place list on an interactive map.
- **Real-time offers:** Firestore `onSnapshot` listener on `TourOffers` collection updates the notification bell in the header.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── custom/
│   │   ├── Header.jsx        # Navigation bar, auth, dark mode, notifications
│   │   └── Hero.jsx          # Landing page hero with weather, quotes, CTA
│   └── ui/                   # shadcn/ui primitives (button, dialog, input, sonner)
│
├── constants/
│   └── options.jsx           # Travel styles, budget ranges, prompt templates
│
├── create-trip/
│   └── index.jsx             # Trip creation form → sends prompt to Gemini
│
├── lib/
│   └── utils.js              # cn() utility for Tailwind class merging
│
├── pages/                    # Standalone route pages
│   ├── TravelAIChat.jsx      # AI assistant with voice
│   ├── TransportList.jsx     # All transport options
│   ├── TransportDetails.jsx  # Single transport detail
│   ├── StartTripMap.jsx      # Map to begin trip
│   ├── PlaceDetail.jsx       # Place information page
│   ├── PaymentPage.jsx       # Mock checkout
│   ├── LiveTripTracker.jsx   # Real-time map tracker
│   └── HotelDetail.jsx       # Hotel booking page
│
├── service/                  # API and backend configs
│   ├── firebaseConfig.jsx    # Firebase init, auth helpers, Firestore refs
│   ├── GlobalApi.jsx         # Axios client for image APIs (Unsplash, Pexels, Pixabay)
│   ├── AIModal.jsx           # Gemini API prompt builder and response parser
│   └── twilio-call-server.js # Twilio call handling (server-side)
│
├── viewTrip/
│   ├── [tripId]/
│   │   └── index.jsx         # Trip detail page by ID
│   └── components/           # Trip view sub-components
│       ├── Hotels.jsx              # Hotel cards section
│       ├── PlacesToVisit.jsx       # Place cards section
│       ├── PlaceCardItem.jsx       # Individual place card
│       ├── TransportOptions.jsx    # Transport listings
│       ├── InfoSection.jsx         # Trip metadata (dates, budget, etc.)
│       ├── EditTrip.jsx            # Edit trip details
│       ├── RoutingMachine.jsx      # Leaflet routing integration
│       ├── TouristGuide.jsx        # Guide recommendations
│       ├── DestinationGuide.jsx    # City-specific guide
│       ├── Profile.jsx             # User profile editor
│       ├── AdminPage.jsx           # Admin management panel
│       ├── CustomAddressAutocomplete.jsx # Google Places input wrapper
│       └── Footer.jsx              # Page footer
│
├── App.jsx                  # Root component with routing
├── Layout.jsx               # Shared layout (Header + Outlet)
├── main.jsx                 # Vite entry point
├── index.css                # Global styles, Tailwind, CSS variables
└── App.css                  # Legacy Tailwind directives
```

---

## 📄 Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Hero | Landing page with animated hero, weather, quotes, features |
| `/create-trip` | create-trip/index.jsx | AI trip generation form |
| `/my-trips` | (page) | List of user's saved trips |
| `/view-trip/:tripId` | viewTrip/[tripId]/index.jsx | Full itinerary view |
| `/place-detail/:id` | PlaceDetail | Tourist place information |
| `/hotel-detail/:id` | HotelDetail | Hotel booking details |
| `/transport` | TransportList | All transport options |
| `/transport-details/:id` | TransportDetails | Single transport info |
| `/live-tracker` | LiveTripTracker | Real-time map tracking |
| `/ai-chat` | TravelAIChat | AI travel assistant with voice |
| `/start-trip` | StartTripMap | Begin trip map view |
| `/tour-offers` | (page) | Active tour promotions |
| `/guides` | (page) | Travel guides listing |
| `/support` | (page) | Help and support |
| `/payment` | PaymentPage | Checkout page |
| `/profile` | Profile | User profile management |
| `/settings` | (page) | App settings |
| `/admin` | AdminPage | Admin panel |

---

## 🧩 Key Components

### Header (`components/custom/Header.jsx`)
- Sticky nav bar with logo, navigation links, Google Sign-In button/user dropdown
- Dark mode toggle with system preference detection
- Notification bell with live Firestore listener on `TourOffers`
- Mobile responsive hamburger menu

### Hero (`components/custom/Hero.jsx`)
- Full-viewport animated hero with background image and gradient overlay
- Framer Motion entrance animations
- Live weather via OpenWeather API (auto-detects city via ipapi.co)
- Random travel quote from ZenQuotes API
- Feature badges, stats row, and CTA button
- Below-fold features section (4 cards) and trust bar

### Trip Creation (`create-trip/index.jsx`)
- Multi-field form: origin, destination, start/end dates, budget, travelers, travel style
- Google Places autocomplete on city fields
- Submits prompt to Gemini API via `AIModal.jsx`
- Saves returned JSON itinerary to Firestore

### Trip View (`viewTrip/[tripId]/index.jsx`)
- Displays full trip: info header, hotel cards, place cards, transport options
- Leaflet map with routing between all places
- Edit trip functionality
- Destination guide and tourist guide sections

### AI Chat (`pages/TravelAIChat.jsx`)
- Conversational interface with Gemini
- Voice input (browser speech recognition) and voice output (speech synthesis)
- Multi-language support

---

## 🔐 Environment Variables

```env
# ─── Firebase ───────────────────────────────────
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# ─── Google Gemini AI ───────────────────────────
VITE_GEMINI_API_KEY=

# ─── Google Places API ─────────────────────────
VITE_GOOGLE_PLACES_API_KEY=

# ─── Image APIs (for hotel/place photos) ────────
VITE_UNSPLASH_ACCESS_KEY=
VITE_PEXELS_API_KEY=
VITE_PIXABAY_API_KEY=

# ─── Weather (landing page) ─────────────────────
VITE_OPENWEATHER_API_KEY=
VITE_IPAPI_URL=https://ipapi.co/json/

# ─── Twilio (optional call feature) ─────────────
VITE_TWILIO_ACCOUNT_SID=
VITE_TWILIO_AUTH_TOKEN=
VITE_TWILIO_PHONE_NUMBER=
VITE_TWILIO_TWIML_URL=

# ─── Admin ──────────────────────────────────────
VITE_ADMIN_EMAIL=
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs at `http://localhost:5173`.

> **Note:** You need valid API keys in `.env` for full functionality. The app will still load without them, but AI generation, maps, and images will not work.
