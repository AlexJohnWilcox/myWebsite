// ═══════════════════════════════════════════════════════════════
//  AUDIO SYSTEM
//  Handles SFX playback via Web Audio API and music via HTML
//  Audio elements with crossfading between tracks.
// ═══════════════════════════════════════════════════════════════

const audio = {
  ctx: null,
  buffers: {},
  music: { main: null, lab: null },
  // Volume scaling per music track (lab track is quieter source)
  musicScale: { main: 1, lab: 1.8 },
  musicGain: null,
  sfxGain: null,
  activeMusic: null, // 'main' | 'lab'
  _fadeInterval: null,
  _initPromise: null,

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = state.musicVolume;
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = state.sfxVolume;
    this.sfxGain.connect(this.ctx.destination);

    const sfxFiles = {
      cast: 'Audio/CastReel.mp3',
      catch1: 'Audio/GetFish.mp3',
      catch2: 'Audio/GetFish2.mp3',
      catch3: 'Audio/GetFish3.mp3',
      catch4: 'Audio/GetFish4.mp3',
      catch_rare: 'Audio/GetRareFish.mp3',
      click: 'Audio/ButtonClickGeneric.mp3',
    };
    for (const [key, path] of Object.entries(sfxFiles)) {
      try {
        const res = await fetch(path);
        const buf = await res.arrayBuffer();
        this.buffers[key] = await this.ctx.decodeAudioData(buf);
      } catch (e) { /* skip missing files */ }
    }

    this.music.main = new Audio('Audio/MainMusic.mp3');
    this.music.main.loop = true;
    this.music.main.volume = 0;

    this.music.lab = new Audio('Audio/LabAudio.mp3');
    this.music.lab.loop = true;
    this.music.lab.volume = 0;
  },

  play(sound) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    let bufferKey;
    if (sound === 'cast') {
      bufferKey = 'cast';
    } else if (sound === 'catch_common') {
      const picks = ['catch1', 'catch2', 'catch3', 'catch4'];
      bufferKey = picks[Math.floor(Math.random() * picks.length)];
    } else if (sound === 'catch_rare') {
      bufferKey = 'catch_rare';
    } else if (sound === 'click') {
      bufferKey = 'click';
    } else if (sound === 'sell') {
      bufferKey = 'catch1';
    } else if (sound === 'upgrade') {
      bufferKey = 'click';
    } else {
      return;
    }
    const buffer = this.buffers[bufferKey];
    if (!buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    // Click sound needs a volume boost to be audible
    if (bufferKey === 'click') {
      const boost = this.ctx.createGain();
      boost.gain.value = 3.0;
      src.connect(boost);
      boost.connect(this.sfxGain);
    } else {
      src.connect(this.sfxGain);
    }
    src.start(0);
  },

  startMusic() {
    if (!this.music.main) return;
    this.music.main.play().catch(() => {});
    this.activeMusic = 'main';
    this._fadeTo('main');
  },

  switchMusic(target) {
    if (this.activeMusic === target) return;
    this.activeMusic = target;
    const fadeIn = this.music[target];
    if (fadeIn.paused) fadeIn.play().catch(() => {});
    const outs = [];
    for (const key of Object.keys(this.music)) {
      if (key !== target && this.music[key] && !this.music[key].paused) outs.push(this.music[key]);
    }
    this._crossFade(outs, fadeIn, target);
  },

  // Fade out multiple tracks while fading in one
  _crossFade(outs, into, targetKey) {
    if (this._fadeInterval) clearInterval(this._fadeInterval);
    const targetVol = state.musicVolume * (this.musicScale[targetKey] || 1);
    const step = 0.02;
    this._fadeInterval = setInterval(() => {
      let done = true;
      for (const out of outs) {
        if (out.volume > 0) { out.volume = Math.max(0, out.volume - step); done = false; }
      }
      if (into.volume < targetVol) { into.volume = Math.min(targetVol, into.volume + step); done = false; }
      if (done) {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
        for (const out of outs) { if (out.volume === 0) out.pause(); }
      }
    }, 30);
  },

  // Fade a single track in from silence
  _fadeTo(target) {
    if (this._fadeInterval) clearInterval(this._fadeInterval);
    const track = this.music[target];
    const targetVol = state.musicVolume * (this.musicScale[target] || 1);
    this._fadeInterval = setInterval(() => {
      if (track.volume < targetVol) {
        track.volume = Math.min(targetVol, track.volume + 0.02);
      } else {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
      }
    }, 30);
  },

  setSfxVolume(v) {
    state.sfxVolume = v;
    if (this.sfxGain) this.sfxGain.gain.value = v;
  },

  setMusicVolume(v) {
    state.musicVolume = v;
    for (const key of Object.keys(this.music)) {
      if (this.music[key] && !this.music[key].paused) {
        this.music[key].volume = v * (this.musicScale[key] || 1);
      }
    }
  },
};
