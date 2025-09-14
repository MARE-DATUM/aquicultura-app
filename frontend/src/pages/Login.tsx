import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Fish, Lock, Mail, Loader2 } from 'lucide-react';
import { Button, Card, Input, Alert } from '../components/ui';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-900 font-medium">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com gradiente moderno */}
      <div className="absolute inset-0 gradient-ocean"></div>
      
      {/* Elementos decorativos flutuantes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-white bg-opacity-5 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white bg-opacity-5 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
      
      <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header Governamental Modernizado */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full blur-md animate-pulse-glow"></div>
              <div className="relative glass rounded-full p-6 animate-float">
                <Fish className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-tight">
              República de Angola
            </h1>
            <div className="glass-dark rounded-2xl px-6 py-4 mx-4">
              <h2 className="text-xl font-bold text-white">
                Ministério das Pescas e Recursos Marinhos
              </h2>
              <p className="text-blue-100 font-medium mt-2">
                Sistema de Gestão dos 21 Projectos de Aquicultura
              </p>
            </div>
            <p className="text-blue-100 text-sm font-medium">
              🔒 Acesso restrito a funcionários autorizados
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md animate-scale-in">
          <div className="glass rounded-3xl p-8 shadow-modern-lg hover-lift">
            <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              label="Endereço de Email"
              icon={<Mail className="h-4 w-4" />}
              placeholder="seu.email@gov.ao"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              label="Palavra-passe"
              icon={<Lock className="h-4 w-4" />}
              placeholder="Digite a sua palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <Alert variant="danger">
                {error}
              </Alert>
            )}

              <Button
                type="submit"
                disabled={isLoading}
                icon={<Shield className="h-5 w-5" />}
                className="w-full shadow-glow hover:shadow-modern-lg transition-all duration-300"
                size="lg"
              >
                🚀 Aceder ao Sistema
              </Button>
            </form>

            {/* Credenciais de demonstração modernizadas */}
            <div className="mt-8 pt-6 border-t border-white border-opacity-20">
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-300" />
                  🔑 Credenciais de Demonstração
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="glass rounded-xl p-3 hover-lift">
                    <p className="font-bold text-white">👑 Administrador (ROOT)</p>
                    <p className="text-blue-200 font-mono">admin@aquicultura.ao</p>
                    <p className="text-blue-200 font-mono">admin123456</p>
                  </div>
                  <div className="glass rounded-xl p-3 hover-lift">
                    <p className="font-bold text-white">📊 Gestão de Dados</p>
                    <p className="text-blue-200 font-mono">gestao@aquicultura.ao</p>
                    <p className="text-blue-200 font-mono">gestao123456</p>
                  </div>
                  <div className="glass rounded-xl p-3 hover-lift">
                    <p className="font-bold text-white">👁️ Visualização</p>
                    <p className="text-blue-200 font-mono">visualizacao@aquicultura.ao</p>
                    <p className="text-blue-200 font-mono">visualizacao123456</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer modernizado */}
        <div className="mt-12 text-center animate-slide-up">
          <div className="glass-dark rounded-2xl px-6 py-4 mx-4">
            <p className="text-xs text-blue-100 font-medium">
              © 2024 República de Angola - Ministério das Pescas e Recursos Marinhos
            </p>
            <p className="text-xs text-blue-200 mt-2 flex items-center justify-center">
              🛡️ Sistema protegido por medidas de segurança governamentais
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
