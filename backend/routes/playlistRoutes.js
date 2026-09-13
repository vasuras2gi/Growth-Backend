import express from 'express';
import { getPlaylistId, fetchPlaylistVideos } from '../utils/youtubeApi.js';
import { createSchedule } from '../utils/scheduler.js';
import Playlist from '../models/Playlist.js';
import User from '../models/User.js';

const router = express.Router();

// ==========================================
// 1. STATIC & SPECIFIC ROUTES
// ==========================================

// GET ALL PLAYLISTS 
router.get('/all/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId }).populate({
            path: 'playlists',
            options: { sort: { createdAt: -1 } }
        });
        
        if (!user) return res.json({ playlists: [] });
        res.json({ playlists: user.playlists || [] });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all roadmaps", error: error.message });
    }
});

// GENERATE NEW PLAYLIST
router.post('/generate', async (req, res) => {
    const { url, goalDays, userId, title } = req.body;
    
    // Check for missing fields immediately to avoid validation errors
    if (!userId || !url) {
        return res.status(400).json({ message: "userId and url are required" });
    }
    
    try {
        // 1. Find or Create User
        let user = await User.findOne({ userId: userId });
        if (!user) {
            user = new User({ 
                userId: userId,
                lastLogin: new Date()
            });
            await user.save();
        }

        const playlistId = getPlaylistId(url);
        if (!playlistId) return res.status(400).json({ message: "Invalid URL" });

        // 2. Fetch Videos
        const videos = await fetchPlaylistVideos(playlistId);
        if (!videos || videos.length === 0) {
            return res.status(500).json({ message: "Error fetching videos or playlist is empty" });
        }

        // 3. Create Schedule
        const schedule = createSchedule(videos, goalDays);

        // 4. Create Playlist
        const newPlaylist = new Playlist({
            owner: user._id, // Must be MongoDB _id
            userId: userId,   // Must match your schema requirement
            playlistUrl: url,
            title: title || `Roadmap - ${goalDays} Days`,
            goalDays: Number(goalDays) || 10,
            dailySchedule: schedule.map(day => ({
                day: day.day,
                videos: day.videos.map(v => ({
                    videoId: v.videoId,
                    title: v.title,
                    thumbnail: v.thumbnail,
                    // Ensuring Number type so it doesn't stay 0 in Atlas
                    durationSec: Number(v.durationSec) || 0 
                }))
            }))
        });

        const savedPlaylist = await newPlaylist.save();

        // 5. Update User context
        user.playlists.push(savedPlaylist._id);
        user.activePlaylistId = savedPlaylist._id;
        await user.save();

        res.status(201).json(savedPlaylist);
    } catch (error) {
        console.error("Generation Error Details:", error);
        res.status(500).json({ 
            message: "Generation Failed", 
            error: error.message 
        });
    }
});

// SWITCH ACTIVE PLAYLIST
router.patch('/switch', async (req, res) => {
    const { userId, playlistId } = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate(
            { userId: userId },
            { $set: { activePlaylistId: playlistId } },
            { new: true }
        ).populate('activePlaylistId');

        res.json({ message: "Switched successfully", activePlaylist: updatedUser.activePlaylistId });
    } catch (error) {
        res.status(500).json({ message: "Switch failed" });
    }
});

// UPDATE VIDEO STATUS & STREAK
router.patch('/update-status', async (req, res) => {
    const { playlistId, day, videoId, isCompleted } = req.body;
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        const dayData = playlist.dailySchedule.find(d => d.day === Number(day));
        if (!dayData) return res.status(404).json({ message: "Day not found" });

        const video = dayData.videos.find(v => v.videoId === videoId);
        if (!video) return res.status(404).json({ message: "Video not found" });

        video.isCompleted = isCompleted;

        // Streak Logic
        if (isCompleted) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            
            let lastActiveDate = playlist.lastActivityDate ? new Date(playlist.lastActivityDate) : null;
            const lastActive = lastActiveDate 
                ? new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate()).getTime() 
                : null;

            const oneDay = 86400000;

            if (!lastActive) {
                playlist.streakCount = 1;
            } else if (lastActive === today - oneDay) {
                playlist.streakCount += 1;
            } else if (lastActive < today - oneDay) {
                playlist.streakCount = 1;
            }
            
            playlist.lastActivityDate = now;
        }

        await playlist.save();
        res.json({ playlist, streak: playlist.streakCount });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
});

// ==========================================
// 2. DYNAMIC WILDCARD ROUTES (At the bottom)
// ==========================================

router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId }).populate('activePlaylistId');
        
        if (!user || !user.activePlaylistId) {
            const fallback = await Playlist.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
            if (!fallback) return res.status(404).json({ message: "No roadmap found" });
            return res.json({ playlist: fallback });
        }

        res.json({ playlist: user.activePlaylistId });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

export default router;