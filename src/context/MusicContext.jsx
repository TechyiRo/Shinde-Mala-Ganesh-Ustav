import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const MusicContext = createContext(null);

const AUDIO_SRC = '/audio/jai-ganesh-deva-flute-sitar.m4a';
const DEFAULT_VOLUME = 0.12; // 12% soft background volume

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const wasPlayingBeforeVideoRef = useRef(false);
  const tabPausedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('shinde_mala_music_muted') === 'true';
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('shinde_mala_music_volume');
    return saved ? Math.min(0.25, Math.max(0.05, parseFloat(saved))) : DEFAULT_VOLUME;
  });
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Smooth Volume Fade-In
  const fadeIn = (targetVol = volume, durationMs = 2000) => {
    if (!audioRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    audioRef.current.volume = 0.01;
    const stepTime = 100;
    const steps = durationMs / stepTime;
    const volStep = (targetVol - 0.01) / steps;
    let currentVol = 0.01;

    fadeIntervalRef.current = setInterval(() => {
      currentVol += volStep;
      if (currentVol >= targetVol) {
        currentVol = targetVol;
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.volume = Math.min(1, Math.max(0, currentVol));
      }
    }, stepTime);
  };

  // Smooth Fade-Out & Pause
  const fadeOutAndPause = (durationMs = 600) => {
    return new Promise((resolve) => {
      if (!audioRef.current || audioRef.current.paused) {
        resolve();
        return;
      }
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      const stepTime = 50;
      const steps = durationMs / stepTime;
      const initialVol = audioRef.current.volume;
      const volStep = initialVol / steps;
      let currentVol = initialVol;

      fadeIntervalRef.current = setInterval(() => {
        currentVol -= volStep;
        if (currentVol <= 0.01) {
          clearInterval(fadeIntervalRef.current);
          if (audioRef.current) {
            audioRef.current.volume = 0;
            audioRef.current.pause();
          }
          resolve();
        } else if (audioRef.current) {
          audioRef.current.volume = Math.max(0, currentVol);
        }
      }, stepTime);
    });
  };

  // Start Playback
  const playMusic = async () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.muted = false;
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        await promise;
        setIsPlaying(true);
        setNeedsUserGesture(false);
        setIsMuted(false);
        localStorage.setItem('shinde_mala_music_muted', 'false');
        fadeIn(volume);
      }
    } catch (err) {
      console.log('Autoplay restriction, waiting for user gesture:', err.message);
      setNeedsUserGesture(true);
      setIsPlaying(false);
    }
  };

  // Pause Playback
  const pauseMusic = async () => {
    await fadeOutAndPause(500);
    setIsPlaying(false);
  };

  // Toggle Play / Pause
  const togglePlayPause = async () => {
    if (isPlaying) {
      await pauseMusic();
    } else {
      await playMusic();
    }
  };

  // Toggle Mute / Unmute
  const toggleMute = async () => {
    if (!audioRef.current) return;
    if (!isMuted) {
      setIsMuted(true);
      localStorage.setItem('shinde_mala_music_muted', 'true');
      await pauseMusic();
    } else {
      setIsMuted(false);
      localStorage.setItem('shinde_mala_music_muted', 'false');
      await playMusic();
    }
  };

  // Initial Autoplay on Mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.01;
    audio.loop = true;

    if (isMuted) {
      setIsPlaying(false);
      return;
    }

    const tryAutoplay = async () => {
      try {
        const promise = audio.play();
        if (promise !== undefined) {
          await promise;
          setIsPlaying(true);
          setNeedsUserGesture(false);
          fadeIn(volume);
        }
      } catch {
        setNeedsUserGesture(true);
        setIsPlaying(false);
      }
    };

    tryAutoplay();

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  // One-time interaction fallback if browser blocked unmuted autoplay
  useEffect(() => {
    if (!needsUserGesture || isMuted || hasInteracted) return;

    const handleFirstTap = () => {
      setHasInteracted(true);
      if (audioRef.current && needsUserGesture && !isMuted) {
        playMusic();
      }
    };

    window.addEventListener('click', handleFirstTap, { once: true, capture: true });
    window.addEventListener('touchstart', handleFirstTap, { once: true, capture: true });

    return () => {
      window.removeEventListener('click', handleFirstTap, { capture: true });
      window.removeEventListener('touchstart', handleFirstTap, { capture: true });
    };
  }, [needsUserGesture, isMuted, hasInteracted]);

  // Handle Video / other Audio collisions (don't interfere with stories/videos)
  useEffect(() => {
    const handleMediaPlay = (e) => {
      if (
        e.target &&
        (e.target.tagName === 'VIDEO' ||
          (e.target.tagName === 'AUDIO' && e.target !== audioRef.current))
      ) {
        if (audioRef.current && !audioRef.current.paused) {
          wasPlayingBeforeVideoRef.current = true;
          fadeOutAndPause(400);
          setIsPlaying(false);
        }
      }
    };

    const handleMediaPauseOrEnded = (e) => {
      if (
        e.target &&
        (e.target.tagName === 'VIDEO' ||
          (e.target.tagName === 'AUDIO' && e.target !== audioRef.current))
      ) {
        if (wasPlayingBeforeVideoRef.current && audioRef.current && !isMuted) {
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              wasPlayingBeforeVideoRef.current = false;
              fadeIn(volume, 1200);
            })
            .catch(() => {});
        }
      }
    };

    document.addEventListener('play', handleMediaPlay, true);
    document.addEventListener('pause', handleMediaPauseOrEnded, true);
    document.addEventListener('ended', handleMediaPauseOrEnded, true);

    return () => {
      document.removeEventListener('play', handleMediaPlay, true);
      document.removeEventListener('pause', handleMediaPauseOrEnded, true);
      document.removeEventListener('ended', handleMediaPauseOrEnded, true);
    };
  }, [isMuted, volume]);

  // Tab visibility change (pause on tab switch, resume when returning)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          tabPausedRef.current = true;
          setIsPlaying(false);
        }
      } else {
        if (tabPausedRef.current && audioRef.current && !isMuted) {
          tabPausedRef.current = false;
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              fadeIn(volume, 800);
            })
            .catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMuted, volume]);

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        needsUserGesture,
        playMusic,
        pauseMusic,
        togglePlayPause,
        toggleMute
      }}
    >
      {/* Hidden Native Audio Element (Jai Ganesh Deva - Flute & Sitar) */}
      <audio ref={audioRef} loop preload="none">
        <source src={AUDIO_SRC} type="audio/mp4" />
        <source src={AUDIO_SRC} type="audio/aac" />
      </audio>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
