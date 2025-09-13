import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projetos from './pages/Projetos';
import Indicadores from './pages/Indicadores';
import Eixos5W2H from './pages/Eixos5W2H';
import Licenciamentos from './pages/Licenciamentos';
import Utilizadores from './pages/Utilizadores';
import Auditoria from './pages/Auditoria';
import Mapa from './pages/Mapa';
import { USER_ROLES } from './types/constants';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projetos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Projetos />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/indicadores"
            element={
              <ProtectedRoute>
                <Layout>
                  <Indicadores />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/eixos-5w2h"
            element={
              <ProtectedRoute>
                <Layout>
                  <Eixos5W2H />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/licenciamentos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Licenciamentos />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mapa"
            element={
              <ProtectedRoute>
                <Layout>
                  <Mapa />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/utilizadores"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ROOT}>
                <Layout>
                  <Utilizadores />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditoria"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ROOT}>
                <Layout>
                  <Auditoria />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
