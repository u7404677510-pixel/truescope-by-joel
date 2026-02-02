import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import NewDemande from './pages/NewDemande';
import DemandeDetail from './pages/DemandeDetail';
import Historique from './pages/Historique';
import AdminLayout from './layouts/AdminLayout';
import TarifsEditor from './pages/admin/TarifsEditor';

function App() {
  return (
    <Routes>
      {/* Routes Admin (sans Header Joël) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/historique" replace />} />
        <Route path="historique" element={<Historique />} />
        <Route path="tarifs" element={<TarifsEditor />} />
      </Route>

      {/* Routes principales (avec Header Joël) */}
      <Route
        path="/*"
        element={
          <div className="app-container">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/nouvelle-demande" replace />} />
                <Route path="/nouvelle-demande" element={<NewDemande />} />
                <Route path="/demande/:id" element={<DemandeDetail />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
