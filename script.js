// ==========================================
// BANCO DE DATOS CON ARTISTAS REALES (Blessd, Kris R, ROA, Bad Bunny, Rauw, Anuel)
// ==========================================
const songsData = [
  {
    id: 1,
    title: "Monaco Style",
    artist: "Bad Bunny",
    album: "Nadie Sabe Lo Que Va A Pasar Mañana",
    genre: "reggaeton",
    duration: 185,
    cover: "",
    bpm: 96,
    type: "dembow"
  },
  {
    id: 2,
    title: "Mírame / Remix Flow",
    artist: "Blessd & Kris R",
    album: "Siempre Blessd",
    genre: "reggaeton",
    duration: 198,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
    bpm: 94,
    type: "dembow"
  },
  {
    id: 3,
    title: "Desesperados Vibe",
    artist: "Rauw Alejandro",
    album: "Vice Versa",
    genre: "reggaeton",
    duration: 215,
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80",
    bpm: 100,
    type: "dembow"
  },
  {
    id: 4,
    title: "Conexión Oscura",
    artist: "ROA",
    album: "Trap & Neon",
    genre: "trap",
    duration: 170,
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80",
    bpm: 142,
    type: "trap"
  },
  {
    id: 5,
    title: "Real Hasta La Muerte",
    artist: "Anuel AA",
    album: "Emmanuel",
    genre: "trap",
    duration: 205,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
    bpm: 138,
    type: "trap"
  },
  {
    id: 6,
    title: "Salsa en el Barrio",
    artist: "Sonora Caliente",
    album: "Salsa & Calle",
    genre: "salsa",
    duration: 225,
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80",
    bpm: 180,
    type: "salsa"
  },
  {
    id: 7,
    title: "Eclipse Pop",
    artist: "Aitana & Kris R",
    album: "Pop Melodías",
    genre: "pop",
    duration: 175,
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80",
    bpm: 120,
    type: "pop"
  }
];

const albumsData = [
  {
    title: "Nadie Sabe...",
    artist: "Bad Bunny",
    tracks: "22 Canciones",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80"
  },
  {
    title: "Siempre Blessd",
    artist: "Blessd ft. Kris R",
    tracks: "14 Canciones",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80"
  },
  {
    title: "Vice Versa",
    artist: "Rauw Alejandro",
    tracks: "12 Canciones",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80"
  }
];

// Estado global y listas guardadas por el usuario
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let timerInterval = null;
let remainingTimerSeconds = 0;
let userPlaylists = [];

// Audio Web API
let audioCtx = null;
let isAudioInitialized = false;
let playbackTimer = null;
let currentProgressSeconds = 0;

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  renderCarousel();
  renderSongs('todos');
  renderAlbums();
  setupEventListeners();
  renderPlaylistSongsCheckboxes();
});

// Renderizados
function renderCarousel() {
  const track = document.getElementById('carouselTrack');
  track.innerHTML = songsData.map((song, idx) => `
    <div class="carousel-card" onclick="playSong(${idx})">
      <img src="${song.cover}" alt="${song.title}">
      <div class="carousel-info">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
      </div>
    </div>
  `).join('');
}

function renderSongs(genre) {
  const grid = document.getElementById('songsGrid');
  const filtered = genre === 'todos' ? songsData : songsData.filter(s => s.genre === genre);

  grid.innerHTML = filtered.map((song) => {
    const originalIndex = songsData.findIndex(s => s.id === song.id);
    return `
      <div class="song-card" onclick="playSong(${originalIndex})">
        <div class="song-img-wrapper">
          <img src="${song.cover}" alt="${song.title}">
          <button class="card-play-btn"><i data-lucide="play"></i></button>
        </div>
        <div class="song-info">
          <h4>${song.title}</h4>
          <p>${song.artist}</p>
          <span class="song-tag">${song.genre}</span>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function renderAlbums() {
  const grid = document.getElementById('albumsGrid');
  grid.innerHTML = albumsData.map(album => `
    <div class="album-card">
      <img src="${album.cover}" alt="${album.title}">
      <div class="album-details">
        <h4>${album.title}</h4>
        <p>${album.artist}</p>
        <span>${album.tracks}</span>
      </div>
    </div>
  `).join('');
}

// Generador de checkboxes para crear playlists
function renderPlaylistSongsCheckboxes() {
  const container = document.getElementById('playlistSongsSelect');
  container.innerHTML = songsData.map(song => `
    <label class="song-checkbox-item">
      <input type="checkbox" value="${song.id}" />
      ${song.title} - ${song.artist}
    </label>
  `).join('');
}

// Renderizar Playlists del usuario
function renderUserPlaylists() {
  const grid = document.getElementById('playlistsGrid');
  if (userPlaylists.length === 0) {
    grid.innerHTML = `
      <div class="empty-playlist-card">
        <i data-lucide="music"></i>
        <p>Aún no has creado ninguna playlist. ¡Crea una ahora y añade tus temas favoritos!</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  grid.innerHTML = userPlaylists.map((pl, idx) => `
    <div class="custom-playlist-card">
      <div>
        <h4>${pl.name}</h4>
        <p>${pl.songs.length} canciones guardadas</p>
      </div>
      <div class="playlist-actions">
        <button class="btn-small" onclick="playPlaylist(${idx})"><i data-lucide="play"></i> Reproducir</button>
        <button class="btn-small delete" onclick="deletePlaylist(${idx})"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Web Audio API Sintetizador
function initAudioContext() {
  if (!isAudioInitialized) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    isAudioInitialized = true;
  }
}

function playSynthesizedSound(type) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  if (type === 'dembow') {
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  } else if (type === 'trap') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  }

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

// Reproductor
function playSong(index) {
  initAudioContext();
  currentSongIndex = index;
  const song = songsData[currentSongIndex];

  document.getElementById('playerTitle').textContent = song.title;
  document.getElementById('playerArtist').textContent = song.artist;
  document.getElementById('playerCover').src = song.cover;
  document.getElementById('totalTime').textContent = formatTime(song.duration);

  isPlaying = true;
  currentProgressSeconds = 0;
  updatePlayButtonUI();
  document.getElementById('vinylBox').classList.add('playing');

  clearInterval(playbackTimer);
  playbackTimer = setInterval(() => {
    if (isPlaying) {
      currentProgressSeconds++;
      if (currentProgressSeconds % 2 === 0) {
        playSynthesizedSound(song.type);
      }

      if (currentProgressSeconds >= song.duration) {
        handleSongEnd();
      } else {
        updateProgressUI(song.duration);
      }
    }
  }, 1000);
}

function togglePlay() {
  if (!isAudioInitialized) {
    playSong(currentSongIndex);
    return;
  }
  isPlaying = !isPlaying;
  updatePlayButtonUI();
  const vinyl = document.getElementById('vinylBox');
  if (isPlaying) vinyl.classList.add('playing');
  else vinyl.classList.remove('playing');
}

function updatePlayButtonUI() {
  const icon = document.getElementById('playIcon');
  icon.setAttribute('data-lucide', isPlaying ? 'pause' : 'play');
  if (window.lucide) lucide.createIcons();
}

function updateProgressUI(totalDuration) {
  document.getElementById('currentTime').textContent = formatTime(currentProgressSeconds);
  const percent = (currentProgressSeconds / totalDuration) * 100;
  document.getElementById('progressBarFill').style.width = `${percent}%`;
}

function handleSongEnd() {
  if (isRepeat) playSong(currentSongIndex);
  else nextSong();
}

function nextSong() {
  if (isShuffle) {
    let newIndex = Math.floor(Math.random() * songsData.length);
    playSong(newIndex);
  } else {
    currentSongIndex = (currentSongIndex + 1) % songsData.length;
    playSong(currentSongIndex);
  }
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songsData.length) % songsData.length;
  playSong(currentSongIndex);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Reproducir Playlist completa
function playPlaylist(playlistIndex) {
  const pl = userPlaylists[playlistIndex];
  if (pl && pl.songs.length > 0) {
    const firstSongId = pl.songs[0];
    const indexInSongs = songsData.findIndex(s => s.id === firstSongId);
    if (indexInSongs !== -1) playSong(indexInSongs);
  }
}

function deletePlaylist(playlistIndex) {
  userPlaylists.splice(playlistIndex, 1);
  renderUserPlaylists();
}

// Temporizador
function setSleepTimer(minutes) {
  clearInterval(timerInterval);
  const badge = document.getElementById('timerBadge');

  if (minutes === 0) {
    badge.classList.add('hidden');
    return;
  }

  remainingTimerSeconds = minutes * 60;
  badge.classList.remove('hidden');
  badge.textContent = formatTime(remainingTimerSeconds);

  timerInterval = setInterval(() => {
    remainingTimerSeconds--;
    badge.textContent = formatTime(remainingTimerSeconds);

    if (remainingTimerSeconds <= 0) {
      clearInterval(timerInterval);
      isPlaying = false;
      updatePlayButtonUI();
      document.getElementById('vinylBox').classList.remove('playing');
      badge.classList.add('hidden');
      alert("Temporizador finalizado: La música se ha pausado.");
    }
  }, 1000);
}

// Event Listeners
function setupEventListeners() {
  document.getElementById('btnPlayPause').addEventListener('click', togglePlay);
  document.getElementById('btnNext').addEventListener('click', nextSong);
  document.getElementById('btnPrev').addEventListener('click', prevSong);

  const btnShuffle = document.getElementById('btnShuffle');
  btnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle('active', isShuffle);
  });

  const btnRepeat = document.getElementById('btnRepeat');
  btnRepeat.addEventListener('click', () => {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle('active', isRepeat);
  });

  document.getElementById('progressBarBg').addEventListener('click', (e) => {
    const song = songsData[currentSongIndex];
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    currentProgressSeconds = Math.floor(percentage * song.duration);
    updateProgressUI(song.duration);
  });

  // Modal Playlist
  const modal = document.getElementById('playlistModal');
  document.getElementById('openPlaylistModal').addEventListener('click', () => modal.classList.remove('hidden'));
  document.getElementById('closeModal').addEventListener('click', () => modal.classList.add('hidden'));

  document.getElementById('savePlaylistBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('playlistNameInput');
    const name = nameInput.value.trim();
    if (!name) {
      alert("Por favor ingresa un nombre para la playlist.");
      return;
    }

    const checkboxes = document.querySelectorAll('.song-checkbox-item input:checked');
    const selectedSongIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (selectedSongIds.length === 0) {
      alert("Selecciona al menos una canción para tu playlist.");
      return;
    }

    userPlaylists.push({ name, songs: selectedSongIds });
    renderUserPlaylists();
    nameInput.value = '';
    checkboxes.forEach(cb => cb.checked = false);
    modal.classList.add('hidden');
  });

  // Timer Dropdown
  const btnTimer = document.getElementById('btnTimer');
  const timerDropdown = document.getElementById('timerDropdown');
  btnTimer.addEventListener('click', () => timerDropdown.classList.toggle('hidden'));

  timerDropdown.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setSleepTimer(parseInt(e.target.getAttribute('data-time')));
      timerDropdown.classList.add('hidden');
    });
  });

  // Filtros
  document.getElementById('genreFilters').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderSongs(e.target.getAttribute('data-genre'));
    }
  });

  // Móvil
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
  });

  document.getElementById('ctaParty').addEventListener('click', () => {
    document.body.style.background = "linear-gradient(45deg, #0044ff, #ff003c, #06070a)";
    setTimeout(() => document.body.style.background = "var(--bg-black)", 3000);
  });

  // Carrusel Scroll
  document.getElementById('prevSlide').addEventListener('click', () => {
    document.getElementById('carouselTrack').scrollBy({ left: -300, behavior: 'smooth' });
  });
  document.getElementById('nextSlide').addEventListener('click', () => {
    document.getElementById('carouselTrack').scrollBy({ left: 300, behavior: 'smooth' });
  });

  document.getElementById('btnExplore').addEventListener('click', () => {
    document.getElementById('library').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('btnSurprise').addEventListener('click', () => {
    playSong(Math.floor(Math.random() * songsData.length));
  });
}