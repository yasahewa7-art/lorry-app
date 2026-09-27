const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ඔබ ලබා දුන් නිවැරදි API Key එක මෙහි ඇතුළත් කර ඇත
const GEMINI_API_KEY = "AQ.Ab8RN6K2EraXyiwjGE-yaOpb5eQB-Mw2WsCepSoeEz9HZJa0kA";

// ගාණ ගණනය කිරීමේ සූත්‍රය
function calculateFare(distanceInKm) {
    let totalFare = 0;
    if (distanceInKm <= 1.0) {
        totalFare = 800;
    } else if (distanceInKm <= 1.5) {
        totalFare = 1500;
    } else if (distanceInKm <= 7.0) {
        totalFare = 2000;
    } else if (distanceInKm <= 16.0) {
        let extraKm = distanceInKm - 7;
        let extraRate = (7000 - 2000) / (16 - 7);
        totalFare = 2000 + (extraKm * extraRate);
    } else {
        let extraKm = distanceInKm - 16;
        totalFare = 7000 + (extraKm * 500);
    }
    return Math.round(totalFare);
}

// API Endpoint එක
app.post('/api/calculate', async (req, res) => {
    const { destination } = req.body;
    
    if (!destination) {
        return res.status(400).json({ error: 'ගමනාන්තය ඇතුළත් කර නැත.' });
    }

    try {
        const promptText = `Sri Lanka: Calculate the road distance in kilometers (only the number) from Pamburana (Matara) to "${destination}". If it is a valid place in Sri Lanka, reply with ONLY the numeric value of kilometers (e.g., 14 or 45.5). If the place does not exist or is invalid, reply with "INVALID".`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            return res.json({ success: false, message: 'AI වෙතින් ප්‍රතිචාරයක් ලැබුණේ නැත.' });
        }

        let aiOutput = data.candidates[0].content.parts[0].text.trim();
        let distance = parseFloat(aiOutput);

        if (isNaN(distance) || aiOutput.includes("INVALID")) {
            return res.json({ success: false, message: `සමාවෙන්න, "${destination}" යන ස්ථානය හඳුනාගැනීමට නොහැකි විය.` });
        }

        let fare = calculateFare(distance);
        res.json({
            success: true,
            destination: destination,
            distance: distance,
            fare: fare
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'සර්වර් දෝෂයක් සිදු විය.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
