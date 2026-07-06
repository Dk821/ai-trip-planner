import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function TransportList() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const originalData = state?.data || [];
  const type = state?.type || "transport";
  const destination = state?.destination || "India";

  const [filteredData, setFilteredData] = useState(originalData);
  const [selectedAirline, setSelectedAirline] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [destinationImages, setDestinationImages] = useState([]);
  const pageSize = 6;

  const airlineOptions =
    type === "flight"
      ? [
          ...new Set(
            originalData.map((item) => item.airlineName).filter(Boolean)
          ),
        ]
      : [];

  const filterByPrice = (price) => {
    const p = Number(price);
    if (!selectedPriceRange || isNaN(p)) return true;
    if (selectedPriceRange === "low") return p < 1000;
    if (selectedPriceRange === "medium") return p >= 1000 && p <= 5000;
    if (selectedPriceRange === "high") return p > 5000;
    return true;
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = originalData.filter((item) => {
        const price = item.pricePerPerson || item.price || item.cost || 0;
        const priceMatch = filterByPrice(price);
        const airlineMatch =
          type === "flight" && selectedAirline
            ? item.airlineName === selectedAirline
            : true;
        return priceMatch && airlineMatch;
      });

      if (sortOrder === "asc") {
        filtered.sort(
          (a, b) =>
            (a.pricePerPerson || a.price || a.cost || 0) -
            (b.pricePerPerson || b.price || b.cost || 0)
        );
      } else if (sortOrder === "desc") {
        filtered.sort(
          (a, b) =>
            (b.pricePerPerson || b.price || b.cost || 0) -
            (a.pricePerPerson || a.price || a.cost || 0)
        );
      }

      setFilteredData(filtered);
      setCurrentPage(1);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedAirline, selectedPriceRange, sortOrder, originalData, type]);

  // 🔄 Pixabay Image Fetch
  useEffect(() => {
    if (!destination || originalData.length === 0) return;

    const fetchImages = async () => {
      try {
        const response = await axios.get("https://pixabay.com/api/", {
          params: {
            key: import.meta.env.VITE_PIXABAY_API_KEY,
            q: encodeURIComponent(`${destination} ${type}`), // ✅ Encode query
            image_type: "photo",
            orientation: "horizontal",
            per_page: originalData.length > 0 ? originalData.length : 6,
            safesearch: true,
          },
        });

        if (response.data?.hits?.length > 0) {
          setDestinationImages(response.data.hits);
        } else {
          console.warn("No images found from Pixabay.");
        }
      } catch (error) {
        console.error("Error fetching Pixabay images:", error);
      }
    };

    fetchImages();
  }, [destination, originalData.length, type]);

  const getImageForIndex = (idx) => {
    return destinationImages[idx]?.webformatURL || getDefaultImage(type);
  };

  const getDefaultImage = (type) => {
    switch (type.toLowerCase()) {
      case "flight":
        return "https://cdn.pixabay.com/photo/2024/03/01/19/57/airbus-8607152_1280.jpg";
      case "train":
        return "https://images.unsplash.com/photo-1505839673365-e3971f8d9184?auto=format&fit=crop&w=400&q=80";
      case "bus":
        return "https://images.unsplash.com/photo-1568485684961-3b8a381f7593?auto=format&fit=crop&w=400&q=80";
      default:
        return "https://via.placeholder.com/400x200.png?text=No+Image";
    }
  };

  const handleViewDetails = (item) => {
    navigate("/transport-details", {
      state: { transport: item, type },
    });
  };

  const goToPage = (page) => {
    if (page < 1 || page > Math.ceil(filteredData.length / pageSize)) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pageData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white capitalize">
          Compare & Choose Best {type}s
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Explore and compare top-rated {type}s based on your comfort and
          budget.
        </p>
      </div>

      <div className="container mx-auto px-6">
        {/* Header image */}
        <div className="relative h-[300px] w-full">
          <img
            src={destinationImages[0]?.webformatURL || getDefaultImage(type)}
            alt={`${destination} ${type}`}
            className="w-full h-full object-cover rounded-b-xl shadow-md"
          />
          <div className="absolute inset-0 bg-black/40 rounded-b-xl flex flex-col justify-center items-center text-white px-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-2">
              {destination}
            </h2>
            <p className="text-lg md:text-xl">
              Explore the best {type}s for your journey
            </p>
          </div>
        </div>

        {/* Transport Cards */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {pageData.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden shadow-lg transition hover:shadow-xl hover:-translate-y-1 duration-300"
            >
              <img
                src={getImageForIndex(idx)}
                alt={
                  item.airlineName || item.name || item.busName || "Transport"
                }
                className="h-48 w-full object-cover"
              />
              <div className="p-6 space-y-2">
                <h3 className="text-xl font-bold text-gray-800">
                  {item.airlineName ||
                    item.name ||
                    item.busName ||
                    "Transport Option"}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.from} → {item.to}
                </p>
                <p className="text-base font-medium text-blue-700">
                  ₹{item.pricePerPerson || item.price || item.cost || "N/A"}
                </p>
                {item.departureTime && (
                  <p className="text-sm text-gray-500">
                    Departure: {item.departureTime}
                  </p>
                )}
                {item.arrivalTime && (
                  <p className="text-sm text-gray-500">
                    Arrival: {item.arrivalTime}
                  </p>
                )}
                {item.duration && (
                  <p className="text-sm text-gray-500">
                    Duration: {item.duration}
                  </p>
                )}

                <div className="pt-3">
                  <button
                    onClick={() => handleViewDetails(item)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Need More Help?
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Use our AI assistant to get personalized transport suggestions and
            budget estimates.
          </p>
          <button
            onClick={() => navigate("/travel-ai-chat")}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition shadow-lg"
          >
            Talk to Travel AI 🤖
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransportList;
