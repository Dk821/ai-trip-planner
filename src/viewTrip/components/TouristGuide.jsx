import React from "react";

const LocalTouristGuides = ({ guides }) => {
  console.log(guides);
  if (!guides || guides.length === 0) {
    return <p>No local tourist guides available.</p>;
  }
     
  
  return (
    <section className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">🧭 Local Tourist Guides</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition bg-gray-50"
          >
            <img
              src={guide.guideImageUrl || "https://via.placeholder.com/300x200"}
              alt={guide.name || "Tourist Guide"}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              {guide.name || "Unnamed Guide"}
            </h3>

            {guide.phoneNumber && (
              <p className="text-sm text-gray-600 mb-1">
                📞 {guide.phoneNumber}
              </p>
            )}

            {guide.email && (
              <p className="text-sm text-gray-600 mb-1">📧 {guide.email}</p>
            )}

            {guide.languagesSpoken?.length > 0 && (
              <p className="text-sm mb-1">
                <strong>Languages:</strong> {guide.languagesSpoken.join(", ")}
              </p>
            )}

            {guide.availability && (
              <p className="text-sm mb-1">
                <strong>Availability:</strong> {guide.availability}
              </p>
            )}

            {guide.areaOfExpertise && (
              <p className="text-sm mb-1">
                <strong>Expertise:</strong> {guide.areaOfExpertise}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default LocalTouristGuides;
