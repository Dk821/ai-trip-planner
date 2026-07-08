import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlane, FaTrain, FaBus } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

const TransportOptions = React.memo(({ trip }) => {
  const navigate = useNavigate();
  const transport = trip?.tripData?.trip?.tripPlan?.transportOptions;

  const handleRedirect = (type) => {
    const data = transport?.[`${type}Info`] || [];
    navigate(`/transport/${type}`, {
      state: { data, type },
    });
  };

  const transportOptions = [
    {
      type: "flight",
      label: "Flights",
      icon: <FaPlane size={24} />,
      data: transport?.flightInfo,
      bg: "from-blue-100 to-blue-50",
      text: "text-blue-700",
      border: "border-blue-300",
      hover: "hover:from-blue-200 hover:to-blue-100",
      description: "Fastest way to travel long distances with multiple airlines.",
    },
    {
      type: "train",
      label: "Trains",
      icon: <FaTrain size={24} />,
      data: transport?.trainInfo,
      bg: "from-green-100 to-green-50",
      text: "text-green-700",
      border: "border-green-300",
      hover: "hover:from-green-200 hover:to-green-100",
      description: "Comfortable and scenic travel with convenient stops.",
    },
    {
      type: "bus",
      label: "Buses",
      icon: <FaBus size={24} />,
      data: transport?.busInfo,
      bg: "from-yellow-100 to-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-300",
      hover: "hover:from-yellow-200 hover:to-yellow-100",
      description: "Economical choice for short distances and regional travel.",
    },
  ];

  return (
    <div className="mt-12 px-4 sm:px-6 lg:px-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
        🚗 Choose Your Transport Option
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
        {transportOptions.map((option) => {
          const avgPrice = option.data?.length
            ? `$${Math.round(option.data.reduce((acc, val) => acc + (val.price || 0), 0) / option.data.length)} avg`
            : "Price varies";
          const count = option.data?.length || 0;
          return (
            <button
              key={option.type}
              onClick={() => handleRedirect(option.type)}
              aria-label={`Select ${option.label} transport option`}
              className={`
                relative group overflow-hidden
                border-2 ${option.border} 
                bg-gradient-to-br ${option.bg} ${option.hover}
                text-left px-6 py-5 rounded-2xl shadow-md 
                transition-all duration-300
                hover:scale-105 focus:ring-2 ring-offset-2 
                ${option.text}
              `}
            >
              {/* Icon and Title */}
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow group-hover:scale-110 transition">
                  {option.icon}
                </div>
                <h3 className="text-xl font-semibold">{option.label}</h3>
                <span className="ml-auto text-sm font-medium bg-white px-2 py-1 rounded-full text-gray-600">
                  {count} option{count !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm mt-3 text-gray-700">{option.description}</p>

              {/* Average Price and Arrow */}
              <div className="flex justify-between items-center mt-4 text-sm font-medium">
                <span className="opacity-80">{avgPrice}</span>
                <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default TransportOptions;
