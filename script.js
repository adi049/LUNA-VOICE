/**
 * ==============================================================================
 * Spotify-Inspired Personal Music Card
 * ==============================================================================
 *
 * CONFIGURATION & EASY REPLACEMENT GUIDE:
 * 1. Artwork: Replace or place your image at "assets/cover.jpg"
 * 2. Audio:   Replace or place your audio file at "assets/song.mp3"
 * 3. Metadata: You can change the SONG_TITLE and ARTIST_NAME variables below!
 * ==============================================================================
 */

const CONFIG = {
  songTitle: "LUNA VOICE",
  artistName: "LUNA AI",
  coverPath: "assets/cover.jpg",
  audioPath: "assets/song.mp3"
};

// DOM Elements
const entryScreen = document.getElementById('entryScreen');
const entryBtn = document.getElementById('entryBtn');
const playerContainer = document.getElementById('playerContainer');
const backToEntryBtn = document.getElementById('backToEntryBtn');
const cardInfoBtn = document.getElementById('cardInfoBtn');

const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loopBtn = document.getElementById('loopBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const likeBtn = document.getElementById('likeBtn');
const shareBtn = document.getElementById('shareBtn');

const progressBarContainer = document.getElementById('progressBarContainer');
const progressBarFill = document.getElementById('progressBarFill');
const progressBarHandle = document.getElementById('progressBarHandle');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const statusText = document.getElementById('statusText');
const toastNotice = document.getElementById('toastNotice');

const trackTitleEl = document.getElementById('trackTitle');
const trackArtistEl = document.getElementById('trackArtist');
const coverImageEl = document.getElementById('coverImage');

// State variables
let isDraggingProgress = false;
let isShuffleActive = false;
let hasAttemptedInitialPlay = false;
let toastTimeout = null;

// Initialize Track Metadata from Config
function initTrackMetadata() {
  if (trackTitleEl) trackTitleEl.textContent = CONFIG.songTitle;
  if (trackArtistEl) trackArtistEl.textContent = CONFIG.artistName;
  if (coverImageEl) coverImageEl.src = CONFIG.coverPath;
}

// Format Seconds into mm:ss
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Toast Feedback Helper
function showToast(message, duration = 2400) {
  if (!toastNotice) return;
  toastNotice.textContent = message;
  toastNotice.classList.add('show');
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastNotice.classList.remove('show');
  }, duration);
}

// ==============================================================================
// 1. ENTRY SCREEN & SMOOTH ZOOM-IN TRANSITION
// ==============================================================================

function enterExperience() {
  if (entryScreen.classList.contains('zooming') || entryScreen.classList.contains('fading-out')) {
    return;
  }

  // Start zoom-in dramatic animation
  entryScreen.classList.add('zooming');

  // Trigger audio playback immediately on user gesture
  attemptPlayAudio();

  // Switch views smoothly
  setTimeout(() => {
    entryScreen.classList.add('fading-out');
    playerContainer.classList.remove('hidden');
    playerContainer.classList.add('enter-active');
  }, 450);

  setTimeout(() => {
    entryScreen.style.display = 'none';
  }, 900);
}

function returnToEntry() {
  entryScreen.style.display = 'flex';
  entryScreen.classList.remove('zooming', 'fading-out');
  playerContainer.classList.add('hidden');
  playerContainer.classList.remove('enter-active');
  
  if (!audio.paused) {
    audio.pause();
  }
}

// Entry listeners
if (entryScreen) {
  entryScreen.addEventListener('click', enterExperience);
}
if (backToEntryBtn) {
  backToEntryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    returnToEntry();
  });
}

// ==============================================================================
// 2. AUDIO PLAYBACK & CUSTOM CONTROLS
// ==============================================================================

function attemptPlayAudio() {
  const playPromise = audio.play();
  hasAttemptedInitialPlay = true;

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        updatePlayStateUI(true);
      })
      .catch((err) => {
        console.info("Audio autoplay notice / file status:", err.message);
        updatePlayStateUI(false);
        // If file is not present yet or blocked, show friendly guidance
        if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || audio.error) {
          showToast("🎵 Drop 'song.mp3' in the assets folder to hear your music");
        }
      });
  }
}

function togglePlayPause() {
  if (audio.paused) {
    audio.play()
      .then(() => {
        updatePlayStateUI(true);
      })
      .catch(() => {
        updatePlayStateUI(false);
        showToast("🎵 Add assets/song.mp3 to start audio");
      });
  } else {
    audio.pause();
    updatePlayStateUI(false);
  }
}

function updatePlayStateUI(isPlaying) {
  if (isPlaying) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    playerContainer.classList.add('playing');
    if (statusText) statusText.textContent = "Playing on High Quality Audio";
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    playerContainer.classList.remove('playing');
    if (statusText) statusText.textContent = "Audio Paused";
  }
}

// Skip backward 10s
function skipBackward() {
  if (isNaN(audio.duration) || audio.duration === 0) {
    audio.currentTime = 0;
  } else {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }
  updateProgressUI();
  showToast("↺ 10 seconds back");
}

// Skip forward 10s
function skipForward() {
  if (isNaN(audio.duration) || audio.duration === 0) {
    audio.currentTime = 0;
  } else {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  }
  updateProgressUI();
  showToast("↻ 10 seconds forward");
}

// Toggle Loop / Repeat
function toggleLoop() {
  audio.loop = !audio.loop;
  if (audio.loop) {
    loopBtn.classList.add('active');
    showToast("Repeat track: ON");
  } else {
    loopBtn.classList.remove('active');
    showToast("Repeat track: OFF");
  }
}

// Toggle Shuffle
function toggleShuffle() {
  isShuffleActive = !isShuffleActive;
  if (isShuffleActive) {
    shuffleBtn.classList.add('active');
    showToast("Shuffle mode: ON");
  } else {
    shuffleBtn.classList.remove('active');
    showToast("Shuffle mode: OFF");
  }
}

// Toggle Heart / Favorite
function toggleLike() {
  likeBtn.classList.toggle('liked');
  if (likeBtn.classList.contains('liked')) {
    showToast("Added to your favorites ❤️");
  } else {
    showToast("Removed from your favorites");
  }
}

// ==============================================================================
// 3. PROGRESS BAR & SCRUBBING
// ==============================================================================

function updateProgressUI() {
  if (isDraggingProgress) return;

  const current = audio.currentTime || 0;
  const duration = audio.duration || 0;

  currentTimeEl.textContent = formatTime(current);
  
  if (duration && !isNaN(duration)) {
    totalDurationEl.textContent = formatTime(duration);
    const progressPercent = (current / duration) * 100;
    progressBarFill.style.width = `${progressPercent}%`;
    progressBarHandle.style.left = `${progressPercent}%`;
    progressBarContainer.setAttribute('aria-valuenow', Math.round(progressPercent));
  } else {
    progressBarFill.style.width = "0%";
    progressBarHandle.style.left = "0%";
  }
}

function seekToPosition(event, isFinal = true) {
  const rect = progressBarContainer.getBoundingClientRect();
  let clientX = 0;
  
  if (event.clientX !== undefined) {
    clientX = event.clientX;
  } else if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    clientX = event.changedTouches[0].clientX;
  }

  const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
  const seekRatio = rect.width > 0 ? clickX / rect.width : 0;
  const percent = seekRatio * 100;

  // Immediate tactile UI response
  progressBarFill.style.width = `${percent}%`;
  progressBarHandle.style.left = `${percent}%`;

  if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
    const targetTime = seekRatio * audio.duration;
    currentTimeEl.textContent = formatTime(targetTime);
    
    if (isFinal) {
      audio.currentTime = targetTime;
    }
  }
}

// Scrubber drag handling
function handleScrubStart(e) {
  isDraggingProgress = true;
  progressBarContainer.classList.add('dragging');
  seekToPosition(e, false);

  window.addEventListener('mousemove', handleScrubMove);
  window.addEventListener('mouseup', handleScrubEnd);
  window.addEventListener('touchmove', handleScrubMove, { passive: false });
  window.addEventListener('touchend', handleScrubEnd);
}

function handleScrubMove(e) {
  if (!isDraggingProgress) return;
  if (e.cancelable) e.preventDefault();
  seekToPosition(e, false);
}

function handleScrubEnd(e) {
  if (!isDraggingProgress) return;
  seekToPosition(e, true);
  isDraggingProgress = false;
  progressBarContainer.classList.remove('dragging');

  window.removeEventListener('mousemove', handleScrubMove);
  window.removeEventListener('mouseup', handleScrubEnd);
  window.removeEventListener('touchmove', handleScrubMove);
  window.removeEventListener('touchend', handleScrubEnd);
}

// ==============================================================================
// 4. EVENT LISTENERS
// ==============================================================================

// Audio events
audio.addEventListener('loadedmetadata', () => {
  totalDurationEl.textContent = formatTime(audio.duration);
  updateProgressUI();
});

audio.addEventListener('timeupdate', updateProgressUI);

audio.addEventListener('play', () => updatePlayStateUI(true));
audio.addEventListener('pause', () => updatePlayStateUI(false));

audio.addEventListener('ended', () => {
  if (!audio.loop) {
    updatePlayStateUI(false);
    audio.currentTime = 0;
    updateProgressUI();
    showToast("Track finished");
  }
});

audio.addEventListener('error', () => {
  console.warn("Audio file 'assets/song.mp3' not found or cannot be loaded yet.");
  // Provide helpful feedback when song.mp3 is awaiting upload
  if (hasAttemptedInitialPlay) {
    showToast("🎵 Place 'song.mp3' in the assets folder to listen", 3500);
  }
});

// Control button clicks
playBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', skipBackward);
nextBtn.addEventListener('click', skipForward);
loopBtn.addEventListener('click', toggleLoop);
shuffleBtn.addEventListener('click', toggleShuffle);
likeBtn.addEventListener('click', toggleLike);

// Progress bar events
progressBarContainer.addEventListener('mousedown', handleScrubStart);
progressBarContainer.addEventListener('touchstart', handleScrubStart, { passive: false });

// Share button
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: CONFIG.songTitle,
          text: `Listen to ${CONFIG.songTitle} by ${CONFIG.artistName}`,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToast("Card link copied to clipboard! 📋"))
        .catch(() => showToast("Share: " + window.location.href));
    }
  });
}

// Card info modal / toast
if (cardInfoBtn) {
  cardInfoBtn.addEventListener('click', () => {
    showToast("🎵 Personal Music Card • Spotify Inspired Aesthetic", 3000);
  });
}

// Keyboard shortcuts for desktop convenience
window.addEventListener('keydown', (e) => {
  // Avoid interfering if focus is in an input
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (playerContainer.classList.contains('hidden')) {
      enterExperience();
    } else {
      togglePlayPause();
    }
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    skipBackward();
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    skipForward();
  } else if (e.code === 'KeyL') {
    toggleLoop();
  } else if (e.code === 'KeyM') {
    audio.muted = !audio.muted;
    showToast(audio.muted ? "Muted 🔇" : "Unmuted 🔊");
  }
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initTrackMetadata();
});
