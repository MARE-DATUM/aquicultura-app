import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  FolderOpen, 
  BarChart3, 
  FileText, 
  MapPin, 
  Settings,
  LogOut,
  User,
  Fish,
  Shield,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { canManageUsers, canAccessAudit } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      show: true
    },
    {
      name: 'Projetos',
      href: '/projetos',
      icon: FolderOpen,
      show: true
    },
    {
      name: 'Indicadores',
      href: '/indicadores',
      icon: BarChart3,
      show: true
    },
    {
      name: '5W2H',
      href: '/eixos-5w2h',
      icon: FileText,
      show: true
    },
    {
      name: 'Licenciamentos',
      href: '/licenciamentos',
      icon: FileText,
      show: true
    },
    {
      name: 'Mapa',
      href: '/mapa',
      icon: MapPin,
      show: true
    },
    {
      name: 'Utilizadores',
      href: '/utilizadores',
      icon: Users,
      show: canManageUsers()
    },
    {
      name: 'Auditoria',
      href: '/auditoria',
      icon: Settings,
      show: canAccessAudit()
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 flex w-80 flex-col glass shadow-modern-lg">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between px-6 gradient-ocean">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-full">
                  <Fish className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">MPRM</h1>
                  <p className="text-xs text-blue-100">Aquicultura</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-blue-100 p-2 rounded-md hover:bg-blue-800 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
              <div className="space-y-2">
                {menuItems.filter(item => item.show).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar modernizado */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow glass border-r border-white border-opacity-20 shadow-modern">
          {/* Desktop Header */}
          <div className="flex h-16 items-center px-6 gradient-ocean border-b border-white border-opacity-20 rounded-b-2xl">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Fish className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">MPRM</h1>
                <p className="text-xs text-blue-100">Aquicultura</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Sistema de Gestão
              </h2>
            </div>
            <div className="space-y-1">
              {menuItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar - Header Governamental */}
        <div className="gradient-ocean sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 px-4 shadow-modern sm:px-6 lg:px-8 backdrop-blur-sm">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-white lg:hidden hover:bg-blue-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notificações */}
              <button 
                className="text-white hover:text-blue-100 p-2 rounded-md hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-x-3 text-white hover:text-blue-100 hover:bg-blue-800 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menu do utilizador"
                >
                  <div className="bg-white p-1.5 rounded-full">
                    <User className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium truncate max-w-32">{user?.full_name}</p>
                    <p className="text-xs text-blue-100">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Shield className="h-3 w-3 mr-1" />
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Terminar Sessão
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
