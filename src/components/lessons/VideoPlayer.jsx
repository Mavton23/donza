import { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

export default function VideoPlayer({ src, title, onProgressUpdate }) {
  const playerRef = useRef(null);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleProgress = (state) => {
    setPlayed(state.played);
    if (onProgressUpdate) {
      onProgressUpdate(Math.round(state.played * 100));
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  return (
    <div className="relative aspect-video bg-black">
      <ReactPlayer
        ref={playerRef}
        url={src}
        width="100%"
        height="100%"
        controls
        onProgress={handleProgress}
        onDuration={handleDuration}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
      
      {/* Overlay de informações */}
      <div className="absolute top-4 left-4">
        <h2 className="text-white text-lg font-semibold bg-black bg-opacity-50 px-3 py-1 rounded">
          {title}
        </h2>
      </div>
    </div>
  );
}