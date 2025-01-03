import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // Import multer
import chat from "./chat.js";

dotenv.config();

const app = express();

app.use(cors());

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

const PORT = 5001;

let filePath;

app.post("/upload", upload.single("file"), (req, res) => {
    // do something
    filePath = req.file.path;
    res.send(filePath + " Upload successfully! ")
});

app.get("/chat", async (req, res) => {
    const resp = await chat(req.query.question, filePath);
    res.send(resp.text);
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT} 🎉`);
});


    