import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { transport, type } = location.state || {};

  useEffect(() => {
    if (!transport || !type) {
      toast.error("Missing transport data");
      navigate("/");
    }
  }, [transport, type, navigate]);

  const handlePayment = () => {
    toast.success("Payment successful! Booking confirmed.");
    navigate("/");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Confirm & Pay</h2>
      <div className="border p-5 rounded-lg shadow-sm bg-white">
        <h3 className="text-xl font-semibold mb-2">{type.toUpperCase()} Details</h3>
        <div className="space-y-2 text-gray-700 text-sm">
          <p><strong>From:</strong> {transport.from || transport.departure}</p>
          <p><strong>To:</strong> {transport.to || transport.destination}</p>
          <p><strong>Departure Time:</strong> {transport.departureTime || "N/A"}</p>
          <p><strong>Arrival Time:</strong> {transport.arrivalTime || "N/A"}</p>
          <p><strong>Duration:</strong> {transport.duration || "N/A"}</p>
          <p><strong>Carrier:</strong> {transport.airlineName || transport.trainName || transport.busCompany || "N/A"}</p>
          <p><strong>Price:</strong> ₹{transport.price || transport.cost || "N/A"}</p>
        </div>

        <hr className="my-4" />

        <h3 className="font-semibold text-lg mb-2">Payment Method</h3>
        <div className="space-y-2">
          <label className="block">
            <input type="radio" name="payment" className="mr-2" defaultChecked /> Credit / Debit Card
          </label>
          <label className="block">
            <input type="radio" name="payment" className="mr-2" /> UPI / Google Pay / PhonePe
          </label>
          <label className="block">
            <input type="radio" name="payment" className="mr-2" /> Net Banking
          </label>
        </div>

        <button
          onClick={handlePayment}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Pay ₹{transport.price || transport.cost || "N/A"} Now
        </button>
      </div>
    </div>
  );
}

export default PaymentPage;
