import React, { useState } from 'react';

const SecondaryScreenSettings = () => {
  const [theme, setTheme] = useState('écran secondaire'); 
  const [mediaType, setMediaType] = useState<'img' | 'video' | 'texte'>('img');
  const [mediaContent, setMediaContent] = useState('');

  const handleSave = () => {
    alert('Modifications enregistrées pour l\'Écran Secondaire');
  };

  return (
    <div className="card secondary-screen-settings">
      <h2>Écran Secondaire</h2>
      <div className="theme-selection">
        <p>Sélectionnez le thème:</p>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="écran principal">Écran Principal</option>
          <option value="chrono">Chrono</option>
          <option value="texte">Texte</option>
          <option value="écran secondaire">Écran Secondaire</option>
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

export default SecondaryScreenSettings;
