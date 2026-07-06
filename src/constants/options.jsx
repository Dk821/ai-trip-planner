export const SelectTravelesList = [
  {
    id: 1,
    title: "Just Me",
    desc: "A sole traveles in exploration",
    icon: "🙎",
    people: "1",
  },
  {
    id: 2,
    title: "A Couple",
    desc: "Two traveles in tandem",
    icon: "👩‍❤️‍👨",
    people: "2 People",
  },
  {
    id: 3,
    title: "Family",
    desc: "A group of fun loying ady",
    icon: "👨‍👩‍👧",
    people: "5 People",
  },
  {
    id: 4,
    title: "Friends",
    desc: "A bunch of thrill-seekes",
    icon: "👥",
    people: "5 to 10 people",
  },
];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Cheap",
    desc: "Stay conscious of costs",
    icon: "🙂",
  },
  {
    id: 2,
    title: "Moderate",
    desc: "Keep const on the average side",
    icon: "😃",
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Dont worry about cost",
    icon: "😁",
  },
];
export const AI_PROMPT = `Generate a detailed travel plan for the following:

- 🛫 Departure: {departure}
- 📍 Destination: {destination}
- 📆 Duration: {totalDays} days
- 📅 Start Date: {startDate}
- 👥 Traveler Type: {traveler}
- 💰 Budget: {budget}

Return the data as a **valid JSON** with the **root object named "trip"** that contains:

trip -> userSelection, tripPlan

tripPlan must contain:

- hotelOptions (an array with approximately 5 hotels)
- itinerary (day-wise itinerary array)
- transportOptions (flightInfo, trainInfo, busInfo arrays for the start date)
- localTouristGuides (an array of ~3 local guides)
- destinationGuide (info about culture, safety, food, etc.)

For the flightInfo array, provide realistic flight details **based on departure and destination locations**. Include:

- airlineName
- from
- to
- flightNumber
- departureTime
- arrivalTime
- duration
- price
- flightImageUrl (use this default image URL for flights: "https://example.com/default-flight-image.jpg")

Use the following JSON structure exactly:

{
 "tripPlan": {
  "hotelOptions": [ /* 5 hotel objects */ ],
  "itinerary": [ /* itinerary objects */ ],
  "transportOptions": {
    "flightInfo": [ /* flights */ ],
    "trainInfo": [ /* trains */ ],
    "busInfo": [ /* buses */ ]
  },
  "localTouristGuides": [
    {
      "name": "Guide Name",
      "languagesSpoken": ["English", "Hindi"],
      "areaOfExpertise": "Historical Sites / Food Tours / Nature Trails",
      "phoneNumber": "+91XXXXXXXXXX",
      "email": "guide@email.com",
      "availability": "9AM to 6PM",
      "guideImageUrl": "https://example.com/guide-image.jpg"
    }
  ],
  "destinationGuide": {
    "personalGuideInfo":["info1","info2","info3"],
    "overview": "Brief overview of the destination (history, culture, vibe)",
    "safetyTips": ["tip1", "tip2", "tip3"],
    "localCustoms": ["custom1", "custom2"],
    "localFood": ["dish1", "dish2", "dish3"],
    "topAttractions": ["place1", "place2", "place3"],
    "bestTimeToVisit": "e.g., October to March",
    "localTransportInfo": "How tourists usually travel (e.g., metro, tuk-tuk, buses)",
    "languageSpoken": "e.g., Hindi, English",
    "currency": "e.g., INR",
    "emergencyContacts": {
      "police": "100",
      "ambulance": "102",
      "touristHelpline": "1363"
    }
  }
 }
}

### Hotel details must include:
- hotelName
- hotelAddress
- price
- hotelImageUrl
- geoCoordinates (latitude & longitude)
- rating
- description
- bookingUrl

### Each itinerary item must include:
day: ,
plan:
- placeName
- placeDetails
- placeImageUrl (from Unsplash or Wikimedia only)
- planTime
- geoCoordinates (latitude & longitude)
- ticketPricing
- timeToTravel
- bestTimeToVisit
- entryFee (if applicable, otherwise "Free")
- longitude
- latitude
- travelTip (short useful advice for tourists)

### Transport options (flight/train/bus) must contain:
- name (e.g., airlineName or busName)
- from
- to
- number (e.g., flightNumber, trainNumber)
- departureTime
- arrivalTime
- duration
- price
- imageUrl (if flight, use default flight image URL)

Use **realistic and complete data**, no placeholders.
Use **real image URLs** only from public sources like Unsplash or Wikimedia.
`;
