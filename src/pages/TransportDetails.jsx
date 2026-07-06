import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function TransportDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const data = state?.transport;
  const type = state?.type;

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  if (!data) {
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        No transport details available.
      </div>
    );
  }

  const handlePurchase = () => {
    if (purchased) return; // prevent multiple clicks
    setIsPurchasing(true);

    setTimeout(() => {
      setIsPurchasing(false);
      setPurchased(true);
      toast.success("🎉 Ticket purchased successfully!");
      navigate("/profile");
    }, 1500); // simulate API call delay
  };

  const handleApplyOnline = () => {
    const url = getDefaultUrl(type, data);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("No official website available.");
    }
  };

  const getDefaultUrl = (type, data) => {
    if (type === "flight") return "https://cdn.pixabay.com/photo/2024/03/01/19/57/airbus-8607152_1280.jpg";
    if (type === "train") return "https://www.irctc.co.in/";
    if (type === "bus") return "https://www.redbus.in/";
    return null;
  };

  // Mock booking reference
  const bookingRef = `REF${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-10 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 capitalize text-center text-gray-900">
        {type} Ticket Details
      </h2>

      {(data.flightImageUrl || data.imageUrl) && (
        <img
          src={data.flightImageUrl || data.imageUrl}
          alt={`${type} transport`}
          onError={(e) => (e.target.src = "/placeholder.jpg")}
          className="w-full h-64 md:h-80 rounded-lg object-cover shadow mb-6"
        />
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[320px] grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg shadow-inner text-gray-800 text-sm sm:text-base">
          <p><strong>From:</strong> {data.from || data.departure}</p>
          <p><strong>To:</strong> {data.to || data.destination}</p>
          <p><strong>Departure:</strong> {data.departureTime || "N/A"}</p>
          <p><strong>Arrival:</strong> {data.arrivalTime || "N/A"}</p>
          <p><strong>Duration:</strong> {data.duration || "N/A"}</p>
          <p><strong>Carrier:</strong> {data.airlineName || data.trainName || data.busCompany || "N/A"}</p>
          <p><strong>Flight/Train/Bus No:</strong> {data.flightNumber || data.trainNumber || data.busNumber || "N/A"}</p>
          <p><strong>Price:</strong> ₹{data.price || data.cost || "N/A"}</p>
          <p><strong>Booking Ref:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{bookingRef}</code></p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={handlePurchase}
          disabled={isPurchasing || purchased}
          className={`w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
          aria-label="Purchase ticket"
        >
          {isPurchasing ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : null}
          {purchased ? "Purchased" : "Purchase Ticket"}
        </button>

        <button
          onClick={handleApplyOnline}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
          aria-label="Apply online for ticket"
        >
          Apply Online
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto text-gray-600 hover:text-black underline text-sm"
          aria-label="Back to trip"
        >
          ← Back to Trip
        </button>
      </div>

      <p className="mt-6 text-center text-gray-500 text-xs italic max-w-md mx-auto">
        * Please read the <a href="/terms" className="underline hover:text-blue-600">terms & conditions</a> before purchasing. Refunds may be subject to carrier policies.
      </p>
    </div>
  );
}

export default TransportDetails;
