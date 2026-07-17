import React, { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PlaceCardItem = React.memo(({ place }) => {
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(
          `https://api.unsplash.com/search/photos`,
          {
            params: {
              query: place.placeName,
              per_page: 1,
            },
            headers: {
              Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
            },
          }
        );

        const fetchedImage = response.data.results[0]?.urls?.regular;
        if (fetchedImage) {
          setImageUrl(fetchedImage);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, [place.placeName]);

  const handleCardClick = () => {
    navigate(`/place/${encodeURIComponent(place.placeName)}`, { state: place });
  };

  const handleMapClick = (e) => {
    e.stopPropagation(); // Prevent card click
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      place.placeName
    )}`;
    window.open(mapUrl, "_blank");
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden h-[220px]">
        <img
          src={imageUrl || "/placeholder.jpg"}
          alt={place.placeName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-full shadow-sm">
            {place.bestTimeToVisit || place.timeToTravel}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h2 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
          {place.placeName}
        </h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {place.placeDetails}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {place.timeToTravel}
          </div>
          <Button
            size="sm"
            onClick={handleMapClick}
            className="rounded-full bg-gray-100 hover:bg-blue-500 hover:text-white text-gray-600 text-xs transition-all duration-300"
          >
            <FaMapLocationDot className="mr-1" />
            Map
          </Button>
        </div>
      </div>
    </div>
  );
});

export default PlaceCardItem;
