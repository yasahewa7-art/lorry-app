const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 8080;

if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in .env");
}

// Home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Fare calculation API
app.post("/api/calculate-fare", async (req, res) => {

    try {

        const { destination, vehicle } = req.body;

        // Check destination
        if (!destination || destination.trim() === "") {

            return res.status(400).json({
                success: false,
                error: "කරුණාකර ගමනාන්තය ඇතුළත් කරන්න."
            });

        }

        // Check API key
        if (!API_KEY) {

            return res.status(500).json({
                success: false,
                error: "Gemini API key එක .env file එකේ නැහැ."
            });

        }

        const vehicleName = vehicle || "Mahindra Bolero";

        const prompt = `
You are a Sri Lankan vehicle transport fare calculator.

Starting location:
Paburana, Matara, Sri Lanka

Destination:
${destination}

Vehicle:
${vehicleName}

Calculate an estimated road distance and transport fare.

Pricing rules:

Base fare = Rs. 3500

Additional charge = Rs. 250 per kilometer

Formula:

Fare = 3500 + (Distance × 250)

For example:

If distance is 20 km:
Fare = 3500 + (20 × 250)
Fare = Rs. 8500

Return ONLY this format:

Distance: XX km
Fare: Rs. XXXX

Do not provide explanations.
Do not use markdown.
`;

        // Gemini API (Updated with stable gemini-1.5-flash model)
        const apiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": API_KEY
                },

                body: JSON.stringify({

                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]

                })
            }
        );

        const data = await apiResponse.json();

        // Gemini API error
        if (!apiResponse.ok) {

            console.error("Gemini API Error:");
            console.error(data);

            return res.status(apiResponse.status).json({
                success: false,
                error:
                    data?.error?.message ||
                    "Gemini API request failed."
            });
        }

        // Get Gemini response
        const result =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) {

            return res.status(500).json({
                success: false,
                error: "Gemini response එක ලැබුණේ නැහැ."
            });
        }

        // Send result to browser
        res.json({
            success: true,
            destination: destination,
            vehicle: vehicleName,
            result: result.trim()
        });

    }

    catch (error) {

        console.error("Server Error:");
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message || "Unknown server error."
        });

    }

});

// Start server
app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("🚚 Paburana Fare Calculator");
    console.log("======================================");
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log("======================================");
    console.log("");

});
