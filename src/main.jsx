import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Layout from "./Layout.jsx";

const CreateTrip = lazy(() => import("./create-trip/index.jsx"));
const ViewTrip = lazy(() => import("./viewTrip/[tripId]/index.jsx"));
const Profile = lazy(() => import("./viewTrip/components/Profile.jsx"));
const EditTrip = lazy(() => import("./viewTrip/components/EditTrip.jsx"));
const TransportDetails = lazy(() => import("./pages/TransportDetails.jsx"));
const TransportList = lazy(() => import("./pages/TransportList.jsx"));
const PlaceDetail = lazy(() => import("./pages/PlaceDetail.jsx"));
const HotelDetail = lazy(() => import("./pages/HotelDetail.jsx"));
const StartTripMap = lazy(() => import("./pages/StartTripMap.jsx"));
const AdminPage = lazy(() => import("./viewTrip/components/AdminPage.jsx"));

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
