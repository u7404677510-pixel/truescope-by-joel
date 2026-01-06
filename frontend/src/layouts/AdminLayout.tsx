import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-icon">⚙️</span>
          <span className="admin-logo-text">Admin</span>
        </div>

        <nav className="admin-nav">
          <NavLink 
            to="/admin/tarifs" 
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Tarifs</span>
          </NavLink>
        </nav>

        <div className="admin-footer">
          <button 
            className="admin-back-btn"
            onClick={() => navigate('/nouvelle-demande')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Retour à Joël</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

