import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCompass,
  FaGlobeAsia,
  FaMapMarkedAlt,
  FaPlane,
  FaHotel,
  FaUmbrellaBeach,
  FaStar,
  FaUsers,
  FaRoute,
  FaShieldAlt,
  FaLeaf,
  FaHeart,
  FaHeadphones,
} from "react-icons/fa";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: <FaRoute className="text-2xl" />,
    title: "AI Itineraries",
    desc: "Smart day-by-day plans built around your preferences",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: <FaHotel className="text-2xl" />,
    title: "Hotel Booking",
    desc: "Best stays matching your budget and style",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <FaCompass className="text-2xl" />,
    title: "Local Guides",
    desc: "Expert recommendations & hidden gems",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <FaGlobeAsia className="text-2xl" />,
    title: "Global Reach",
    desc: "50+ countries with real-time travel data",
    color: "from-purple-500 to-pink-500",
  },
];

const destinations = [
  { name: "Bali", price: "$499", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop" },
  { name: "Paris", price: "$599", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop" },
  { name: "Tokyo", price: "$699", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop" },
];

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
        const res = await fetch(import.meta.env.VITE_IPAPI_URL);
        const loc = await res.json();
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
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
    <div className="bg-white">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/Travel.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT: Text content */}
            <div className="text-left space-y-7">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full"
              >
                <FaStar className="text-yellow-400 text-sm" />
                <span className="text-sm font-medium text-white/90">
                  #1 AI Travel Planner 2026
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight text-white"
              >
                Your Journey{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                  Begins Here
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="text-lg sm:text-xl text-gray-300 max-w-xl leading-relaxed"
              >
                Let AI craft your perfect trip — personalized itineraries, smart
                hotel deals, and real-time travel insights, all in one place.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="flex flex-wrap gap-4"
              >
                <Link to="/create-trip">
                  <Button className="text-base px-8 py-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all flex items-center gap-2">
                    Start Planning Free
                    <FaArrowRight />
                  </Button>
                </Link>

              </motion.div>

              {/* Stats row */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
                className="flex flex-wrap gap-8 pt-4"
              >
                {[
                  { value: "10K+", label: "Trips Planned" },
                  { value: "50+", label: "Countries" },
                  { value: "4.9★", label: "User Rating" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-sm text-gray-400">{s.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Quote & Weather inline */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={5}
                className="flex flex-wrap gap-4"
              >
                {quote && (
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-400 italic max-w-sm">
                    <FaHeart className="text-red-400 shrink-0" />
                    "{quote.q.slice(0, 60)}..."
                  </div>
                )}
                {weather && (
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-300">
                    <FaUmbrellaBeach className="text-yellow-400" />
                    {weather.city}, {weather.temp}°C {weather.condition}
                  </div>
                )}
              </motion.div>
            </div>

            {/* RIGHT: Visual showcase */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {destinations.map((d, i) => (
                      <div
                        key={i}
                        className="relative group rounded-xl overflow-hidden aspect-[4/3]"
                      >
                        <img
                          src={d.image}
                          alt={d.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 text-white">
                          <div className="font-semibold text-sm">{d.name}</div>
                          <div className="text-xs text-orange-300">from {d.price}</div>
                        </div>
                      </div>
                    ))}
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 flex flex-col justify-center items-center text-center border border-white/5">
                      <FaPlane className="text-3xl text-orange-400 mb-2" />
                      <div className="text-white font-semibold text-sm">New Destinations</div>
                      <div className="text-orange-300 text-xs">Added weekly</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <FaMapMarkedAlt className="text-orange-400" /> 200+ destinations
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUsers className="text-blue-400" /> 10K travelers
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-5 sm:px-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-orange-500 uppercase tracking-widest">
            Why TravelAI
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
            Everything You Need to Travel Smart
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            From AI-generated itineraries to live tracking, we've got your trip covered
            from start to finish.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-gray-50 border-t border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm">
          <span className="flex items-center gap-2">
            <FaShieldAlt className="text-green-500" /> Secure Booking
          </span>
          <span className="flex items-center gap-2">
            <FaLeaf className="text-green-500" /> Sustainable Travel
          </span>
          <span className="flex items-center gap-2">
            <FaHeadphones className="text-blue-500" /> 24/7 Support
          </span>
          <span className="flex items-center gap-2">
            <FaStar className="text-yellow-500" /> Best Price Guarantee
          </span>
        </div>
      </section>
    </div>
  );
}

export default Hero;