import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
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
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useIsMobile } from '../hooks/use-mobile';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from './ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutResponsive: React.FC<LayoutProps> = ({ children }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { canManageUsers, canAccessAudit } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
      name: 'Plano 7 Passos',
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

  const NavigationItem = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon;
    return (
      <Link
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
  };

  const MobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-800 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-full">
              <Fish className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-white">MPRM</SheetTitle>
              <p className="text-xs text-blue-100">Aquicultura</p>
            </div>
          </div>
        </SheetHeader>
        
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sistema de Gestão
            </h2>
          </div>
          <div className="space-y-1">
            {menuItems.filter(item => item.show).map((item) => (
              <NavigationItem key={item.name} item={item} />
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );

  const DesktopSidebar = () => (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-lg">
        {/* Desktop Header */}
        <div className="flex h-16 items-center px-6 bg-gradient-to-r from-blue-600 to-blue-800 border-b border-blue-700">
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
            {menuItems.filter(item => item.show).map((item) => (
              <NavigationItem key={item.name} item={item} />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar - Header Governamental */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 px-4 shadow-lg sm:px-6 lg:px-8">
          <MobileNavigation />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notificações */}
              <Button 
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-800"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificações</span>
              </Button>

              {/* User menu */}
              <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-x-3 text-white hover:bg-blue-800 px-3 py-2"
                  >
                    <div className="bg-white p-1.5 rounded-full">
                      <User className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium truncate max-w-32">{user?.full_name}</p>
                      <p className="text-xs text-blue-100">{user?.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-3" />
                    Terminar Sessão
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutResponsive;
