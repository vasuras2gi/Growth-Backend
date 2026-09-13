import axios from 'axios';

/**
 * Playlist URL se ID extract karne ke liye
 */
export const getPlaylistId = (url) => {
    if (!url) return null;
    const regExp = /[&?]list=([^&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

/**
 * YouTube API se videos aur unki duration fetch karna
 */
export const fetchPlaylistVideos = async (playlistId) => {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!API_KEY) {
        console.error("Error: YOUTUBE_API_KEY is missing in .env file");
        return null;
    }

    let allVideos = [];
    let nextPageToken = '';

    try {
        do {
            // 1. Fetch Playlist Items
            const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
                params: {
                    part: 'snippet,contentDetails',
                    maxResults: 50,
                    playlistId: playlistId,
                    key: API_KEY,
                    pageToken: nextPageToken
                }
            });

            const items = playlistRes.data.items;
            if (!items || items.length === 0) break;

            // 2. Video IDs nikalna (Filtering out private/deleted videos)
            const videoIds = items
                .map(item => item.contentDetails.videoId)
                .filter(id => id)
                .join(',');

            // 3. Videos endpoint se exact duration fetch karna
            const videoDetailsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
                params: {
                    part: 'contentDetails',
                    id: videoIds,
                    key: API_KEY
                }
            });

            /**
             * ISO 8601 (PT1H2M30S) Helper - Improved Regex
             */
            const parseDuration = (isoString) => {
                if (!isoString) return 0;
                // Regex to capture Hours, Minutes, and Seconds accurately
                const match = isoString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                if (!match) return 0;

                const hours = parseInt(match[1] || 0, 10);
                const minutes = parseInt(match[2] || 0, 10);
                const seconds = parseInt(match[3] || 0, 10);

                return (hours * 3600) + (minutes * 60) + seconds;
            };

            // ID-wise duration mapping
            const durationMap = {};
            videoDetailsRes.data.items.forEach(v => {
                durationMap[v.id] = parseDuration(v.contentDetails.duration);
            });

            // 4. Data cleaning
            const fetchedVideos = items.map(item => {
                const vidId = item.contentDetails.videoId;
                return {
                    videoId: vidId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.maxres?.url || 
                               item.snippet.thumbnails.high?.url || 
                               item.snippet.thumbnails.medium?.url || 
                               item.snippet.thumbnails.default?.url,
                    durationSec: Number(durationMap[vidId] || 0)
                };
            });

            allVideos = [...allVideos, ...fetchedVideos];
            nextPageToken = playlistRes.data.nextPageToken;

        } while (nextPageToken);

        console.log(`Successfully fetched ${allVideos.length} videos with durations.`);
        return allVideos;

    } catch (error) {
        console.error("YouTube API Error Details:", error.response?.data || error.message);
        return null;
    }
};