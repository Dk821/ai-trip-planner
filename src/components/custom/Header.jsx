import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import {
  auth,
  signInWithGoogle,
  signOutUser,
} from "../../service/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiSun, FiMoon, FiSettings, FiBell } from "react-icons/fi";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";

function Header() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const q = query(
      collection(db, "TourOffers"),
      where("isActive", "==", true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const offers = [];
      snapshot.forEach((doc) => offers.push({ id: doc.id, ...doc.data() }));
      setNotifications(offers);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser(auth);
      setDropdownOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const goToProfile = () => {
    navigate("/profile");
    setDropdownOpen(false);
  };

  const goToSettings = () => {
    navigate("/settings");
    setDropdownOpen(false);
  };

  const navLinks = [
    { label: "Create Trip", path: "/create-trip" },
    { label: "My Trips", path: "/my-trips" },
    { label: "Live Tracker", path: "/live-tracker" },
    { label: "Tour Offers", path: "/tour-offers" },
    { label: "AI Assistant", path: "/ai-chat" },
    { label: "Guides", path: "/guides" },
    { label: "Support", path: "/support" },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="/ai visionary.png"
              alt="Logo"
              className="h-10 w-auto cursor-pointer"
            />
            <span className="ml-2 font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
              TravelAI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 dark:text-gray-200 hover:text-[#f56551]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifDropdown((prev) => !prev)}
                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Notifications"
              >
                <FiBell size={24} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-gray-500">No new offers</p>
                  ) : (
                    notifications.map((offer) => (
                      <div
                        key={offer.id}
                        onClick={() => {
                          navigate(`/tour-offer/${offer.id}`);
                          setShowNotifDropdown(false);
                        }}
                        className="cursor-pointer px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {offer.title || "New Tour Offer"}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {offer.description || ""}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? (
                <FiSun className="text-yellow-400" size={20} />
              ) : (
                <FiMoon className="text-gray-600" size={20} />
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Auth & user dropdown */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    aria-label="User menu"
                    type="button"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-black font-bold">
                        {user.displayName ? user.displayName[0] : "U"}
                      </div>
                    )}
                    <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-200">
                      {user.displayName}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                      <button
                        onClick={goToProfile}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        type="button"
                      >
                        Profile
                      </button>
                      <button
                        onClick={goToSettings}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                        type="button"
                      >
                        <FiSettings /> Settings
                      </button>
                      <hr className="border-gray-300 dark:border-gray-700 my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white transition text-red-600 dark:text-red-400"
                        type="button"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Button onClick={handleGoogleLogin} variant="default" size="sm">
                  Sign in with Google
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu nav links */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg px-5 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <button
                onClick={goToProfile}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              >
                Profile
              </button>
              <button
                onClick={goToSettings}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white rounded-md text-red-600 dark:text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="w-full text-left px-4 py-2 bg-[#f56551] text-white rounded-md hover:bg-[#e25441]"
            >
              Sign in with Google
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
