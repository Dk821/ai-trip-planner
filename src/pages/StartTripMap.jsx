import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import RoutingMachine from "../viewTrip/components/RoutingMachine";

import busIconPng from "/bus.png";
import trainIconPng from "/train.png";
import airportIconPng from "/airport.png";
import markerIconPng from "leaflet/dist/images/marker-icon.png";

const currentLocationIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const busIcon = new L.Icon({
  iconUrl: busIconPng,
  iconSize: [40, 30],
  iconAnchor: [15, 30],
});

const trainIcon = new L.Icon({
  iconUrl: trainIconPng,
  iconSize: [40, 30],
  iconAnchor: [15, 30],
});

const airportIcon = new L.Icon({
  iconUrl: airportIconPng,
  iconSize: [40, 30],
  iconAnchor: [15, 30],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const policeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2991/2991106.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const foodIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const hotelIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/139/139899.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

async function fetchNearbyTransport(lat, lng, type) {
  const radius = 10000;
  let query = `[out:json];(`;

  switch (type) {
    case "hospital":
      query += `node["amenity"="hospital"](around:${radius},${lat},${lng});`;
      break;
    case "police":
      query += `node["amenity"="police"](around:${radius},${lat},${lng});`;
      break;
    case "food":
      query += `node["amenity"~"restaurant|cafe"](around:${radius},${lat},${lng});`;
      break;
    case "hotel":
      query += `node["tourism"="hotel"](around:${radius},${lat},${lng});`;
      break;
    case "bus":
      query += `node["highway"="bus_stop"](around:${radius},${lat},${lng});`;
      break;
    default:
      return [];
  }

  query += `);out body;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.elements.map((el) => ({
    id: el.id,
    lat: el.lat,
    lng: el.lon,
    name: el.tags?.name || "Place",
    type: type,
  }));
}

const speakText = (text) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }
};

function StartTripMap() {
  const [isVoiceNavigationActive, setIsVoiceNavigationActive] = useState(false);
  const [routingControl, setRoutingControl] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [routeSummary, setRouteSummary] = useState(null);
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);
  const { state } = useLocation();
  const itinerary = state?.itinerary || [];
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [nearbyTransports, setNearbyTransports] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyType, setEmergencyType] = useState(null);
  const mapRef = useRef(null);
  // --- ADD call UI states here ---
  const [callNumber, setCallNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  // --- ADD your handleMakeCall function here ---
  const handleMakeCall = async () => {
    if (!callNumber) {
      alert("Please enter a phone number to call");
      return;
    }
    try {
      setIsCalling(true);
      const res = await axios.post("http://localhost:5000/api/call", {
        to: callNumber,
      });
      alert("Call started! SID: " + res.data.sid);
    } catch (err) {
      console.error("Call error:", err);
      alert("Call failed");
    } finally {
      setIsCalling(false);
    }
  };
  const handleEmergency = () => {
    setShowEmergency(true);
  };

  const handleEmergencyTypeSelect = async (type) => {
    setEmergencyType(type);
    if (currentLocation) {
      const results = await fetchNearbyTransport(
        currentLocation.lat,
        currentLocation.lng,
        type
      );
      setNearbyTransports(results);
      speakText(`Nearest ${type} locations have been marked on the map.`);
      setShowEmergency(false);
    }
  };

  useEffect(() => {
    if (!isVoiceNavigationActive) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCurrentLocation(newLoc);
        mapRef.current?.flyTo(newLoc, 17);
      },
      (err) => console.error("Error watching position:", err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isVoiceNavigationActive]);

  useEffect(() => {
    const coords = [];
    itinerary.forEach((day) => {
      (day.plan || []).forEach((item) => {
        if (
          typeof item.latitude === "number" &&
          typeof item.longitude === "number"
        ) {
          coords.push({
            name: item.name || "Destination",
            lat: item.latitude,
            lng: item.longitude,
          });
        }
      });
    });
    setDestinations(coords);
  }, [itinerary]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(loc);
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  const center = currentLocation ||
    destinations[0] || { lat: 20.5937, lng: 78.9629 };
  const allWaypoints = currentLocation
    ? [currentLocation, ...destinations]
    : destinations;

  const handleLiveInstruction = () => {
    if (!currentLocation || destinations.length === 0) return;
    speakText("Starting navigation from your current location.");
    destinations.forEach((dest, i) => {
      setTimeout(() => {
        speakText(`Next stop: ${dest.name}`);
      }, i * 5000);
    });
  };

  return (
    <div className="relative h-screen">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%" }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {currentLocation && (
          <Marker position={currentLocation} icon={currentLocationIcon}>
            <Popup>📍 Your Current Location</Popup>
          </Marker>
        )}

        {destinations.map((dest, idx) => (
          <Marker
            key={`dest-${idx}`}
            position={[dest.lat, dest.lng]}
            icon={destinationIcon}
          >
            <Popup>{dest.name}</Popup>
          </Marker>
        ))}

        {nearbyTransports.map((place, idx) => {
          let iconToUse;
          switch (place.type) {
            case "hospital":
              iconToUse = hospitalIcon;
              break;
            case "police":
              iconToUse = policeIcon;
              break;
            case "food":
              iconToUse = foodIcon;
              break;
            case "hotel":
              iconToUse = hotelIcon;
              break;
            case "bus":
              iconToUse = busIcon;
              break;
            case "railway":
              iconToUse = trainIcon;
              break;
            case "aeroway":
              iconToUse = airportIcon;
              break;
            default:
              iconToUse = busIcon;
          }

          return (
            <Marker
              key={`tp-${idx}`}
              position={[place.lat, place.lng]}
              icon={iconToUse}
              eventHandlers={{
                click: () => {
                  speakText(`Navigating to ${place.name}`);
                  if (currentLocation) {
                    setDestinations([
                      { name: place.name, lat: place.lat, lng: place.lng },
                    ]);
                    setNearbyTransports([]);
                  }
                },
              }}
            >
              <Popup>
                📍 {place.name} <br />
                Type: {place.type}
                <br />
                <em>Click marker to navigate</em>
              </Popup>
            </Marker>
          );
        })}

        <RoutingMachine
          waypoints={allWaypoints}
          onRouteFound={(summary, steps) => {
            setRouteSummary(summary);
            setRouteSteps(steps);
            setShowDirectionsPanel(true);
            if (isVoiceNavigationActive) {
              steps.forEach((step, idx) => {
                setTimeout(() => speakText(step), idx * 4000);
              });
            }
          }}
        />
      </MapContainer>

      {showDirectionsPanel && routeSteps.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 max-h-56 overflow-auto bg-white border-t z-[1000] p-4">
          <h3 className="font-semibold mb-2">🧭 Turn-by-turn Directions</h3>
          <p className="text-sm text-gray-600 mb-2">
            Distance: {routeSummary?.totalDistance} | Duration:{" "}
            {routeSummary?.totalTime}
          </p>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            {routeSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="absolute top-4 right-4 flex flex-col gap-3 z-[1000]">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded shadow"
          onClick={handleEmergency}
        >
          🚨 Emergency
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          onClick={() => setShowHelp(true)}
        >
          📞 Call / Query
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
          onClick={handleLiveInstruction}
        >
          🔊 Live Instruction
        </button>
        <button
          className="bg-orange-600 text-white px-4 py-2 rounded shadow"
          onClick={() => {
            setIsVoiceNavigationActive(true);
            mapRef.current?.setZoom(17);
          }}
        >
          🗺️ Show Directions
        </button>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded shadow"
          onClick={() => {
            if (currentLocation) {
              speakText("Recentering to your current location.");
              mapRef.current?.flyTo(currentLocation, 17);
            }
          }}
        >
          🎯 Recenter
        </button>
        <div className="mt-3 border-t pt-3">
          <label htmlFor="callNumber" className="block mb-1 font-semibold">
            📱 Call a Number
          </label>
          <input
            id="callNumber"
            type="text"
            placeholder="+91xxxxxxxxxx"
            value={callNumber}
            onChange={(e) => setCallNumber(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
          />
          <button
            onClick={handleMakeCall}
            disabled={isCalling}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isCalling ? "Calling..." : "Make Call"}
          </button>
        </div>
      </div>

      {showEmergency && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000]">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md text-center">
            <h3 className="text-lg font-semibold mb-3">
              🚨 What help do you need?
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => handleEmergencyTypeSelect("hospital")}
              >
                🏥 Hospital
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => handleEmergencyTypeSelect("police")}
              >
                👮 Police
              </button>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                onClick={() => handleEmergencyTypeSelect("food")}
              >
                🍽️ Food
              </button>
              <button
                className="bg-purple-500 text-white px-4 py-2 rounded"
                onClick={() => handleEmergencyTypeSelect("hotel")}
              >
                🏨 Hotel
              </button>
              <button
                className="bg-teal-500 text-white px-4 py-2 rounded"
                onClick={() => handleEmergencyTypeSelect("bus")}
              >
                🚌 Bus Stop
              </button>
            </div>
            <button
              className="mt-4 text-sm text-gray-600 underline"
              onClick={() => setShowEmergency(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000]">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              📞 Emergency Contacts
            </h3>

            <ul className="space-y-3 text-left">
              {[
                { name: "Travel Agent", number: "+91-9876543210" },
                { name: "Local Police", number: "100" },
                { name: "Ambulance", number: "102" },
                { name: "Support Team", number: "+91-9444234878" },
              ].map((contact, index) => (
                <li key={index}>
                  <a
                    href={`tel:${contact.number}`}
                    className="block bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
                  >
                    {contact.name} - {contact.number}
                  </a>
                </li>
              ))}
            </ul>

            <button
              className="mt-4 bg-gray-800 text-white px-4 py-2 rounded w-full"
              onClick={() => setShowHelp(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}7
    </div>
  );
}

export default StartTripMap;
