import React, { useEffect, useState } from "react";
import { auth, db } from "../../service/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate } from "react-router-dom";

const AdminPage = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const [allTrips, setAllTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  // 👇 Change this to your admin email
  const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL;

  const fetchAllTrips = async () => {
    try {
      const tripsSnapshot = await getDocs(collection(db, "AiTravel"));
      const trips = tripsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllTrips(trips);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const deleteTrip = async (tripId) => {
    await deleteDoc(doc(db, "AiTravel", tripId));
    setAllTrips((prev) => prev.filter((trip) => trip.id !== tripId));
  };

  useEffect(() => {
    if (user?.email === allowedEmail) {
      fetchAllTrips();
    }
  }, [user]);

  // 🔐 Route protection
  if (loadingAuth) return <div className="p-10">Loading authentication...</div>;
  if (!user) return <Navigate to="/" />;
  if (user.email !== allowedEmail) {
    return (
      <div className="p-10 text-center text-red-600 font-bold text-xl">
        🚫 Access Denied. You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">🛠 Admin Dashboard</h1>

      {loadingTrips ? (
        <p>Loading trips...</p>
      ) : (
        <div className="space-y-6">
          {allTrips.map((trip) => (
            <div
              key={trip.id}
              className="border rounded-xl p-4 shadow bg-white"
            >
              <p>
                <strong>User:</strong> {trip.userEmail}
              </p>
              <p>
                <strong>Destination:</strong> {trip.UserSelection?.location}
              </p>
              <p>
                <strong>Days:</strong> {trip.UserSelection?.noOfDays}
              </p>
              <p>
                <strong>Budget:</strong> ₹{trip.UserSelection?.budget}
              </p>
              <p>
                <strong>Date:</strong> {trip.UserSelection?.startDate}
              </p>
              <button
                className="mt-3 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                onClick={() => deleteTrip(trip.id)}
              >
                Delete Trip
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
