import React, { useEffect, useState } from "react";
import axios from "axios";

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

const fetchImage = async (query) => {
  try {
    const res = await axios.get("https://api.pexels.com/v1/search", {
      headers: { Authorization: PEXELS_API_KEY },
      params: {
        query,
        per_page: 1,
        orientation: "landscape",
      },
    });
    return res.data?.photos?.[0]?.src?.medium || null;
  } catch (err) {
    console.error("Pexels image fetch error for:", query, err);
    return null;
  }
};

function DestinationGuide({ guide, destination }) {
  const [itemImages, setItemImages] = useState({});

  useEffect(() => {
    const fetchItemImages = async () => {
      const sections = [
        ...(guide?.topAttractions || []),
        ...(guide?.localFood || []),
        ...(guide?.localCustoms || []),
        ...(guide?.localFestivals || []),
        ...(guide?.localClothing || []),
        ...(guide?.localDance || []),
      ];
      const images = {};

      for (const item of sections) {
        const image = await fetchImage(item);
        images[item] = image;
      }

      setItemImages(images);
    };

    if (guide) fetchItemImages();
  }, [guide]);

  if (!guide) return null;

  const {
    overview,
    safetyTips = [],
    localCustoms = [],
    localFood = [],
    topAttractions = [],
    bestTimeToVisit,
    localTransportInfo,
    languageSpoken,
    currency,
    emergencyContacts = {},
    localFestivals = [],
    localDance = [],
    localClothing = [],
  } = guide;

  const renderTextSection = (title, content) => (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h3 className="text-2xl font-bold mb-4 text-blue-900">{title}</h3>
      <p className="text-gray-700 whitespace-pre-line">
        {content || "No data available."}
      </p>
    </div>
  );

  const renderImageCardSection = (title, items) => (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h3 className="text-2xl font-bold mb-6 text-blue-900">{title}</h3>
      {items.length ? (
        <div className="grid grid-flow-col auto-cols-[200px] gap-4 overflow-x-auto pb-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="border border-blue-300 rounded-xl p-3 bg-blue-50 shadow flex flex-col items-center"
            >
              {itemImages[item] ? (
                <img
                  src={itemImages[item]}
                  alt={item}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded mb-2 animate-pulse" />
              )}
              <h4 className="text-sm text-blue-800 font-semibold text-center">
                {item}
              </h4>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700">No data available.</p>
      )}
    </div>
  );

  const renderListSection = (title, items) => (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h3 className="text-2xl font-bold mb-4 text-blue-900">{title}</h3>
      {items.length ? (
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700">No data available.</p>
      )}
    </div>
  );

  return (
    <section className="p-6 md:p-10 bg-gradient-to-b from-white to-blue-50 rounded-2xl mx-auto">
      <h2 className="text-4xl font-bold text-blue-900 mb-10">
        📌 Destination Guide: {destination}
      </h2>

      {renderTextSection("🌍 Overview", overview)}
      {renderImageCardSection("🏞️ Top Attractions", topAttractions)}
      {renderImageCardSection("🍲 Local Food", localFood)}
      {renderImageCardSection("🎎 Local Customs", localCustoms)}
      {renderImageCardSection("🎉 Local Festivals", localFestivals)}
      {renderImageCardSection("🕺 Local Dance", localDance)}
      {renderImageCardSection("👕 Local Clothing", localClothing)}
      {renderListSection("🛡️ Safety Tips", safetyTips)}
      {renderTextSection("🚌 Local Transport", localTransportInfo)}
      {renderTextSection("🌤️ Best Time to Visit", bestTimeToVisit)}
      {renderTextSection("🗣️ Language Spoken", languageSpoken)}
      {renderTextSection("💱 Currency", currency)}

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-2xl font-bold mb-4 text-blue-900">
          🚨 Emergency Contacts
        </h3>
        <ul className="list-inside text-gray-700 space-y-1">
          <li>🚓 Police: {emergencyContacts.police || "N/A"}</li>
          <li>🚑 Ambulance: {emergencyContacts.ambulance || "N/A"}</li>
          <li>
            📞 Tourist Helpline: {emergencyContacts.touristHelpline || "N/A"}
          </li>
        </ul>
      </div>
    </section>
  );
}

export default DestinationGuide;
