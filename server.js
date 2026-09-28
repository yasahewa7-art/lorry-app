const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // හෝ Node 18+ වල බිල්ට්-ඉන් fetch පාවිච්චි වේ

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ඔබේ AQ. වලින් පටන් ගන්නා API Key එක මෙහි දමන්න
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

        // කෙළින්ම Google Gemini REST API එකට Fetch රික්වෙස්ට් එකක් යැවීම (AQ. keys සඳහා වඩාත්ම ගැළපේ)
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                systemInstruction: {
                    parts: [{ text: "ඔබ ශ්‍රී ලංකාවේ මාතර පඹුරුන සිට අනෙකුත් ප්‍රදේශවලට Mahindra Bolero Lorry රථයක ප්‍රවාහන ගාස්තු ගණනය කරදෙන AI සහායකයෙක් වෙයි." }]
                }
            })
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            throw new Error(data.error?.message || 'API Error occurred');
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
