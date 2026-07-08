import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../service/firebaseConfig";
import { toast } from "sonner";
import DestinationGuide from "../components/DestinationGuide";

import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import PlacesToVisit from "../components/PlacesToVisit";
import Footer from "../components/Footer";
import TransportOptions from "../components/TransportOptions";
import TravelAIChat from "../../pages/TravelAIChat";
import LiveTripTracker from "../../pages/LiveTripTracker";
import TouristGuide from "../components/TouristGuide";

function ViewTrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const GetTripData = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "AiTravel", tripId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTrip(docSnap.data());
        } else {
          toast.error("No trip found!");
          setError("No trip found");
        }
      } catch (err) {
        console.error("Error fetching trip data:", err);
        toast.error("Failed to fetch trip data.");
        setError("Failed to fetch trip data");
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    if (tripId) {
      GetTripData();
    }
  }, [tripId]);

  if (loading) {
    return (
      <div className="p-10 text-center text-lg font-semibold text-gray-600">
        Loading trip details...
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        {error || "Trip not available"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-100">
      <div className="mx-auto p-6 md:p-10">
        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-10 space-y-10">
          {/* Information Section */}
          <InfoSection trip={trip} />
          {/* Transport Section */}
          <TransportOptions trip={trip} />
          {/* Hotel Section */}
          <Hotels trip={trip} />
          {/* Day-wise plan or places */}
          <PlacesToVisit trip={trip} />
          <TouristGuide
            guides={trip.tripData.trip.tripPlan.localTouristGuides}
          />
          <DestinationGuide
            guide={trip.tripData.trip.tripPlan.destinationGuide}
          />
          <LiveTripTracker userId={trip.userId} tripId={tripId} />{" "}
          {/* Travel AI Assistant */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              🤖 Need Help Planning?
            </h2>
            <p className="text-gray-600 mb-4">
              Chat with our AI assistant to ask anything about your trip.
            </p>
            <TravelAIChat trip={trip} />
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-16">
          <Footer trip={trip} />
        </div>
      </div>
    </div>
  );
}

export default ViewTrip;
