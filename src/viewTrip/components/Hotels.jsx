import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import {
  FaStar,
  FaMapMarkerAlt,
  FaWifi,
  FaSwimmer,
  FaUtensils,
} from "react-icons/fa";

const swiperStyles = `
  .swiper-button-prev,
  .swiper-button-next {
    width: 40px;
    height: 40px;
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    color: #1e40af;
    z-index: 20;
    top: 45%;
    transform: translateY(-50%);
  }
  .swiper-button-prev { left: -20px; }
  .swiper-button-next { right: -20px; }
  @media (max-width: 768px) {
    .swiper-button-prev,
    .swiper-button-next {
      width: 30px;
      height: 30px;
    }
    .swiper-button-prev { left: -10px; }
    .swiper-button-next { right: -10px; }
  }
`;

const Hotels = React.memo(({ trip }) => {
  const hotelOptions = trip?.tripData?.trip?.tripPlan?.hotelOptions || [];
  const destination = trip?.UserSelection?.destination || "";
  const [destinationImages, setDestinationImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination || hotelOptions.length === 0) return;

    setLoading(true);
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          "https://api.unsplash.com/search/photos",
          {
            params: {
              query: `${destination} hotel`,
              per_page: hotelOptions.length,
            },
            headers: {
              Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
            },
          }
        );
        setDestinationImages(response.data.results);
      } catch (error) {
        console.error("Error fetching Unsplash images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [destination, hotelOptions.length]);

  if (loading)
    return <div className="text-center mt-10">Loading hotel images...</div>;

  if (hotelOptions.length === 0) {
    return (
      <div>
        <h2 className="font-bold text-xl mt-5">Hotel Recommendations</h2>
        <p className="text-gray-500 mt-2">
          No hotel recommendations available.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 px-6 relative">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        🏨 Top Hotel Recommendations in {destination}
      </h2>

      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="!pb-10 px-6"
        >
          {hotelOptions.map((item, index) => {
            const imageUrl =
              destinationImages[index]?.urls?.regular ||
              "https://via.placeholder.com/400x200?text=Hotel";

            const tags = [
              { icon: <FaUtensils />, label: "Free Breakfast" },
              { icon: <FaWifi />, label: "Wi-Fi" },
              { icon: <FaSwimmer />, label: "Pool" },
            ];

            return (
              <SwiperSlide key={index}>
                <Link
                  to={`/hotel/${encodeURIComponent(item.hotelName)}`}
                  state={item}
                >
                  <div className="h-[450px] w-[300px] flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group ml-[10px] mt-[10px] border hover:border-blue-300">
                    <img
                      src={imageUrl}
                      alt={`Hotel ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h2 className="text-lg font-bold text-gray-800 line-clamp-1">
                          {item.hotelName}
                        </h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1 line-clamp-1">
                          <FaMapMarkerAlt className="text-blue-500" />
                          {item.hotelAddress}
                        </p>
                        <p className="text-sm text-gray-700">
                          💰 {item.price || item.Price}
                        </p>
                        <div className="flex items-center gap-1 text-yellow-500">
                          {Array.from(
                            { length: Math.round(item.rating || 3) },
                            (_, i) => (
                              <FaStar key={i} />
                            )
                          )}
                          <span className="ml-1 text-sm text-gray-600">
                            ({item.rating})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 text-xs bg-gray-100 border px-2 py-1 rounded-full"
                            >
                              {tag.icon} {tag.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-all"
                        onClick={(e) => e.preventDefault()} // prevent Link trigger if clicked
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <style>{swiperStyles}</style>
      </div>
    </div>
  );
});

export default Hotels;
