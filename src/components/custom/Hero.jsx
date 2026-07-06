import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCompass, FaGlobeAsia, FaMapMarkedAlt, FaCloudSun } from "react-icons/fa";

function Hero() {
  const [quote, setQuote] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch("https://zenquotes.io/api/random");
        const data = await res.json();
        if (data && data[0]) setQuote(data[0]);
      } catch (err) {
        console.error("Failed to fetch quote", err);
      }
    };

    const fetchWeather = async () => {
      try {
        const res = await fetch("https://ipapi.co/json");
        const loc = await res.json();
        const apiKey = "a68f20ed7e2d19a22c199d272e6e1f3b"; // Demo key, replace for production
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${loc.city}&units=metric&appid=${apiKey}`
        );
        const weatherData = await weatherRes.json();
        setWeather({
          city: loc.city,
          country: loc.country_name,
          temp: weatherData.main.temp,
          condition: weatherData.weather[0].main,
        });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    fetchQuote();
    fetchWeather();
  }, []);

  return (
    <div className="relative bg-gradient-to-b from-[#fff4f1] via-[#fff] to-[#f0f9ff] py-20 px-5 sm:px-10 md:px-24 flex flex-col items-center text-center gap-10 overflow-hidden">
      {/* Decorative Gradient Shapes */}
      <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] bg-[#f56551] opacity-20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[200px] h-[200px] bg-blue-400 opacity-20 rounded-full blur-3xl" />

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 max-w-4xl">
        <span className="text-[#f56551] inline-block mb-3">
          Discover Your Next Adventure with AI 🚀
        </span>
        <br />
        Personalized Itineraries at Your Fingertips
      </h1>

      {/* Subtext */}
      <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
        ✈️ Your personal trip planner and travel curator — creating custom travel experiences tailored to your <span className="font-semibold text-[#f56551]">interests</span>, <span className="font-semibold text-blue-500">budget</span>, and <span className="font-semibold text-green-600">style</span>.
      </p>

      {/* Travel Quote */}
      {quote && (
        <blockquote className="bg-white/70 backdrop-blur-sm p-5 border rounded-lg shadow max-w-xl text-sm text-gray-600 italic">
          “{quote.q}” <br />
          <span className="text-right block mt-2 font-semibold text-gray-500">– {quote.a}</span>
        </blockquote>
      )}

      {/* Real-time Weather */}
      {weather && (
        <div className="flex items-center gap-3 bg-white border border-gray-200 px-5 py-2 rounded-full shadow text-sm text-gray-700">
          <FaCloudSun className="text-yellow-500" />
          {weather.city}, {weather.country} – {weather.temp}°C, {weather.condition}
        </div>
      )}

      {/* Feature Badges */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow hover:shadow-md transition">
          <FaCompass className="text-[#f56551]" />
          AI-Powered Planning
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow hover:shadow-md transition">
          <FaGlobeAsia className="text-blue-500" />
          Global Destinations
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow hover:shadow-md transition">
          💰 Budget-Friendly Trips
        </div>
      </div>

      {/* CTA Button */}
      <Link to="/create-trip">
        <Button className="text-lg px-6 py-3 rounded-full bg-[#f56551] hover:bg-[#e25441] transition text-white flex items-center gap-2 shadow-md">
          Get Started – it's Free
          <FaArrowRight className="ml-1" />
        </Button>
      </Link>
    </div>
  );
}

export default Hero;
