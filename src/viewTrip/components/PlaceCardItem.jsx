import React, { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PlaceCardItem({ place }) {
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
      className="border rounded-xl p-3 mt-2 hover:scale-105 transition-all hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <img
        src={imageUrl || "/placeholder.jpg"}
        alt={place.placeName}
        className="w-full h-[300px] rounded-lg object-cover mb-3"
      />

      <h2 className="font-bold text-lg">{place.placeName}</h2>
      <p className="text-sm text-gray-500">{place.placeDetails}</p>
      <p className="mt-2 text-sm">⏰ {place.timeToTravel}</p>

      <div className="mt-3">
        <Button size="sm" onClick={handleMapClick}>
          <FaMapLocationDot className="mr-1" />
          Map
        </Button>
      </div>
    </div>
  );
}

export default PlaceCardItem;
