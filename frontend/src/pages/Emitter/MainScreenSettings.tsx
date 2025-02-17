import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const MainScreenSettings = () => {
  // Connexion Socket.IO
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const [theme, setTheme] = useState(() => localStorage.getItem('mainScreenTheme') || 'écran principal');
  const [mediaType, setMediaType] = useState<'img' | 'video' | 'texte'>(() => {
    const stored = localStorage.getItem('mainScreenMediaType');
    return stored === 'video' || stored === 'texte' ? stored : 'img';
  });

  const [mediaContentImg, setMediaContentImg] = useState(() => localStorage.getItem('mainScreenMediaContentImg') || '');
  const [mediaContentVideo, setMediaContentVideo] = useState(() => localStorage.getItem('mainScreenMediaContentVideo') || '');
  const [mediaContentTexte, setMediaContentTexte] = useState(() => localStorage.getItem('mainScreenMediaContentTexte') || '');

  useEffect(() => {
    localStorage.setItem('mainScreenTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mainScreenMediaType', mediaType);
  }, [mediaType]);

  useEffect(() => {
    localStorage.setItem('mainScreenMediaContentImg', mediaContentImg);
  }, [mediaContentImg]);

  useEffect(() => {
    localStorage.setItem('mainScreenMediaContentVideo', mediaContentVideo);
  }, [mediaContentVideo]);

  useEffect(() => {
    localStorage.setItem('mainScreenMediaContentTexte', mediaContentTexte);
  }, [mediaContentTexte]);

  const getCurrentMediaContent = () => {
    if (mediaType === 'img') return mediaContentImg;
    if (mediaType === 'video') return mediaContentVideo;
    if (mediaType === 'texte') return mediaContentTexte;
    return '';
  };

  const setCurrentMediaContent = (value: string) => {
    if (mediaType === 'img') {
      setMediaContentImg(value);
    } else if (mediaType === 'video') {
      setMediaContentVideo(value);
    } else if (mediaType === 'texte') {
      setMediaContentTexte(value);
    }
  };

  const handleResetMedia = () => {
    setCurrentMediaContent('');
  };

  const handleSave = () => {
    socketRef.current?.emit("mainScreenUpdate", {
      theme,
      mediaType,
      mediaContent: getCurrentMediaContent(),
    });
    alert("Modifications enregistrées pour l'Écran Principal");
  };

  return (
    <div className="card main-screen-settings">
      <h2>Écran Principal</h2>
      <div className="theme-selection">
        <p>Sélectionnez le thème :</p>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="écran principal">Écran Principal</option>
          <option value="chrono">Chrono</option>
          <option value="texte">Texte</option>
          <option value="écran secondaire">Écran Secondaire</option>
        </select>
      </div>
      <div className="media-settings">
        <p>Configurer le média :</p>
        <div>
          <button onClick={() => setMediaType('img')}>Set Img</button>
          <button onClick={() => setMediaType('video')}>Set Video</button>
          <button onClick={() => setMediaType('texte')}>Set Texte</button>
          <button onClick={handleResetMedia}>Reset Media</button>
        </div>
        <input
          type="text"
          placeholder={`Entrez le contenu pour ${mediaType}`}
          value={getCurrentMediaContent()}
          onChange={(e) => setCurrentMediaContent(e.target.value)}
        />
      </div>
      <button onClick={handleSave}>Enregistrer les modifications</button>
    </div>
  );
};

export default MainScreenSettings;
