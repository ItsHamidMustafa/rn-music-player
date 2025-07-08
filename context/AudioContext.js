import { createContext, useState, useEffect, useRef } from "react";
import { Audio } from "expo-av";

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [musicFiles, setMusicFiles] = useState([]);
  const soundRef = useRef(null);
  const repeatRef = useRef(repeat);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const playAudio = async (uri) => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      setCurrentTrack(uri);
      setIsPlaying(true);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          if (repeatRef.current) {
            await sound.replayAsync();
          } else {
            setIsPlaying(false);
            setCurrentTrack(null);
            sound.setOnPlaybackStatusUpdate(null);
            await sound.unloadAsync();
            soundRef.current = null;
          }
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const toggleRepeat = () => setRepeat((prev) => !prev);

  const pauseAudio = async () => {
    if (soundRef.current && isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeAudio = async () => {
    if (soundRef.current && !isPlaying) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const playNextTrack = () => {
    if (!musicFiles.length) return;
    const currentIndex = musicFiles.findIndex((file) => file.uri === currentTrack);
    const nextIndex = (currentIndex + 1) % musicFiles.length;
    playAudio(musicFiles[nextIndex].uri);
  };

  const playPreviousTrack = () => {
    if (!musicFiles.length) return;
    const currentIndex = musicFiles.findIndex((file) => file.uri === currentTrack);
    const previousIndex = (currentIndex - 1 + musicFiles.length) % musicFiles.length;
    playAudio(musicFiles[previousIndex].uri);
  };

  const getCurrentPosition = async () => {
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      return status.positionMillis; // Position in milliseconds
    }
    return 0;
  };

  const getDuration = async () => {
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      return status.durationMillis; // Duration in milliseconds
    }
    return 0;
  };

  return (
    <AudioContext.Provider value={{
      playAudio,
      pauseAudio,
      resumeAudio,
      stopAudio,
      currentTrack,
      isPlaying,
      repeat,
      toggleRepeat,
      setMusicFiles,
      playNextTrack,
      playPreviousTrack,
      getCurrentPosition,
      getDuration,
      soundRef
    }}>
      {children}
    </AudioContext.Provider>
  );
};