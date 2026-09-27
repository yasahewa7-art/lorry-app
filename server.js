const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// ගාණ ගණනය කරන ෆන්ක්ෂන් එක (Fare Calculation Logic)
function calculateFare(distanceInKm) {
    let totalFare = 0;

    if (distanceInKm <= 1.0) {
        totalFare = 800;
    } 
    else if (distanceInKm <= 1.5) {
        totalFare = 1500;
    } 
    else if (distanceInKm <= 7.0) {
        totalFare = 2000;
    } 
    else if (distanceInKm <= 16.0) {
        let extraKm = distanceInKm - 7;
        let extraRate = (7000 - 2000) / (16 - 7);
        totalFare = 2000 + (extraKm * extraRate);
    } 
    else {
        let extraKm = distanceInKm - 16;
        totalFare = 7000 + (extraKm * 500);
    }

    return Math.round(totalFare);
}

// API Endpoint එක (ඇප් එකෙන් දුර එව්වම ගාණ ප්‍රතිචාර දක්වන තැන)
app.post('/api/calculate-fare', (req, res) => {
    const { distanceKm } = req.body;

    if (distanceKm === undefined || distanceKm < 0) {
        return res.status(400).json({ error: "කරුණාකර సరైన දුර ප්‍රමාණයක් (Distance) ලබා දෙන්න." });
    }

    let fare = calculateFare(distanceKm);

    res.json({
        distanceKm: distanceKm,
        totalFareLKR: fare
    });
});

// සර්වර් එක ස්ටාර්ට් කිරීම
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Bolero Lorry Backend සර්වර් එක ක්‍රියාත්මකයි: http://localhost:${PORT}`);
});
