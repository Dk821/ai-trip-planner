import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FiShare,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiMapPin,
  FiClock,
} from "react-icons/fi";
import axios from "axios";

const InfoSection = React.memo(({ trip }) => {
  const [photoUrl, setPhotoUrl] = useState("/Travel.jpg");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (trip?.UserSelection?.destination) {
      fetchPhoto(trip.UserSelection.destination);
    }
  }, [trip]);
  useEffect(() => {
    if (!trip?.UserSelection?.startDate) return;

    const updateTimeLeft = () => {
      const start = new Date(trip.UserSelection.startDate);
      const now = new Date();
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft("Trip has started or passed!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(
        `${days} day${days !== 1 ? "s" : ""}, ${hours}h ${minutes}m left`
      );
    };

    updateTimeLeft(); // Initial render
    const interval = setInterval(updateTimeLeft, 60000); // Update every 1 minute

    return () => clearInterval(interval); // Clean up on component unmount
  }, [trip?.UserSelection?.startDate]);

  const fetchPhoto = async (query) => {
    try {
      const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      const response = await axios.get(
        `https://api.unsplash.com/search/photos`,
        {
          params: { query, per_page: 1 },
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      );
      const results = response.data.results;
      if (results.length > 0) {
        setPhotoUrl(results[0].urls.regular);
      }
    } catch (error) {
      console.error("Error fetching photo from Unsplash:", error);
    }
  };

  const handleShare = () => {
    const tripUrl = window.location.href;
    navigator.clipboard.writeText(tripUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Banner */}
      <img
        src={photoUrl}
        alt={trip?.UserSelection?.destination || "Travel"}
        className="h-[340px] w-full object-cover rounded-xl shadow-md"
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-5 gap-4">
        {/* Trip Info */}
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-3xl text-gray-800 flex items-center gap-2">
            <FiMapPin className="text-[#f56551]" />
            {trip?.UserSelection?.destination || "Unknown Location"}
          </h2>

          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <FiCalendar />
              {trip?.UserSelection?.noOfDays || "N/A"} Days
            </span>

            <span className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <FiUsers />
              {trip?.UserSelection?.traveler || "N/A"} Traveler(s)
            </span>

            <span className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <FiDollarSign />₹{trip?.UserSelection?.budget || "N/A"}
            </span>

            {trip?.UserSelection?.startDate && (
              <span className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                🗓 {formatDate(trip.UserSelection.startDate)}
              </span>
            )}

            {/* Remaining Time */}
            {timeLeft && (
              <span className="flex items-center gap-2 text-sm bg-green-100 px-3 py-1 rounded-full text-green-700">
                <FiClock />
                {timeLeft}
              </span>
            )}
          </div>
        </div>

        {/* Share Button */}
        <Button
          onClick={handleShare}
          className="flex items-center gap-2 hover:bg-[#f56551] hover:text-white transition duration-300"
        >
          <FiShare size={18} />
          {copied ? "Link Copied!" : "Share Trip"}
        </Button>
      </div>
    </div>
  );
});

export default InfoSection;
