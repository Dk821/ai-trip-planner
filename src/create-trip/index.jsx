import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CustomAddressAutocomplete from "../viewTrip/components/CustomAddressAutocomplete";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AI_PROMPT,
  SelectBudgetOptions,
  SelectTravelesList,
} from "../constants/options";
import { toast } from "sonner";
import { chatSession } from "../service/AIModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../service/firebaseConfig";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  FaMapMarkedAlt,
  FaUserFriends,
  FaRegStar,
  FaHiking,
  FaHotel,
  FaCarSide,
} from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

function CreateTrip() {
  const [formData, setFormData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [offerImages, setOfferImages] = useState([]);
  const [blogImages, setBlogImages] = useState([]);
  const [adventureImages, setAdventureImages] = useState([]);

  const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Offers
        const offerQueries = ["bali", "switzerland", "dubai"];
        const offerRequests = offerQueries.map((query) =>
          axios.get(`https://api.pexels.com/v1/search`, {
            headers: { Authorization: PEXELS_API_KEY },
            params: { query, per_page: 1 },
          })
        );

        // Blogs
        const blogQueries = [
          "travel budget",
          "romantic travel",
          "backpack europe",
        ];
        const blogRequests = blogQueries.map((query) =>
          axios.get(`https://api.pexels.com/v1/search`, {
            headers: { Authorization: PEXELS_API_KEY },
            params: { query, per_page: 1 },
          })
        );

        // Adventures
        const adventureQueries = ["paris", "leh", "kyoto"];
        const adventureRequests = adventureQueries.map((query) =>
          axios.get(`https://api.pexels.com/v1/search`, {
            headers: { Authorization: PEXELS_API_KEY },
            params: { query: `${query} travel`, per_page: 1 },
          })
        );

        // Await all
        const [offerRes, blogRes, adventureRes] = await Promise.all([
          Promise.all(offerRequests),
          Promise.all(blogRequests),
          Promise.all(adventureRequests),
        ]);

        setOfferImages(
          offerRes.map((res) => res.data.photos[0]?.src?.medium || "")
        );
        setBlogImages(
          blogRes.map((res) => res.data.photos[0]?.src?.medium || "")
        );
        setAdventureImages(
          adventureRes.map((res) => res.data.photos[0]?.src?.medium || "")
        );
      } catch (err) {
        console.error("Error fetching images from Pexels:", err);
      }
    };

    fetchImages();
  }, []);

  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: (tokenResponse) => GetUserProfile(tokenResponse),
    onError: (error) => {
      console.error("Google login error:", error);
      toast.error("Google Sign-In failed.");
    },
  });

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "login_successful") {
        setOpenDialog(false);
        toast.success("Logged in successfully!");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleInputChange = (name, valueOrEvent) => {
    const value =
      typeof valueOrEvent === "object" && valueOrEvent.target
        ? valueOrEvent.target.value
        : valueOrEvent;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const OnGenerateTrip = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setOpenDialog(true);
      return;
    }
    if (
      !formData?.departure ||
      !formData?.destination ||
      !formData?.budget ||
      !formData?.traveler
    ) {
      toast.error("Please fill all required details.");
      return;
    }

    setLoading(true);
    try {
      const FINAL_PROMPT = AI_PROMPT.replace(
        "{departure}",
        formData.departure || "N/A"
      )
        .replace("{destination}", formData.destination || "N/A")
        .replace("{totalDays}", formData.noOfDays || "3")
        .replace("{traveler}", formData.traveler)
        .replace("{budget}", formData.budget)
        .replace("{startDate}", formData.startDate || "N/A")
        .concat(
          `\nTrip Type: ${formData.tripType || "N/A"}`,
          `\nPreferred Activities: ${formData.activities || "N/A"}`,
          `\nAccommodation Type: ${formData.accommodation || "N/A"}`,
          `\nPreferred Transport: ${formData.transport || "N/A"}`,
          `\nNotes: ${formData.notes || "N/A"}`
        );

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const aiResponse = await result.response.text();
      SaveAiTrip(aiResponse);
    } catch (error) {
      console.error("Error generating trip:", error);
      toast.error("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const SaveAiTrip = async (TripData) => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const docId = Date.now().toString();

    let cleanedTripData = TripData.trim();
    const firstBraceIndex = cleanedTripData.indexOf("{");
    if (firstBraceIndex > 0) {
      cleanedTripData = cleanedTripData.slice(firstBraceIndex);
    }

    let parsedTripData;
    try {
      parsedTripData = JSON.parse(cleanedTripData);
    } catch (e) {
      parsedTripData = TripData;
    }

    try {
      await setDoc(doc(db, "AiTravel", docId), {
        UserSelection: formData,
        tripData: parsedTripData,
        userEmail: user?.email,
        id: docId,
      });
      navigate("/view-trip/" + docId);
    } catch (e) {
      toast.error("Failed to save trip data.");
      console.error(e);
    }
    setLoading(false);
  };

  const GetUserProfile = async (tokeninfo) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokeninfo?.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokeninfo?.access_token}`,
            Accept: "application/json",
          },
        }
      );
      const user = {
        name: res.data.name,
        email: res.data.email,
        picture: res.data.picture || "",
        method: "google",
      };
      localStorage.setItem("user", JSON.stringify(user));
      setOpenDialog(false);
      OnGenerateTrip();
    } catch (err) {
      toast.error("Google Sign-In failed. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleManualLogin = () => {
    const name = formData?.manualName;
    const email = formData?.manualEmail;
    if (!name || !email) {
      toast.error("Please enter your name and email.");
      return;
    }
    const user = { name, email, method: "manual" };
    localStorage.setItem("user", JSON.stringify(user));
    setOpenDialog(false);
    OnGenerateTrip();
  };

  return (
    <>
      {/* Banner */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />

        {/* Animated orbs */}
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full"
              >
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-white/90">
                  AI-Powered Trip Planner
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              >
                Craft Your Perfect{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                  Getaway
                </span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl text-gray-300 max-w-xl leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              >
                Tell us where you want to go, and our AI will build a personalized
                itinerary with hotels, activities, and transport — in seconds.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              >
                <a href="#tripForm">
                  <motion.button
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold text-base shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-shadow flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Plan Your Trip Now
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.button>
                </a>
              </motion.div>

              <motion.div
                className="flex flex-wrap gap-8 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
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
            </div>

            {/* RIGHT: Visual showcase */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="relative">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { name: "Bali", price: "$499", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop" },
                      { name: "Paris", price: "$599", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop" },
                      { name: "Tokyo", price: "$699", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop" },
                      { name: "New York", price: "$449", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop" },
                    ].map((d, i) => (
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
                  </div>
                  <div className="flex items-center justify-between text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      200+ destinations
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      10K travelers
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="my-16 px-5 md:px-20">
        <h2 className="text-3xl font-bold mb-2 text-center">
          Special Offers & Deals
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Hand-picked packages for your next adventure
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Bali Escape",
              price: "From $499",
              desc: "5 nights stay with free spa and beach dinner",
              gradient: "from-pink-500 to-rose-500",
            },
            {
              title: "Swiss Alps Adventure",
              price: "From $899",
              desc: "7-day hiking tour including cable car pass",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              title: "Dubai Luxury Trip",
              price: "From $699",
              desc: "Luxury hotel + Desert Safari + Yacht Ride",
              gradient: "from-amber-500 to-orange-500",
            },
          ].map((offer, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden h-52">
                <img
                  src={offerImages[idx] || "https://via.placeholder.com/300"}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-white/20 backdrop-blur-md rounded-full">
                    Limited Offer
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="inline-block px-3 py-1 text-sm font-bold text-white bg-gradient-to-r rounded-lg shadow-lg">
                    {offer.price}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900">{offer.title}</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{offer.desc}</p>
                <button className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group/btn">
                  View Deal
                  <span className="transform transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Adventures */}
      <section className="my-16 px-5 md:px-20">
        <h2 className="text-3xl font-bold mb-2 text-center">
          Recent Adventures
        </h2>
        <p className="text-gray-500 text-center mb-8">
          What our community has been exploring
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { from: "New York", to: "Paris", type: "Romantic Getaway", emoji: "💕" },
            { from: "Mumbai", to: "Leh", type: "Adventure Trip", emoji: "⛰️" },
            { from: "Tokyo", to: "Kyoto", type: "Cultural Retreat", emoji: "🏯" },
          ].map((trip, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden h-52">
                <img
                  src={adventureImages[idx] || "https://via.placeholder.com/300"}
                  alt={`Trip to ${trip.to}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-2xl">{trip.emoji}</span>
                  <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                    {trip.type}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <span>{trip.from}</span>
                  <span className="text-blue-500">→</span>
                  <span className="font-medium text-gray-700">{trip.to}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                  Recently planned
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Inspiration */}
      <section className="py-14 px-5 md:px-20 bg-gray-50">
        <h2 className="text-3xl font-bold mb-2 text-center">
          Get Inspired
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Travel tips and ideas from our experts
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Top 5 Budget-Friendly Destinations",
              summary: "Explore amazing spots without breaking the bank.",
              tag: "Budget",
              tagColor: "bg-green-100 text-green-700",
            },
            {
              title: "Romantic Escapes for Couples",
              summary: "Plan the perfect getaway for you and your partner.",
              tag: "Romance",
              tagColor: "bg-pink-100 text-pink-700",
            },
            {
              title: "Backpacker's Guide to Europe",
              summary: "All you need to explore Europe on a budget.",
              tag: "Guide",
              tagColor: "bg-blue-100 text-blue-700",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden h-48">
                <img
                  src={blogImages[index] || "https://via.placeholder.com/300"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.summary}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                  Read More
                  <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <div
        id="tripForm"
        className="max-w-3xl mx-auto my-16 px-5"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Plan Your Trip
          </h2>
          <p className="text-gray-500 mt-2">
            Fill in the details below and let AI build your itinerary.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-8">
          {/* Address Fields */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Departure City
              </label>
              <CustomAddressAutocomplete
                style={{ width: "100%" }}
                onChange={(value) => handleInputChange("departure", value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Destination City
              </label>
              <CustomAddressAutocomplete
                style={{ width: "100%" }}
                onChange={(value) => handleInputChange("destination", value)}
              />
            </div>
          </div>

          {/* Date + Duration */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date
              </label>
              <Input
                type="date"
                onChange={(e) => handleInputChange("startDate", e)}
                className="border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Duration (Days)
              </label>
              <Input
                placeholder="e.g. 3"
                type="number"
                onChange={(e) => handleInputChange("noOfDays", e)}
                className="border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Budget Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Budget
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SelectBudgetOptions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleInputChange("budget", item.title)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer select-none transition-all duration-300 ${
                    formData?.budget === item.title
                      ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100 scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleInputChange("budget", item.title);
                  }}
                >
                  {formData?.budget === item.title && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-2xl mb-2 text-center">{item.icon}</div>
                  <h3 className="font-bold text-sm text-center">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 text-center">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Travel Group
            </label>
            <div className="grid grid-cols-4 gap-3">
              {SelectTravelesList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleInputChange("traveler", item.people)}
                  className={`relative p-3 rounded-xl border-2 cursor-pointer select-none transition-all duration-300 ${
                    formData?.traveler === item.people
                      ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100 scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleInputChange("traveler", item.people);
                  }}
                >
                  {formData?.traveler === item.people && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-2xl mb-1 text-center">{item.icon}</div>
                  <h3 className="font-bold text-xs text-center">{item.title}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 text-center leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Button */}
          <div className="pt-2">
            <Button
              disabled={loading}
              onClick={OnGenerateTrip}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl py-3 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300 hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
                  Crafting Your Trip...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate My Trip
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" alt="Logo" className="h-12 mx-auto" />
              <h2 className="font-bold text-xl mt-5 text-center">Sign In</h2>
              <p className="mb-4 text-center">
                Enter your name and email to continue
              </p>
              <Input
                placeholder="Your Name"
                className="mb-3"
                onChange={(e) => handleInputChange("manualName", e)}
              />
              <Input
                placeholder="Email Address"
                type="email"
                className="mb-4"
                onChange={(e) => handleInputChange("manualEmail", e)}
              />
              <Button className="w-full" onClick={handleManualLogin}>
                Continue
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateTrip;
