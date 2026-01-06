import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/nouvelle-demande" className="logo">
          <img 
            src="/JOEL_logo-horizontal-couleur copie.png" 
            alt="Joël" 
            className="logo-image"
          />
        </Link>

        <nav className="nav">
          <Link 
            to="/nouvelle-demande" 
            className={`nav-link ${isActive('/nouvelle-demande') ? 'active' : ''}`}
          >
            Nouvelle demande
          </Link>
          <Link 
            to="/historique" 
            className={`nav-link ${isActive('/historique') ? 'active' : ''}`}
          >
            Historique
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
