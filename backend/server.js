// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import playlistRoutes from './routes/playlistRoutes.js';

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

app.get('/', (req, res) => {
    res.send('SkillFlow API is running...');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));