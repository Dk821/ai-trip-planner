import React, { useEffect, useState } from "react";
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
      <section
        className="w-full h-[70vh] md:h-[80vh] bg-cover bg-center relative flex items-center justify-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80')",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="relative z-10 text-center px-5">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
            Discover Your Dream Destination
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 drop-shadow-md">
            Plan your personalized AI-powered trip in seconds. Hassle-free, fun,
            and unforgettable!
          </p>
          <a href="#tripForm">
            <button className="bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform duration-300">
              Plan Your Trip Now
            </button>
          </a>
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
