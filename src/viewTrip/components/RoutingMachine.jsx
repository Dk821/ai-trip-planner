import L from "leaflet";
import "leaflet-routing-machine";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

function RoutingMachine({ waypoints }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!waypoints || waypoints.length < 2 || !map) return;

    // Remove old control if it exists
    if (controlRef.current) {
      map.removeControl(controlRef.current);
    }

    const control = L.Routing.control({
      waypoints: waypoints.map((pt) => L.latLng(pt.lat, pt.lng)),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null, // Optional: hide extra markers
    }).addTo(map);

    controlRef.current = control;

    control.on("routesfound", (e) => {
      const route = e.routes[0];
      const instructions = [];

      // Extract instructions from summary and segments
      route.instructions?.forEach((step) => {
        instructions.push(step.text);
      });

      if (instructions.length === 0 && route?.segments?.length > 0) {
        route.segments[0].steps?.forEach((step) => {
          instructions.push(step.instruction || step.text || "Continue");
        });
      }

      instructions.forEach((text, i) => {
        setTimeout(() => {
          speakText(text);
        }, i * 5000); // 5s between steps
      });

      // Zoom to fit the route
      const bounds = L.latLngBounds([]);
      route.coordinates.forEach((coord) => {
        bounds.extend(L.latLng(coord.lat, coord.lng));
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    });

    return () => {
      if (control) map.removeControl(control);
    };
  }, [waypoints, map]);

  return null;
}

export default RoutingMachine;
