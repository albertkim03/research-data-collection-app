"use client";

import { useCallback, useRef, useState } from "react";

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(
    (path: string) => {
      stop();
      const audio = new Audio(path);
      audioRef.current = audio;
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audio.play().catch(() => setIsPlaying(false));
    },
    [stop]
  );

  const playSequence = useCallback(
    (paths: string[], delayMs = 600): Promise<void> => {
      return new Promise((resolve) => {
        stop();
        if (paths.length === 0) {
          resolve();
          return;
        }
        setIsPlaying(true);
        let index = 0;

        const playNext = () => {
          if (index >= paths.length) {
            setIsPlaying(false);
            resolve();
            return;
          }
          const audio = new Audio(paths[index]);
          audioRef.current = audio;
          audio.onended = () => {
            index++;
            if (index < paths.length) {
              setTimeout(playNext, delayMs);
            } else {
              setIsPlaying(false);
              resolve();
            }
          };
          audio.onerror = () => {
            index++;
            setTimeout(playNext, delayMs);
          };
          audio.play().catch(() => {
            index++;
            setTimeout(playNext, delayMs);
          });
        };

        playNext();
      });
    },
    [stop]
  );

  return { play, playSequence, stop, isPlaying };
}
