import { useNavigate } from 'react-router-dom';

const ReceiverHome = () => {
  const navigate = useNavigate();

  return (
    <div className="receiver-home">
      <h1>Recepteur</h1>
      <div className="button-group">
        <button onClick={() => navigate('/receiver/main')}>Écran Principal</button>
        <button onClick={() => navigate('/receiver/secondary')}>Écran Secondaire</button>
        <button onClick={() => navigate('/receiver/countdown')}>Compte à rebours</button>
      </div>
    </div>
  );
};

export default ReceiverHome;