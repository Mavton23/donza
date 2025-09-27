import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Rewind, FastForward } from 'lucide-react';

export default function AudioPlayer({ src, title, onProgressUpdate }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      if (onProgressUpdate) {
        const progress = duration > 0 ? (audio.currentTime / duration) * 100 : 0;
        onProgressUpdate(Math.round(progress));
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [duration, onProgressUpdate]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const seekTime = (e.target.value / 100) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audio.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Áudio • {formatTime(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={duration > 0 ? (currentTime / duration) * 100 : 0}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #e5e7eb ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #e5e7eb 100%)`
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        <button
          onClick={() => skip(-10)}
          className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Rewind className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlayPause}
          className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={() => skip(10)}
          className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FastForward className="w-5 h-5" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={toggleMute}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
          }}
        />
      </div>
    </div>
  );
}