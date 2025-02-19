import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import TimerDisplay from '../../components/TimerDisplay';
import logo from '../../assets/logo.png';

const MainScreen = () => {
  const [theme, setTheme] = useState(localStorage.getItem('mainScreenTheme') || 'Ecran principal');
  const [mediaType, setMediaType] = useState<'img' | 'video' | 'texte'>(
    (localStorage.getItem('mainScreenMediaType') as 'img' | 'video' | 'texte') || 'img'
  );
  const [mediaContentImg, setMediaContentImg] = useState(localStorage.getItem('mainScreenMediaContentImg') || '');
  const [mediaContentVideo, setMediaContentVideo] = useState(localStorage.getItem('mainScreenMediaContentVideo') || '');
  const [mediaContentTexte, setMediaContentTexte] = useState(localStorage.getItem('mainScreenMediaContentTexte') || '');

  const mediaContent = mediaType === 'img'
    ? mediaContentImg
    : mediaType === 'video'
      ? mediaContentVideo
      : mediaContentTexte;

  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    socketRef.current.on("mainScreenUpdate", (data) => {
      setTheme(data.theme);
      setMediaType(data.mediaType);
      if (data.mediaType === "img") setMediaContentImg(data.mediaContent);
      else if (data.mediaType === "video") setMediaContentVideo(data.mediaContent);
      else if (data.mediaType === "texte") setMediaContentTexte(data.mediaContent);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const getYoutubeEmbedUrl = (url: string): string | null => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match
      ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${match[1]}`
      : null;
  };

  return (
    <div className="main-screen" style={{ position: 'relative', overflow: 'hidden' }}>
      {mediaType === 'img' && mediaContent && (
        <img
          src={mediaContent}
          alt="Background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        />
      )}
      {mediaType === 'video' && mediaContent && (
        (() => {
          const embedUrl = getYoutubeEmbedUrl(mediaContent);
          if (embedUrl) {
            return (
              <iframe
                src={embedUrl}
                title="Background Video"
                frameBorder="0"
                allow="autoplay; muted; loop"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: -1,
                }}
              ></iframe>
            );
          } else {
            return (
              <video
                src={mediaContent}
                autoPlay
                loop
                muted
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: -1,
                }}
              ></video>
            );
          }
        })()
      )}
      <img
        src={logo}
        alt="Logo"
        className="logo"
        style={{ position: 'relative', zIndex: 1 }}
      />
      <div className="timer" style={{ position: 'relative', zIndex: 1 }}>
        {(mediaType === 'texte' && mediaContent) ? (
          <p className='textemediamain'>{mediaContent}</p>
        ) : (
          <TimerDisplay />
        )}
      </div>
    </div>
  );
};

export default MainScreen;
