const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const textToSpeech = require("@google-cloud/text-to-speech");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Google Cloud TTS Client
const client = new textToSpeech.TextToSpeechClient();

// Pronunciation API
app.post("/pronounce", async (req, res) => {
    try {
        const { text, language } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        // Text-to-Speech request
        const request = {
            input: { text },
            voice: { languageCode: language || "en-US", ssmlGender: "NEUTRAL" },
            audioConfig: { audioEncoding: "MP3" },
        };

        const [response] = await client.synthesizeSpeech(request);

        // Send the audio file as a response (no saving to file system)
        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Disposition": 'inline; filename="output.mp3"',
        });

        res.send(response.audioContent);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Default Route
app.get("/", (req, res) => {
    res.send("Google Text-to-Speech API is running.");
});

// Start server
app.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
});
