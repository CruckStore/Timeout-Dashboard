import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1>Dashboard Timeout</h1>
      <div className="button-group">
        <button onClick={() => navigate('/emitter')}>Émetteur</button>
        <button onClick={() => navigate('/receiver')}>Récepteur</button>
      </div>
    </div>
  );
};

export default Dashboard;
