// extension/script.js

const initIcons = () => {
  if (window.lucide) {
    lucide.createIcons();
  }
};

async function fetchActiveTasks() {
  const container = document.getElementById('video-list');
  try {
    const res = await fetch('http://localhost:5002/api/playlist/test_user_123');
    if (!res.ok) throw new Error('No active roadmap found');
    
    const data = await res.json();
    const playlist = data.playlist;

    if (!playlist || !playlist.dailySchedule) {
      container.innerHTML = `
        <div class="text-center py-20 glass-card rounded-3xl">
          <i data-lucide="target" class="w-16 h-16 text-gray-600 mx-auto mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-300 mb-2">No Active Goal</h2>
          <p class="text-gray-500">Go to your dashboard and set a roadmap as active.</p>
        </div>`;
      initIcons();
      document.getElementById('roadmap-title').textContent = "Welcome back!";
      document.getElementById('day-label').classList.add('hidden');
      return;
    }

    document.getElementById('roadmap-title').textContent = playlist.title;
    
    if (playlist.streakCount > 0) {
      document.getElementById('streak-counter').textContent = playlist.streakCount;
      document.getElementById('streak-container').classList.remove('hidden');
      document.getElementById('streak-container').classList.add('flex');
    }

    const currentDay = playlist.dailySchedule.find(d => 
      d.videos.some(v => !v.isCompleted)
    );

    if (!currentDay) {
      document.getElementById('day-label').textContent = '🎉 Roadmap Completed!';
      document.getElementById('day-label').className = "px-4 py-1.5 text-sm font-medium text-green-400 bg-green-900 rounded-full border border-green-500";
      container.innerHTML = `
        <div class="text-center py-20 glass-card rounded-3xl">
          <i data-lucide="award" class="w-20 h-20 text-green-500 mx-auto mb-4"></i>
          <h2 class="text-3xl font-bold text-white mb-2">Incredible Work!</h2>
          <p class="text-gray-400">You've finished all days in this roadmap. Time for a new challenge!</p>
        </div>`;
      initIcons();
      return;
    }

    document.getElementById('day-label').innerHTML = `<i data-lucide="calendar" class="w-4 h-4 inline-block mr-1 -mt-0.5"></i> Day ${currentDay.day} of ${playlist.goalDays}`;
    
    container.innerHTML = ''; // Clear loader

    currentDay.videos.forEach(video => {
      const card = document.createElement('div');
      
      const cardStyle = video.isCompleted 
        ? 'bg-gray-900 border border-green-500 opacity-80' 
        : 'glass-card cursor-pointer group transition-all duration-300';
        
      const imgStyle = video.isCompleted ? 'grayscale opacity-50' : 'group-hover:scale-105 transition-transform duration-500';
      const titleStyle = video.isCompleted ? 'line-through text-gray-500' : 'text-gray-100';

      card.className = `flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl overflow-hidden relative ${cardStyle}`;
      
      card.innerHTML = `
        <div class="relative w-full sm:w-56 shrink-0 rounded-xl overflow-hidden aspect-video bg-gray-900">
          <img src="${video.thumbnail}" class="w-full h-full object-cover ${imgStyle}" />
        </div>

        <div class="flex-1 min-w-0 py-1">
          <h3 class="text-lg font-semibold mb-2 line-clamp-2 ${titleStyle}">${video.title}</h3>
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <span class="flex items-center gap-1.5 bg-gray-800 px-3 py-1 rounded-md">
              <i data-lucide="clock" class="w-4 h-4"></i> 
              ${Math.floor(video.durationSec / 60)} mins
            </span>
          </div>
        </div>

        <div class="flex sm:flex-col gap-3 w-full sm:w-auto sm:min-w-[140px] mt-4 sm:mt-0 z-10">
          <a href="https://youtube.com/watch?v=${video.videoId}" target="_blank" 
             class="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <i data-lucide="external-link" class="w-4 h-4"></i> Watch
          </a>
          <button class="mark-btn flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${video.isCompleted ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-green-900 text-green-400 border border-green-500 hover:bg-green-700 hover:text-white'}">
            <i data-lucide="${video.isCompleted ? 'rotate-ccw' : 'check-circle'}" class="w-4 h-4"></i>
            ${video.isCompleted ? 'Undo' : 'Mark Done'}
          </button>
        </div>
      `;
      container.appendChild(card);

      // Event Listener (MV3 Safe) - replaces old onclick attribute
      const markBtn = card.querySelector('.mark-btn');
      markBtn.addEventListener('click', () => {
         markCompleted(playlist._id, currentDay.day, video.videoId, !video.isCompleted);
      });
    });
    
    initIcons();
  } catch (err) {
    document.getElementById('day-label').textContent = 'Connection Error';
    document.getElementById('day-label').className = "px-4 py-1.5 text-sm font-medium text-red-400 bg-red-900 rounded-full border border-red-500";
    container.innerHTML = `
      <div class="text-center py-10 border border-red-500 bg-red-900 rounded-2xl">
        <i data-lucide="server-crash" class="w-12 h-12 text-red-500 mx-auto mb-3"></i>
        <p class="text-red-400">Failed to connect to the backend server.</p>
        <p class="text-sm text-gray-500 mt-2">Make sure localhost:5002 is running.</p>
      </div>`;
    initIcons();
  }
}

async function markCompleted(playlistId, day, videoId, isCompleted) {
  try {
    await fetch('http://localhost:5002/api/playlist/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlistId, day, videoId, isCompleted })
    });
    window.location.reload();
  } catch (error) {
    alert("Failed to update status. Is server running?");
  }
}

fetchActiveTasks();