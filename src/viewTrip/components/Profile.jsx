import React, { useEffect, useState } from "react";
import { auth, db } from "../../service/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, updateProfile, updateEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  FaUserEdit,
  FaTrash,
  FaEye,
  FaSave,
  FaTimes,
  FaChartBar,
  FaTrophy,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Profile() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setProfileName(currentUser.displayName || "");
        setProfileEmail(currentUser.email || "");
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchTrips() {
      setLoadingTrips(true);
      try {
        const tripsRef = collection(db, "AiTravel");
        const q = query(tripsRef, where("userEmail", "==", user.email));
        const querySnapshot = await getDocs(q);
        const userTrips = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrips(userTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoadingTrips(false);
      }
    }

    fetchTrips();
  }, [user]);

  const handleDelete = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await deleteDoc(doc(db, "AiTravel", tripId));
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const handleSaveProfile = async () => {
    setUpdatingProfile(true);
    setProfileError(null);
    try {
      if (!user) throw new Error("User not logged in");
      if (profileName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: profileName });
      }
      if (profileEmail !== user.email) {
        await updateEmail(auth.currentUser, profileEmail);
      }
      setUser({ ...user, displayName: profileName, email: profileEmail });
      alert("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Chart Data
  const tripChartData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString("default", { month: "short" });
    const count = trips.filter((trip) => {
      const date = trip.UserSelection?.startDate;
      if (!date) return false;
      return new Date(date).getMonth() === i;
    }).length;
    return { month, trips: count };
  });

  // Stats
  const totalTrips = trips.length;
  const totalBudget = trips.reduce(
    (acc, trip) => acc + parseFloat(trip.UserSelection?.budget || 0),
    0
  );
  const avgDuration =
    trips.length > 0
      ? Math.round(
          trips.reduce(
            (acc, t) => acc + Number(t.UserSelection?.noOfDays || 0),
            0
          ) / trips.length
        )
      : 0;

  // Awards
  const awards = [
    ...(totalTrips >= 3
      ? [{ title: "Frequent Traveler", icon: <FaTrophy /> }]
      : []),
    ...(totalBudget >= 50000
      ? [{ title: "Big Spender", icon: <FaTrophy /> }]
      : []),
    ...(avgDuration >= 5 ? [{ title: "Explorer", icon: <FaTrophy /> }] : []),
    ...(totalTrips >= 1 && trips.every((t) => t.UserSelection?.traveler > 1)
      ? [{ title: "Team Player", icon: <FaTrophy /> }]
      : []),
  ];

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold">
          Please login to view your profile.
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
        <div>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-400"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profileName[0] || "U"}
            </div>
          )}
        </div>
        <div className="flex-1">
          {editing ? (
            <>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-2"
              />
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-2"
              />
              {profileError && <p className="text-red-500">{profileError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={updatingProfile}
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <FaSave /> {updatingProfile ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 px-4 py-2 rounded flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold">{profileName}</h2>
              <p className="text-gray-600">{profileEmail}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 mt-2 flex items-center gap-1"
              >
                <FaUserEdit /> Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-white shadow rounded text-center">
          <h4 className="text-lg font-semibold text-gray-600">Total Trips</h4>
          <p className="text-3xl font-bold text-blue-600">{totalTrips}</p>
        </div>
        <div className="p-4 bg-white shadow rounded text-center">
          <h4 className="text-lg font-semibold text-gray-600">
            Total Budget Spent
          </h4>
          <p className="text-2xl font-bold text-green-600">₹{totalBudget}</p>
        </div>
        <div className="p-4 bg-white shadow rounded text-center">
          <h4 className="text-lg font-semibold text-gray-600">Avg. Duration</h4>
          <p className="text-2xl font-bold text-purple-600">
            {avgDuration} days
          </p>
        </div>
      </div>

      {/* Awards */}
      {awards.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-8">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-800">
            <FaTrophy /> Your Travel Awards
          </h4>
          <ul className="flex flex-wrap gap-4">
            {awards.map((award, i) => (
              <li
                key={i}
                className="bg-yellow-100 px-4 py-2 rounded-full text-sm text-yellow-800 flex items-center gap-2 shadow"
              >
                {award.icon} {award.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold text-lg">
          <FaChartBar />
          <span>Trips per Month</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tripChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="trips" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trip List */}
      <h3 className="text-2xl font-semibold mb-4">Your Trip Plans</h3>
      {loadingTrips ? (
        <p>Loading trips...</p>
      ) : trips.length === 0 ? (
        <p className="text-gray-500">
          No trips found. Plan your first adventure now!
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg">
                  Trip to {trip.UserSelection?.location || "Unknown"}
                </h4>
                <div className="flex gap-3 text-lg">
                  <button
                    onClick={() => navigate(`/view-trip/${trip.id}`)}
                    className="text-blue-600"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p>
                <strong>Duration:</strong> {trip.UserSelection?.noOfDays} days
              </p>
              <p>
                <strong>Budget:</strong> ₹{trip.UserSelection?.budget}
              </p>
              <p>
                <strong>Travelers:</strong> {trip.UserSelection?.traveler}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {trip.UserSelection?.startDate
                  ? new Date(trip.UserSelection.startDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <button
                onClick={() => navigate(`/view-trip/${trip.id}`)}
                className="mt-2 text-blue-500 hover:underline text-sm"
              >
                View Full Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
