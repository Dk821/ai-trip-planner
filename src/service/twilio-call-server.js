const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
const PORT = 5000;

// Replace these with your Twilio credentials
const accountSid = "YOUR_TWILIO_ACCOUNT_SID";
const authToken = "YOUR_TWILIO_AUTH_TOKEN";
const twilioNumber = "+1415xxxxxxx"; // Your Twilio phone number
const twimlUrl = "https://your-ngrok-or-server.com/api/voice-response"; // Public URL

const client = twilio(accountSid, authToken);

app.use(cors());
app.use(bodyParser.json());

app.post("/api/call", async (req, res) => {
  const { to } = req.body;
  try {
    const call = await client.calls.create({
      url: twimlUrl,
      to,
      from: twilioNumber,
    });
    console.log("Call SID:", call.sid);
    res.status(200).send("Call initiated");
  } catch (error) {
    console.error("Twilio error:", error);
    res.status(500).send("Call failed");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
