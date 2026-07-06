import React, { useState, useEffect, useRef } from "react";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function TravelAIChat({ trip }) {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: `Hi! I’m your travel assistant. How can I help you with your trip to ${
        trip?.UserSelection?.destination || "your destination"
      }?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  // 🎙️ Setup voice recognition on load
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
      };
    }
  }, []);

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    synthRef.current.speak(utterance);
  };

  const sendMessage = async (textOverride = "") => {
    const userInput = textOverride || input.trim();
    if (!userInput) return;

    const userMessage = { from: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const prompt = `
You are a helpful travel assistant AI.
The user is traveling to ${
        trip?.UserSelection?.destination || "an unknown destination"
      }.
Answer their questions based on this travel context.

User: ${userInput}
AI:
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const result = await response.json();
      console.log(result);
      const aiReply =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";
      console.log(aiReply);
      setMessages((prev) => [...prev, { from: "ai", text: aiReply }]);
      speakText(aiReply);
    } catch (err) {
      console.error("Gemini API error:", err);
      const errorMsg = "Oops! Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { from: "ai", text: errorMsg }]);
      speakText(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="border rounded-2xl p-6 max-w-xl mx-auto bg-white shadow-xl mt-8">
      <h3 className="text-xl font-bold mb-4 text-blue-800">
        🎤 Talk to Travel AI
      </h3>

      <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.from === "ai"
                ? "bg-blue-100 text-left"
                : "bg-green-100 text-right ml-auto"
            }`}
          >
            <p className="text-sm">{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Ask something about your trip..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) sendMessage();
          }}
          className="flex-grow border px-4 py-2 rounded-lg shadow-sm focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700"
        >
          {loading ? "..." : "Send"}
        </button>
        <button
          onClick={handleVoiceInput}
          title="Use voice"
          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
        >
          🎙️
        </button>
      </div>
    </div>
  );
}

export default TravelAIChat;
