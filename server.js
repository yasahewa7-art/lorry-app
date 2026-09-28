const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Environment variable එකෙන් API Key එක ලබා ගැනීම
const API_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/api/calculate-fare", async (req, res) => {
    try {
        const { destination, vehicle } = req.body;

        if (!destination) {
            return res.status(400).json({
                success: false,
                error: "ගමනාන්තය ඇතුළත් කරන්න."
            });
        }

        if (!API_KEY) {
            return res.status(500).json({
                success: false,
                error: "API Key එක සර්වර් එකේ සෙට් කර නැත."
            });
        }

        const vehicleName = vehicle || "Mahindra Bolero Lorry";

        const prompt = `
You are a Sri Lankan transport fare calculator.

Starting point:
Paburana, Matara, Sri Lanka

Destination:
${destination}

Vehicle:
${vehicleName}

Calculate an estimated transport fare.

Important:
- Give the approximate road distance in kilometers.
- Use a reasonable Sri Lankan road-distance estimate.
- Base fare = Rs. 3500
- Additional charge = Rs. 250 per km
- Calculate:
  Fare = 3500 + (distance × 250)

Return ONLY this format:

Distance: XX km
Fare: Rs. XXXX

Do not add explanations.
`;

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
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

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Error:", data);
            return res.status(response.status).json({
                success: false,
                error: data.error?.message || "Gemini API error"
            });
        }

        const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) {
            return res.status(500).json({
                success: false,
                error: "Gemini response එක ලැබුණේ නැහැ."
            });
        }

        res.json({
            success: true,
            result: result.trim()
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
