import React from "react";
import { useNavigate } from "react-router-dom";
import PlaceCardItem from "./PlaceCardItem";

function PlacesToVisit({ trip }) {
  const navigate = useNavigate();
  const itinerary = trip?.tripData?.trip?.tripPlan?.itinerary;

  const handleStartTrip = () => {
    navigate("/start-trip", { state: { itinerary } });
  };

  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div>
        <h2 className="font-bold text-lg">Places to Visit</h2>
        <p className="text-sm text-gray-500 mt-2">No itinerary available.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg">Places to Visit</h2>
        <button
          onClick={handleStartTrip}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🚀 Start Trip
        </button>
      </div>

      {itinerary.map((dayItem, dayIndex) => (
        <div key={dayIndex} className="mt-5">
          <h2 className="font-bold text-lg">Day: {dayItem.day}</h2>
          <div className="grid grid-cols-3 gap-5 mt-2">
            {Array.isArray(dayItem.plan) && dayItem.plan.length > 0 ? (
              dayItem.plan.map((activity, activityIndex) => (
                <div key={activityIndex}>
                  <h3 className="font-medium text-sm text-orange-600">
                    {activity.planTime}
                  </h3>
                  <PlaceCardItem place={activity} />
                </div>
              ))
            ) : (
              <p>No activities planned for this day.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlacesToVisit;
