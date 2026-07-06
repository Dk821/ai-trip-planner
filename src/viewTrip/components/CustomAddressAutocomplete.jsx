// CustomAddressAutocomplete.jsx
import React, { useState, useEffect } from "react";

const CustomAddressAutocomplete = ({ onChange, style = {} }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const API_KEY = "pk.456c08de5b4fbcdf1faec06493b9c81c"; // 🔁 Replace with your LocationIQ key

  useEffect(() => {
    if (!query) return setSuggestions([]);

    const delayDebounceFn = setTimeout(() => {
      fetch(
        `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${query}&format=json`
      )
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data);
          setShowDropdown(true);
        })
        .catch(() => {
          setSuggestions([]);
          setShowDropdown(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setSuggestions([]);
    setShowDropdown(false);
    onChange({ target: { value: place.display_name } });
  };

  return (
    <div className="relative" style={style}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search location..."
        className="w-full border border-gray-300 p-2 rounded-md"
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 bg-white border w-full shadow-md rounded mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((place, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomAddressAutocomplete;
