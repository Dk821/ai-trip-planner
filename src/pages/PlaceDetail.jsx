import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';

function PlaceDetail() {
  const { placeName } = useParams();
  const location = useLocation();
  const place = location.state || {};

  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query: placeName,
            per_page: 1,
          },
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
          },
        });
        setImageUrl(res.data.results[0]?.urls?.regular || '');
      } catch (err) {
        console.error('Error loading image:', err);
      }
    };

    fetchImage();
  }, [placeName]);

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4">
      {/* Full Image */}
      <div className="w-full h-[350px] rounded-xl overflow-hidden">
        <img
          src={imageUrl || '/placeholder.jpg'}
          alt={placeName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text Content */}
      <div className="mt-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">{place.placeName || placeName}</h1>
        <p className="text-gray-600 text-lg">{place.placeDetails || 'No description available.'}</p>

        {place.timeToTravel && (
          <p className="text-gray-700"><strong>⏰ Time to Travel:</strong> {place.timeToTravel}</p>
        )}

        {place.address && (
          <p className="text-gray-700"><strong>📍 Address:</strong> {place.address}</p>
        )}

        {place.visitingHours && (
          <p className="text-gray-700"><strong>🕒 Visiting Hours:</strong> {place.visitingHours}</p>
        )}

        {place.entryFee && (
          <p className="text-gray-700"><strong>💰 Entry Fee:</strong> {place.entryFee}</p>
        )}

        {place.travelTip && (
          <p className="text-blue-700 italic"><strong>💡 Travel Tip:</strong> {place.travelTip}</p>
        )}

        {Array.isArray(place.nearbyAttractions) && place.nearbyAttractions.length > 0 && (
          <div>
            <strong className="text-gray-800">📌 Nearby Attractions:</strong>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              {place.nearbyAttractions.map((attraction, index) => (
                <li key={index}>{attraction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Embedded Google Map */}
      <div className="mt-6">
        <iframe
          title="Google Map"
          width="100%"
          height="300"
          className="rounded-xl"
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps?q=${encodeURIComponent(place.placeName || placeName)}&output=embed`}
        ></iframe>
      </div>
    </div>
  );
}

export default PlaceDetail;
