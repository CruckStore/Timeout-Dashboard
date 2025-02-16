import React, { useState, useEffect } from 'react';

const MainScreenSettings = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('mainScreenTheme') || 'écran principal');
  const [mediaType, setMediaType] = useState<'img' | 'video' | 'texte'>(() => {
    const stored = localStorage.getItem('mainScreenMediaType');
    return stored === 'video' || stored === 'texte' ? stored : 'img';
  });
  const [mediaContent, setMediaContent] = useState(() => localStorage.getItem('mainScreenMediaContent') || '');

  useEffect(() => {
    localStorage.setItem('mainScreenTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mainScreenMediaType', mediaType);
  }, [mediaType]);

  useEffect(() => {
    localStorage.setItem('mainScreenMediaContent', mediaContent);
  }, [mediaContent]);

  const handleSave = () => {
    alert('Modifications enregistrées pour l\'Ecran Principal');
  };

  return (
    <div className="card main-screen-settings">
      <h2>Ecran Principal</h2>
      <div className="theme-selection">
        <p>Sélectionnez le thème:</p>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="écran principal">Ecran Principal</option>
          <option value="chrono">Chrono</option>
          <option value="texte">Texte</option>
          <option value="écran secondaire">Ecran Secondaire</option>
        </select>
      </div>
      <div className="media-settings">
        <p>Configurer le média:</p>
        <div>
          <button onClick={() => setMediaType('img')}>Set Img</button>
          <button onClick={() => setMediaType('video')}>Set Video</button>
          <button onClick={() => setMediaType('texte')}>Set Texte</button>
        </div>
        <input
          type="text"
          placeholder={`Entrez le contenu pour ${mediaType}`}
          value={mediaContent}
          onChange={(e) => setMediaContent(e.target.value)}
        />
      </div>
      <button onClick={handleSave}>Enregistrer les modifications</button>
    </div>
  );
};

export default MainScreenSettings;
