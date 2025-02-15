const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const util = require("util");

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
            voice: { languageCode: language, ssmlGender: "NEUTRAL" },
            audioConfig: { audioEncoding: "MP3" },
        };

        const [response] = await client.synthesizeSpeech(request);

        // Save the audio file
        const writeFile = util.promisify(fs.writeFile);
        const fileName = `output.mp3`;
        await writeFile(fileName, response.audioContent, "binary");

        // Send the audio file
        res.sendFile(__dirname + "/" + fileName);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
