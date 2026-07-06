import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";

function HotelDetail() {
  const { hotelName } = useParams();
  const { state: hotel = {} } = useLocation();

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const encodedQuery = encodeURIComponent(`${hotelName} hotel`); // ensure safe API request
        const res = await axios.get("https://api.unsplash.com/search/photos", {
          params: {
            query: encodedQuery,
            per_page: 1,
          },
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
          },
        });

        const fetchedUrl = res.data?.results?.[0]?.urls?.regular;

        if (fetchedUrl) {
          setImageUrl(fetchedUrl);
        } else {
          console.warn(`No image found for query: ${hotelName}`);
        }
      } catch (err) {
        console.error("Image load error for:", hotelName, err);
      }
    };

    if (hotelName?.trim()) {
      fetchImage();
    }
  }, [hotelName]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="w-full h-[400px] rounded-xl overflow-hidden mb-6">
        <img
          src={imageUrl || hotel.hotelImageUrl || "/placeholder.jpg"}
          alt={hotelName}
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        {hotel.hotelName || hotelName}
      </h1>
      <p className="text-gray-500 mb-1">📍 {hotel.hotelAddress}</p>
      <p className="text-yellow-500 mb-4">⭐ {hotel.rating} / 5</p>

      <div className="space-y-4 text-gray-700">
        <p>
          <strong>💰 Price:</strong> {hotel.price || "N/A"}
        </p>
        <p>
          <strong>📝 Description:</strong>{" "}
          {hotel.description || "No description available."}
        </p>
        <p>
          <strong>🌍 Coordinates:</strong>{" "}
          {hotel.geoCoordinates
            ? `${hotel.geoCoordinates.latitude}, ${hotel.geoCoordinates.longitude}`
            : "Not available"}
        </p>
      </div>

      <div className="mt-6 flex  sm:flex-row sm:items-center gap-4">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            hotel.hotelName + ", " + hotel.hotelAddress
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          View on Google Maps
        </a>

        {/* Apply/Book Button */}
        <a
          href={hotel.bookingUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 rounded text-white transition ${
            hotel.bookingUrl
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {hotel.bookingUrl ? "Apply Online" : "Apply Option Not Available"}
        </a>
      </div>

      <div className="mt-10">
        <Link to="/" className="text-blue-600 underline hover:text-blue-800">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default HotelDetail;
