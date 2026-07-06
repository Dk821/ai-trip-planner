import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig"; // Adjust path
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectTravelesList, SelectBudgetOptions } from "../../constants/options";
import { toast } from "sonner";

function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    location: "",
    startDate: "",
    noOfDays: "",
    traveler: "",
    budget: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      setLoading(true);
      try {
        const docRef = doc(db, "AiTravel", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const userSelection = data.UserSelection || {};
          setFormData({
            location: userSelection.location || "",
            startDate: userSelection.startDate || "",
            noOfDays: userSelection.noOfDays || "",
            traveler: userSelection.traveler || "",
            budget: userSelection.budget || "",
          });
        } else {
          toast.error("Trip not found");
          navigate("/profile");
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
        toast.error("Failed to load trip data");
      }
      setLoading(false);
    }

    fetchTrip();
  }, [id, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Basic validation
    if (
      !formData.location ||
      !formData.startDate ||
      !formData.noOfDays ||
      !formData.traveler ||
      !formData.budget
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "AiTravel", id);
      // Update only UserSelection part
      await setDoc(
        docRef,
        {
          UserSelection: formData,
        },
        { merge: true }
      );
      toast.success("Trip updated successfully!");
      navigate("/profile"); // or navigate to view page like `/view-trip/${id}`
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error("Failed to save trip. Try again.");
    }
    setSaving(false);
  };

  if (loading) return <p className="p-5">Loading trip details...</p>;

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h2 className="text-2xl font-bold mb-6">Edit Trip Details</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Location</label>
        <Input
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          placeholder="Enter your destination"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Start Date</label>
        <Input
          type="date"
          value={formData.startDate}
          onChange={(e) => handleInputChange("startDate", e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Number of Days</label>
        <Input
          type="number"
          min={1}
          value={formData.noOfDays}
          onChange={(e) => handleInputChange("noOfDays", e.target.value)}
          placeholder="Enter duration"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Traveler Type</label>
        <div className="grid grid-cols-3 gap-4">
          {SelectTravelesList.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleInputChange("traveler", option.people)}
              className={`p-3 border rounded ${
                formData.traveler === option.people
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black"
              }`}
            >
              <div className="text-2xl">{option.icon}</div>
              <div className="font-semibold">{option.title}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-1">Budget</label>
        <div className="grid grid-cols-3 gap-4">
          {SelectBudgetOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleInputChange("budget", option.title)}
              className={`p-3 border rounded ${
                formData.budget === option.title
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black"
              }`}
            >
              <div className="text-2xl">{option.icon}</div>
              <div className="font-semibold">{option.title}</div>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

export default EditTrip;
