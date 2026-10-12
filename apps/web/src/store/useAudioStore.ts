import { create } from 'zustand';
import { BeatDTO } from '@shared/types';
import { apiUrl } from '../config/api';

interface AudioStoreState {
  currentTrack: BeatDTO | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: BeatDTO[];
  frequencyData: Uint8Array | null;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;

  // Actions
  playTrack: (track: BeatDTO) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setQueue: (tracks: BeatDTO[]) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  initAudioElement: () => void;
  updateFrequencyData: () => void;
}

let audioElement: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  isMuted: false,
  queue: [],
  frequencyData: null,
  bassLevel: 0,
  midLevel: 0,
  trebleLevel: 0,

  initAudioElement: () => {
    if (audioElement) return;

    audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';
    audioElement.volume = get().volume;

    audioElement.addEventListener('timeupdate', () => {
      if (audioElement) {
        set({ currentTime: audioElement.currentTime });
      }
    });

    audioElement.addEventListener('loadedmetadata', () => {
      if (audioElement) {
        set({ duration: audioElement.duration || get().currentTrack?.duration || 180 });
      }
    });

    audioElement.addEventListener('ended', () => {
      get().nextTrack();
    });

    audioElement.addEventListener('play', () => {
      set({ isPlaying: true });
    });

    audioElement.addEventListener('pause', () => {
      set({ isPlaying: false });
    });

    // Initialize Web Audio API Analyser on user interaction
    const initWebAudio = () => {
      if (!audioCtx && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass && audioElement) {
          audioCtx = new AudioContextClass();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.8;

          try {
            sourceNode = audioCtx.createMediaElementSource(audioElement);
            sourceNode.connect(analyser);
            analyser.connect(audioCtx.destination);
          } catch {
            // In case already connected
          }
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    };

    window.addEventListener('click', initWebAudio, { once: true });
    window.addEventListener('keydown', initWebAudio, { once: true });
  },

  playTrack: (track: BeatDTO) => {
    get().initAudioElement();
    if (!audioElement) return;

    const isSameTrack = get().currentTrack?.id === track.id;

    if (isSameTrack) {
      if (audioElement.paused) {
        audioElement.play().catch(console.warn);
        set({ isPlaying: true });
      }
      return;
    }

    // Stop any existing playback immediately (Requirement 22: only one preview at a time)
    audioElement.pause();
    audioElement.src = track.previewAudio;
    audioElement.currentTime = 0;
    audioElement.play().catch(console.warn);

    // Call API play counter in background
    fetch(apiUrl(`/api/beats/${track.id}/play`), { method: 'POST' }).catch(() => {});

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 180,
    });
  },

  pauseTrack: () => {
    if (audioElement) {
      audioElement.pause();
    }
    set({ isPlaying: false });
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }

    if (isPlaying) {
      get().pauseTrack();
    } else if (currentTrack) {
      get().playTrack(currentTrack);
    }
  },

  seek: (time: number) => {
    if (audioElement && Number.isFinite(time)) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },

  setVolume: (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioElement) {
      audioElement.volume = clamped;
      audioElement.muted = clamped === 0;
    }
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    if (audioElement) {
      audioElement.muted = !isMuted;
    }
    set({ isMuted: !isMuted, volume: !isMuted ? 0 : volume || 0.85 });
  },

  setQueue: (tracks: BeatDTO[]) => {
    set({ queue: tracks });
  },

  nextTrack: () => {
    const { currentTrack, queue } = get();
    if (!queue.length) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    get().playTrack(queue[nextIndex]);
  },

  prevTrack: () => {
    const { currentTrack, queue, currentTime } = get();
    if (currentTime > 3) {
      get().seek(0);
      return;
    }
    if (!queue.length) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    get().playTrack(queue[prevIndex]);
  },

  updateFrequencyData: () => {
    if (!analyser) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Compute bass, mid, treble levels
    let bass = 0;
    let mid = 0;
    let treble = 0;

    for (let i = 0; i < 4; i++) bass += dataArray[i];
    for (let i = 4; i < 16; i++) mid += dataArray[i];
    for (let i = 16; i < bufferLength; i++) treble += dataArray[i];

    set({
      frequencyData: dataArray,
      bassLevel: bass / (4 * 255),
      midLevel: mid / (12 * 255),
      trebleLevel: treble / ((bufferLength - 16) * 255),
    });
  },
}));
