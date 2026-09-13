import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: String, required: true },
    playlistUrl: { type: String, required: true },
    title: { type: String },
    totalVideos: { type: Number },
    goalDays: { type: Number, default: 10 },
    streakCount: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
    dailySchedule: [{
        day: Number,
        videos: [{
            videoId: String,
            title: String,
            durationSec: { type: Number, default: 0 }, // Iska naam 'durationSec' rakhein
            thumbnail: String,
            isCompleted: { type: Boolean, default: false }
        }]
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Playlist', playlistSchema);