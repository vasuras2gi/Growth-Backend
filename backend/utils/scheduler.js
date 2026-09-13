// utils/scheduler.js

export const createSchedule = (videos, goalDays) => {
    const schedule = [];
    const totalVideos = videos.length;
    
    // Average videos per day calculate karein (float mein)
    const avgVideosPerDay = totalVideos / goalDays;

    for (let i = 0; i < goalDays; i++) {
        // Precise start aur end index nikalne ke liye
        const start = Math.floor(i * avgVideosPerDay);
        const end = Math.floor((i + 1) * avgVideosPerDay);
        
        const dailyVideos = videos.slice(start, end);

        schedule.push({
            day: i + 1,
            // Agar kisi din ke liye videos nahi bache, toh empty array bhejega
            videos: dailyVideos.map(v => ({
                videoId: v.videoId,
                title: v.title,
                thumbnail: v.thumbnail,
                durationSec: Number(v.durationSec || 0),
                isCompleted: false
            }))
        });
    }

    return schedule;
};



// // utils/scheduler.js

// export const createSchedule = (videos, goalDays) => {
//     const schedule = [];
//     // Har din kitni videos deni hain uska calculation
//     const videosPerDay = Math.ceil(videos.length / goalDays);

//     for (let i = 0; i < goalDays; i++) {
//         const start = i * videosPerDay;
//         const end = start + videosPerDay;
//         const dailyVideos = videos.slice(start, end);

//         // Sirf tabhi add karein jab us din ke liye videos bachi hon
//         if (dailyVideos.length > 0) {
//             schedule.push({
//                 day: i + 1,
//                 // YAHAN FIX HAI: Ab 'v' ke andar seedhe videoId aur title hai
//                 videos: dailyVideos.map(v => ({
//                     videoId: v.videoId, // Pehle ye v.snippet.resourceId.videoId tha
//                     title: v.title,     // Pehle ye v.snippet.title tha
//                     thumbnail: v.thumbnail,
//                     isCompleted: false
//                 }))
//             });
//         }
//     }
//     return schedule;
// };