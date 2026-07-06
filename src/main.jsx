import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateTrip from "./create-trip/index.jsx";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ViewTrip from "./viewTrip/[tripId]/index.jsx";
import Profile from "./viewTrip/components/Profile.jsx";
import EditTrip from "./viewTrip/components/EditTrip.jsx";
import TransportDetails from "./pages/TransportDetails.jsx";
import Layout from "./Layout.jsx"; // 👈 import your new layout
import TransportList from "./pages/TransportList.jsx";
import PlaceDetail from "./pages/PlaceDetail.jsx";
import HotelDetail from "./pages/HotelDetail.jsx";
import StartTripMap from "./pages/StartTripMap.jsx"; // adjust path as needed
import AdminPage from "./viewTrip/components/AdminPage.jsx"; // ✅ Admin page

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // 👈 Wrap all routes inside Layout (which includes Header)
    children: [
      {
        path: "",
        element: <App />,
      },
      {
        path: "create-trip",
        element: <CreateTrip />,
      },
      {
        path: "view-trip/:tripId",
        element: <ViewTrip />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "edit-trip/:id",
        element: <EditTrip />,
      },
      {
        path: "transport-details",
        element: <TransportDetails />,
      },
      {
        path: "/transport/:type", // dynamic route for all types
        element: <TransportList />,
      },
      {
        path: "/place/:placeName",
        element: <PlaceDetail />,
      },
      {
        path: "/hotel/:hotelName",
        element: <HotelDetail />,
      },
      {
        path: "/start-trip",
        element: <StartTripMap />,
      },
      { path: "admin", element: <AdminPage /> }, // ✅ New route
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="988373693916-s6ha0gup5mrnvvg9vg8flrrh4l75jgoc.apps.googleusercontent.com">
      <RouterProvider router={router} />
      <Toaster />
    </GoogleOAuthProvider>
  </StrictMode>
);
