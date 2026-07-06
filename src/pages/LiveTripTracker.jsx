import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import { db } from "../service/firebaseConfig";
import { doc, setDoc, updateDoc } from "firebase/firestore";

function LiveTripTracker({ userId, tripId }) {
  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [directions, setDirections] = useState([]);
  const watchId = useRef(null);

  // Fix leaflet icons
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  });

  // Voice speaking utility
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchNearbyPlaces = async (lat, lng) => {
    const dummy = [
      {
        name: "Hotel Paradise",
        type: "hotel",
        lat: lat + 0.002,
        lng: lng + 0.001,
      },
      {
        name: "City Hospital",
        type: "hospital",
        lat: lat - 0.002,
        lng: lng - 0.001,
      },
    ];
    setNearbyPlaces(dummy);
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setTracking(true);
    setPaused(false);

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ latitude, longitude });
        fetchNearbyPlaces(latitude, longitude);

        const docRef = doc(db, "liveTracking", `${userId}_${tripId}`);
        await setDoc(
          docRef,
          {
            userId,
            tripId,
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
            status: "tracking",
          },
          { merge: true }
        );
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true }
    );
  };

  const stopTracking = () => {
    navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setTracking(false);
    setPaused(false);
    setCurrentPosition(null);

    const docRef = doc(db, "liveTracking", `${userId}_${tripId}`);
    updateDoc(docRef, { status: "stopped" }).catch(console.error);
  };

  const handleStartDirections = () => {
    const dummySteps = [
      "Head north on Main Street",
      "Turn right onto Park Avenue",
      "Your destination will be on your left",
    ];

    setDirections(dummySteps);

    // Voice out each step with delay
    dummySteps.forEach((step, index) => {
      setTimeout(() => {
        speakText(step);
      }, index * 4000);
    });
  };

  const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) map.setView([center.latitude, center.longitude], 15);
    }, [center]);
    return null;
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Live Trip Tracker</h2>

      {currentPosition && (
        <MapContainer
          center={[currentPosition.latitude, currentPosition.longitude]}
          zoom={14}
          style={{ height: "300px", width: "100%" }}
        >
          <MapUpdater center={currentPosition} />
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[currentPosition.latitude, currentPosition.longitude]}
          >
            <Popup>You are here</Popup>
          </Marker>

          {nearbyPlaces.map((place, idx) => (
            <Marker key={idx} position={[place.lat, place.lng]}>
              <Popup>
                {place.name} ({place.type})
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      <div className="mt-4 flex gap-3 flex-wrap">
        {!tracking && !paused && (
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={startTracking}
          >
            Start Trip
          </Button>
        )}
        {tracking && (
          <Button
            className="bg-yellow-500 hover:bg-yellow-600"
            onClick={stopTracking}
          >
            Stop Trip
          </Button>
        )}
        {currentPosition && (
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleStartDirections}
          >
            Start Direction
          </Button>
        )}
      </div>

      {directions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Directions:</h4>
          <ul className="list-disc ml-6">
            {directions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LiveTripTracker;
