const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Frontend එක පෙන්වීමට

// ඔයාගේ අලුත් API Key එක මෙහි ඇතුළත් කර ඇත
const genAI = new GoogleGenerativeAI('AQ.Ab8RN6KuDCvxgAqjrC2BJRpHTUrvZuMssnWYV9yQQER9WLLuzeg');

// මුල් පිටුවට index.html යැවීම
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// ගාස්තු ගණනය කිරීමේ API Endpoint එක
app.post('/api/calculate-fare', async (req, res) => {
    try {
        const { destination } = req.body;
        
        if (!destination) {
            return res.status(400).json({ error: 'කරුණාකර ගමනාන්තය ඇතුළත් කරන්න.' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `ශ්‍රී ලංකාවේ මාතර පඹුරුන සිට ${destination} දක්වා ඇති සැබෑ මාර්ග දුර (කිලෝමීටර වලින්) කොපමණදැයි ගූගල් සිතියම් දත්ත මත පදනම්ව ගණනය කරන්න. 
        පිළිතුර ලබා දීමේදී:
        1. දුර කිලෝමීටර (km) වලින් පමණක් අංකයක් ලෙස මුලින්ම දෙන්න.
        2. ඊට අමතරව, මාතර පඹුරුන සිට ${destination} දක්වා Mahindra Bolero Lorry රථයක ගාස්තුව ගණනය කරන්න (මූලික ගාස්තුව රු. 3500 ක් සහ ඊට පසු එක් කිලෝමීටරයකට රු. 250 ක් ලෙස).
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
