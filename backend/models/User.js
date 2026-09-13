import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // e.g., "test_user_123"
  activePlaylistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Playlist' // Referencing Playlist Model
  }, 
  // Is array mein sirf Playlist ki IDs store hongi
  playlists: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Playlist' 
  }],
  lastLogin: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);