const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

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

// API endpoint එක
app.post('/api/calculate', (req, res) => {
    const { destination, distance } = req.body;
    
    // ඩීටීආර් / කිලෝමීටර් ලැබුණු පසු ගාණ සකස් කිරීම
    if (!distance) {
        return res.status(400).json({ error: "කිලෝමීටර් ප්‍රමාණය අවශ්‍යයි." });
    }

    let fare = calculateFare(parseFloat(distance));
    res.json({
        destination: destination,
        distance: distance,
        fare: fare
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
