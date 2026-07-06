import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../service/firebaseConfig"; // adjust path if needed
import { doc, getDoc } from "firebase/firestore";

function ViewTrip() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchTrip = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "AiTravel", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTrip(docSnap.data());
        } else {
          alert("Trip not found.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
        alert("Failed to load trip data.");
        navigate("/");
      }
      setLoading(false);
    };
     
    fetchTrip();
  }, [id, navigate]);
        
  if (loading) return <p>Loading trip details...</p>;

  if (!trip) return <p>No trip data available.</p>;

  // You can display the trip nicely here, for example:
  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-4">Trip Details</h1>
      <h2 className="text-xl font-semibold mb-2">
        Trip to {trip.UserSelection?.location || "Unknown Location"}
      </h2>
      <p><strong>Duration:</strong> {trip.UserSelection?.noOfDays || "N/A"} days</p>
      <p><strong>Budget:</strong> {trip.UserSelection?.budget || "N/A"}</p>
      <p><strong>Travelers:</strong> {trip.UserSelection?.traveler || "N/A"}</p>

      <h3 className="mt-6 text-2xl font-semibold">Trip Plan</h3>
      <pre className="whitespace-pre-wrap mt-2 bg-gray-50 p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(trip.tripData, null, 2)}
      </pre>
    </div>
  );
}

export default ViewTrip;
