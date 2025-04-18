import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SecondaryScreenSettings = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const [activeMediaType, setActiveMediaType] = useState<
    "img" | "video" | "texte"
  >(() => {
    const stored = localStorage.getItem("secondaryScreenMediaTypeActive");
    return stored === "video" || stored === "texte" ? stored : "img";
  });

  const [mediaContentImg, setMediaContentImg] = useState(
    () => localStorage.getItem("secondaryScreenMediaContentImg") || ""
  );
  const [mediaContentVideo, setMediaContentVideo] = useState(
    () => localStorage.getItem("secondaryScreenMediaContentVideo") || ""
  );
  const [mediaContentTexte, setMediaContentTexte] = useState(
    () => localStorage.getItem("secondaryScreenMediaContentTexte") || ""
  );

  useEffect(() => {
    localStorage.setItem("secondaryScreenMediaTypeActive", activeMediaType);
  }, [activeMediaType]);

  useEffect(() => {
    localStorage.setItem("secondaryScreenMediaContentImg", mediaContentImg);
  }, [mediaContentImg]);

  useEffect(() => {
    localStorage.setItem("secondaryScreenMediaContentVideo", mediaContentVideo);
  }, [mediaContentVideo]);

  useEffect(() => {
    localStorage.setItem("secondaryScreenMediaContentTexte", mediaContentTexte);
  }, [mediaContentTexte]);

  const getCurrentMediaContent = () => {
    if (activeMediaType === "img") return mediaContentImg;
    if (activeMediaType === "video") return mediaContentVideo;
    if (activeMediaType === "texte") return mediaContentTexte;
    return "";
  };

  const handleSetImg = () => {
    socketRef.current?.emit("secondaryScreenUpdate", {
      mediaType: activeMediaType,
      mediaContent:
        activeMediaType === "img" ? mediaContentImg : getCurrentMediaContent(),
    });
  };

  const handleResetImg = () => {
    setMediaContentImg("");
    socketRef.current?.emit("secondaryScreenUpdate", {
      mediaType: activeMediaType,
      mediaContent: activeMediaType === "img" ? "" : getCurrentMediaContent(),
    });
  };

  const handleSetVideo = () => {
    socketRef.current?.emit("secondaryScreenUpdate", {
      mediaType: activeMediaType,
      mediaContent:
        activeMediaType === "video"
          ? mediaContentVideo
          : getCurrentMediaContent(),
    });
  };

  const handleResetVideo = () => {
    setMediaContentVideo("");
    socketRef.current?.emit("secondaryScreenUpdate", {
      mediaType: activeMediaType,
      mediaContent: activeMediaType === "video" ? "" : getCurrentMediaContent(),
    });
  };

  const handleSetTexte = () => {
    socketRef.current?.emit("secondaryScreenUpdate", {
      mediaType: activeMediaType,
      mediaContent:
        activeMediaType === "texte"
          ? mediaContentTexte
          : getCurrentMediaContent(),
    });
  };

  const handleResetTexte = () => {
    setMediaContentTexte("");
    socketRef.current?.emit("secondaryScreenUpdate", {
      mediaType: activeMediaType,
      mediaContent: activeMediaType === "texte" ? "" : getCurrentMediaContent(),
    });
  };

  const handleSave = () => {
    const data = {
      mediaType: activeMediaType,
      mediaContent: getCurrentMediaContent(),
    };
    socketRef.current?.emit("secondaryScreenUpdate", data);
    alert("Modifications enregistrées pour l'Écran Secondaire");
  };

  return (
    <div className="card secondary-screen-settings">
      <h2>Ecran Secondaire</h2>

      <div className="media-type-selection">
        <p>Sélectionnez le type de média à afficher :</p>
        <label>
          <input
            type="radio"
            value="img"
            checked={activeMediaType === "img"}
            onChange={() => setActiveMediaType("img")}
          />
          Image
        </label>
        <label>
          <input
            type="radio"
            value="video"
            checked={activeMediaType === "video"}
            onChange={() => setActiveMediaType("video")}
          />
          Vidéo
        </label>
        <label>
          <input
            type="radio"
            value="texte"
            checked={activeMediaType === "texte"}
            onChange={() => setActiveMediaType("texte")}
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

export default SecondaryScreenSettings;
