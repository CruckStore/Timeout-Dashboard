import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const MainScreenSettings = () => {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const [theme, setTheme] = useState(() => localStorage.getItem('mainScreenTheme') || 'écran principal');

  const [activeMediaType, setActiveMediaType] = useState<'img' | 'video' | 'texte'>(() => {
    const stored = localStorage.getItem('mainScreenMediaTypeActive');
    return stored === 'video' || stored === 'texte' ? stored : 'img';
  });

  const [mediaContentImg, setMediaContentImg] = useState(() => localStorage.getItem('mainScreenMediaContentImg') || '');
  const [mediaContentVideo, setMediaContentVideo] = useState(() => localStorage.getItem('mainScreenMediaContentVideo') || '');
  const [mediaContentTexte, setMediaContentTexte] = useState(() => localStorage.getItem('mainScreenMediaContentTexte') || '');

  useEffect(() => { localStorage.setItem('mainScreenTheme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('mainScreenMediaTypeActive', activeMediaType); }, [activeMediaType]);
  useEffect(() => { localStorage.setItem('mainScreenMediaContentImg', mediaContentImg); }, [mediaContentImg]);
  useEffect(() => { localStorage.setItem('mainScreenMediaContentVideo', mediaContentVideo); }, [mediaContentVideo]);
  useEffect(() => { localStorage.setItem('mainScreenMediaContentTexte', mediaContentTexte); }, [mediaContentTexte]);

  const handleSetImg = () => {
    socketRef.current?.emit("mainScreenUpdate", {
      theme,
      mediaType: activeMediaType,
      mediaContent: activeMediaType === 'img' ? mediaContentImg : getCurrentMediaContent(),
    });
  };

  const handleResetImg = () => {
    setMediaContentImg('');
    socketRef.current?.emit("mainScreenUpdate", {
      theme,
      mediaType: activeMediaType,
      mediaContent: activeMediaType === 'img' ? '' : getCurrentMediaContent(),
    });
  };

  const handleSetVideo = () => {
    socketRef.current?.emit("mainScreenUpdate", {
      theme,
      mediaType: activeMediaType,
      mediaContent: activeMediaType === 'video' ? mediaContentVideo : getCurrentMediaContent(),
    });
  };

  const handleResetVideo = () => {
    setMediaContentVideo('');
    socketRef.current?.emit("mainScreenUpdate", {
      theme,
      mediaType: activeMediaType,
      mediaContent: activeMediaType === 'video' ? '' : getCurrentMediaContent(),
    });
  };

  const handleSetTexte = () => {
    socketRef.current?.emit("mainScreenUpdate", {
      theme,
      mediaType: activeMediaType,
      mediaContent: activeMediaType === 'texte' ? mediaContentTexte : getCurrentMediaContent(),
    });
  };

  const handleResetTexte = () => {
    setMediaContentTexte('');
    socketRef.current?.emit("mainScreenUpdate", {
      theme,
      mediaType: activeMediaType,
      mediaContent: activeMediaType === 'texte' ? '' : getCurrentMediaContent(),
    });
  };

  const getCurrentMediaContent = () => {
    if (activeMediaType === 'img') return mediaContentImg;
    if (activeMediaType === 'video') return mediaContentVideo;
    if (activeMediaType === 'texte') return mediaContentTexte;
    return '';
  };

  const handleSave = () => {
    const data = {
      theme,
      mediaType: activeMediaType,
      mediaContent: getCurrentMediaContent(),
    };
    socketRef.current?.emit("mainScreenUpdate", data);
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

      <div className="media-type-selection">
        <p>Sélectionnez le type de média à afficher :</p>
        <label>
          <input
            type="radio"
            value="img"
            checked={activeMediaType === 'img'}
            onChange={() => setActiveMediaType('img')}
          />
          Image
        </label>
        <label>
          <input
            type="radio"
            value="video"
            checked={activeMediaType === 'video'}
            onChange={() => setActiveMediaType('video')}
          />
          Vidéo
        </label>
        <label>
          <input
            type="radio"
            value="texte"
            checked={activeMediaType === 'texte'}
            onChange={() => setActiveMediaType('texte')}
          />
          Texte
        </label>
      </div>

      <div className="media-settings">
        <p>Configurer les médias :</p>

        <div className="media-config">
          <label>Image URL :</label>
          <input
            type="text"
            placeholder="Entrez l'URL de l'image"
            value={mediaContentImg}
            onChange={(e) => setMediaContentImg(e.target.value)}
          />
          <button onClick={handleSetImg}>Set Img</button>
          <button onClick={handleResetImg}>Reset Img</button>
        </div>

        <div className="media-config">
          <label>Vidéo URL :</label>
          <input
            type="text"
            placeholder="Entrez l'URL de la vidéo"
            value={mediaContentVideo}
            onChange={(e) => setMediaContentVideo(e.target.value)}
          />
          <button onClick={handleSetVideo}>Set Video</button>
          <button onClick={handleResetVideo}>Reset Video</button>
        </div>

        <div className="media-config">
          <label>Texte :</label>
          <input
            type="text"
            placeholder="Entrez le texte à afficher"
            value={mediaContentTexte}
            onChange={(e) => setMediaContentTexte(e.target.value)}
          />
          <button onClick={handleSetTexte}>Set Texte</button>
          <button onClick={handleResetTexte}>Reset Texte</button>
        </div>
      </div>

      <button onClick={handleSave}>Enregistrer les modifications</button>
    </div>
  );
};

export default MainScreenSettings;
