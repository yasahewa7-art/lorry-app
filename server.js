const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Railway හි Variables වලින් API Key එක ලබා ගැනීම
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/api/calculate-fare', async (req, res) => {
    try {
        const { destination } = req.body;
        
        if (!destination) {
            return res.status(400).json({ error: 'කරුණාකර ගමනාන්තය ඇතුළත් කරන්න.' });
        }

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: "ඔබ ශ්‍රී ලංකාවේ මාතර පඹුරුන සිට අනෙකුත් ප්‍රදේශවලට Mahindra Bolero Lorry රථයක ප්‍රවාහන ගාස්තු ගණනය කරදෙන AI සහායකයෙක් වෙයි. මූලික ගාස්තුව රු. 3500 ක් වන අතර ඊට පසු එක් කිලෝමීටරයකට රු. 250 ක් අය කෙරේ. ලැයිස්තුවේ නැති ඕනෑම අභ්‍යන්තර ප්‍රදේශයක් හෝ නගරයක් සඳහාද Google Maps දත්ත මත පදනම්ව දුර නිවැරදිව ගණනය කර ලබා දෙන්න."
        });

        const prompt = `ශ්‍රී ලංකාවේ මාතර පඹුරුන සිට ${destination} දක්වා ඇති සැබෑ මාර්ග දුර (කිලෝමීටර වලින්) ගණනය කරන්න.
        පහත ආකෘතියට පමණක් පිළිතුර දෙන්න:
        Distance: [දුර කි.මී ප්‍රමාණය] km
        Fare: Rs. [මුළු ගාස්තුව]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResult = response.text();

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
