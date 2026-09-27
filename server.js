const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Frontend එක public ෆෝල්ඩර් එකක තැබිය හැක, හෝ යට සර්ව් කර ඇත

// Google AI අනුමත API Key එක මෙහි ඇතුළත් කර ඇත
const ai = new GoogleGenAI({ apiKey: 'YOUR_GEMINI_API_KEY' });

// මාතර පඹුරුන සිට ගාස්තු ගණනය කිරීමේ සූත්‍රය සහ API Call එක
app.post('/api/calculate-fare', async (req, res) => {
    try {
        const { destination } = req.body;
        
        if (!destination) {
            return res.status(400).json({ error: 'කරුණාකර ගමනාන්තය ඇතුළත් කරන්න.' });
        }

        const prompt = `ශ්‍රී ලංකාවේ මාතර පඹුරුන සිට ${destination} දක්වා ඇති සැබෑ මාර්ග දුර (කැලිමීටර වලින්) කොපමණදැයි ගූගල් සිතියම් දත්ත මත පදනම්ව ගණනය කරන්න. 
        පිළිතුර ලබා දීමේදී:
        1. දුර කිලෝමීටර (km) වලින් පමණක් අංකයක් ලෙස මුලින්ම දෙන්න.
        2. ඊට අමතරව, මාතර පඹුරුන සිට ${destination} දක්වා Mahindra Bolero Lorry රථයක ගාස්තුව ගණනය කරන්න (මූලික ගාස්තුව රු. 3500 ක් සහ ඊට පසු එක් කිලෝමීටරයකට රු. 250 ක් ලෙස).
        පහත ආකෘතියට පමණක් පිළිතුර දෙන්න:
        Distance: [දුර කි.මී ප්‍රමාණය] km
        Fare: Rs. [මුළු ගාස්තුව]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const textResult = response.text;
        res.json({ success: true, result: textResult });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: 'දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
