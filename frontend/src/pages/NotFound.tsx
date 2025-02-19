import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1>Page non trouvée</h1>
      <Link to="/dashboard">Retour au Dashboard</Link>
    </div>
  );
};

export default NotFound;
