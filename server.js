const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ඔබේ AQ. වලින් පටන් ගන්නා කී එක මෙහි දමන්න
const API_KEY = 'AQ.Ab8RN6I10M2yHBbT2o_LyESEhYSbCRNieznpmXR6RNkx_UQsQ';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/api/calculate-fare', async (req, res) => {
    try {
        const { destination } = req.body;
        
        if (!destination) {
            return res.status(400).json({ error: 'කරුණාකර ගමනාන්තය ඇතුළත් කරන්න.' });
        }

        const prompt = `ශ්‍රී ලංකාවේ මාතර පඹුරුන සිට ${destination} දක්වා Mahindra Bolero Lorry රථයක ප්‍රවාහන ගාස්තුව ගණනය කරන්න. මූලික ගාස්තුව රු. 3500 ක් වන අතර එක් කිලෝමීටරයකට රු. 250 කි.
        පහත ආකෘතියට පමණක් පිළිතුර දෙන්න:
        Distance: [දුර කි.මී ප්‍රමාණය] km
        Fare: Rs. [මුළු ගාස්තුව]`;

        // AQ. (OAuth) කී සඳහා Bearer Token ලෙස Header එක හරහා රික්වෙස්ට් එක යැවීම
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            throw new Error(data.error?.message || JSON.stringify(data));
        }

        const textResult = data.candidates[0].content.parts[0].text;
        res.json({ success: true, result: textResult });

    } catch (error) {
        console.error('API Error Details:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Unknown error', 
            fullError: error.toString() 
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
