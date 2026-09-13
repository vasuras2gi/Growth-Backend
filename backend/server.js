// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import playlistRoutes from './routes/playlistRoutes.js';
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();
connectDB(); // Database connection function

const app = express();

const corsOptions = {
    origin: '*', // Development ke liye '*' theek hai, ya fir 'chrome-extension://cakpomdnlpabppdikmdcocjjiflmlifb'
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// app.use(cors({
//     origin: ["http://localhost:5173", "chrome-extension:cakpomdnlpabppdikmdcocjjiflmlifb"],
//     methods: ["GET", "POST", "PATCH"],
//     credentials: true
// }));

app.use(express.json());

app.use('/api/playlist', playlistRoutes);

app.get('/api/download-extension', (req, res) => {
  // Navigates up one folder level from 'backend' to reach 'extension'
  const filePath = path.join(__dirname, '../extension/growth-extension.zip');
  res.download(filePath, 'Growth_Chrome_Extension.zip', (err) => {
    if (err) {
      console.error("File download failed:", err);
      res.status(404).send("File not found");
    }
  });
});

app.get('/', (req, res) => {
    res.send('SkillFlow API is running...');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));