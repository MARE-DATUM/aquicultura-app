import { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { USER_ROLES } from './types/constants';
import { PageHeader } from './components/ui';
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
                  <PageHeader
                    title="Projetos"
                    description="Gestão e monitorização dos projetos de aquicultura"
                    breadcrumbs={[
                      { label: 'Projetos', current: true }
                    ]}
                  />
                  <div className="p-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <p className="text-gray-600">Módulo em desenvolvimento</p>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/indicadores"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageHeader
                    title="Indicadores"
                    description="Monitorização de indicadores de desempenho dos projetos"
                    breadcrumbs={[
                      { label: 'Indicadores', current: true }
                    ]}
                  />
                  <div className="p-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <p className="text-gray-600">Módulo em desenvolvimento</p>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/eixos-5w2h"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageHeader
                    title="5W2H"
                    description="Análise e planeamento estratégico dos projetos"
                    breadcrumbs={[
                      { label: '5W2H', current: true }
                    ]}
                  />
                  <div className="p-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <p className="text-gray-600">Módulo em desenvolvimento</p>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/licenciamentos"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageHeader
                    title="Licenciamentos"
                    description="Gestão de licenças e autorizações dos projetos"
                    breadcrumbs={[
                      { label: 'Licenciamentos', current: true }
                    ]}
                  />
                  <div className="p-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <p className="text-gray-600">Módulo em desenvolvimento</p>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mapa"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageHeader
                    title="Mapa"
                    description="Visualização geográfica dos projetos de aquicultura"
                    breadcrumbs={[
                      { label: 'Mapa', current: true }
                    ]}
                  />
                  <div className="p-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <p className="text-gray-600">Módulo em desenvolvimento</p>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/utilizadores"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ROOT}>
                <Layout>
                  <PageHeader
                    title="Utilizadores"
                    description="Gestão de utilizadores e permissões do sistema"
                    breadcrumbs={[
                      { label: 'Utilizadores', current: true }
                    ]}
                  />
                  <div className="p-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <p className="text-gray-600">Módulo em desenvolvimento</p>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditoria"
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ROOT}>
                <Layout>
                  <PageHeader
                    title="Auditoria"
                    description="Registo de atividades e logs do sistema"
                    breadcrumbs={[
                      { label: 'Auditoria', current: true }
                    ]}
                  />
                  <div className="p-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <p className="text-gray-600">Módulo em desenvolvimento</p>
                    </div>
                  </div>
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
