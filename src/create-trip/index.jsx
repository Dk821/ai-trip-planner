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
      {/* Offers Section */}
      <section className="my-16 px-5 md:px-20">
        <h2 className="text-3xl font-bold mb-6 text-center">
          🔥 Special Offers & Deals
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Bali Escape",
              price: "From $499",
              desc: "5 nights stay with free spa and beach dinner",
            },
            {
              title: "Swiss Alps Adventure",
              price: "From $899",
              desc: "7-day hiking tour including cable car pass",
            },
            {
              title: "Dubai Luxury Trip",
              price: "From $699",
              desc: "Luxury hotel + Desert Safari + Yacht Ride",
            },
          ].map((offer, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition"
            >
              <img
                src={offerImages[idx] || "https://via.placeholder.com/300"}
                alt={offer.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 bg-white">
                <h3 className="text-xl font-semibold">{offer.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{offer.desc}</p>
                <div className="text-blue-600 font-bold mt-2">
                  {offer.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activities */}
      <section className="my-16 px-5 md:px-20">
        <h2 className="text-3xl font-bold mb-6 text-center">
          🕒 Recent Adventures by Our Users
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { from: "New York", to: "Paris", type: "Romantic Getaway" },
            { from: "Mumbai", to: "Leh", type: "Adventure Trip" },
            { from: "Tokyo", to: "Kyoto", type: "Cultural Retreat" },
          ].map((trip, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition"
            >
              <img
                src={adventureImages[idx] || "https://via.placeholder.com/300"}
                alt={`Trip to ${trip.to}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 bg-white">
                <h3 className="text-xl font-semibold">
                  From {trip.from} to {trip.to}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Trip Type: {trip.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Inspiration */}
      {/* Blog Inspiration */}
      <section className="py-14 px-5 md:px-20 bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center">📸 Get Inspired</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Top 5 Budget-Friendly Destinations",
              summary: "Explore amazing spots without breaking the bank.",
            },
            {
              title: "Romantic Escapes for Couples",
              summary: "Plan the perfect getaway for you and your partner.",
            },
            {
              title: "Backpacker's Guide to Europe",
              summary: "All you need to explore Europe on a budget.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl shadow-lg hover:scale-[1.03] transition"
            >
              <img
                src={blogImages[index] || "https://via.placeholder.com/300"}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h4 className="text-lg font-semibold">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-2">{item.summary}</p>
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
                  className={`p-4 rounded-lg border cursor-pointer select-none transition ${
                    formData?.budget === item.title
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleInputChange("budget", item.title);
                  }}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Travel Group
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SelectTravelesList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleInputChange("traveler", item.people)}
                  className={`p-4 rounded-lg border cursor-pointer select-none transition ${
                    formData?.traveler === item.people
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleInputChange("traveler", item.people);
                  }}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Button */}
          <div className="pt-2">
            <Button
              disabled={loading}
              onClick={OnGenerateTrip}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2.5 transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                "Generate My Trip"
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
