import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  Key,
  Mail,
  Calendar,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { PageHeader, Button, Input, Card, Badge, EmptyState, Alert } from '../components/ui';
import { apiService } from '../services/api';
import { formatDate } from '../utils';
import { USER_ROLES } from '../types/constants';

// Tipos
interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'ROOT' | 'GESTAO_DADOS' | 'VISUALIZACAO';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  users_by_role: Record<string, number>;
  recent_logins: number;
}

const roleConfig = {
  ROOT: { 
    label: 'ROOT', 
    color: 'bg-red-100 text-red-800', 
    icon: Shield,
    description: 'Administrador do sistema'
  },
  GESTAO_DADOS: { 
    label: 'Gestão de Dados', 
    color: 'bg-blue-100 text-blue-800', 
    icon: UserCheck,
    description: 'Gestão completa de dados'
  },
  VISUALIZACAO: { 
    label: 'Visualização', 
    color: 'bg-green-100 text-green-800', 
    icon: Eye,
    description: 'Apenas visualização'
  }
};

const statusConfig = {
  true: { label: 'Ativo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  false: { label: 'Inativo', color: 'bg-red-100 text-red-800', icon: UserX }
};

export default function Utilizadores() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersData = await apiService.getUsers();
      setUsers(usersData);
      
      // Calcular estatísticas básicas
      const statsData = {
        total_users: usersData.length,
        active_users: usersData.filter(u => u.is_active).length,
        users_by_role: {
          ROOT: usersData.filter(u => u.role === 'ROOT').length,
          GESTAO_DADOS: usersData.filter(u => u.role === 'GESTAO_DADOS').length,
          VISUALIZACAO: usersData.filter(u => u.role === 'VISUALIZACAO').length
        },
        recent_logins: usersData.filter(u => u.last_login && 
          new Date(u.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      };
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados dos utilizadores');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar utilizadores
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.is_active.toString() === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Ações
  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiService.updateUser(id, { is_active: !currentStatus });
      await loadData();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      setError('Erro ao alterar status do utilizador');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar este utilizador?')) return;
    
    try {
      await apiService.deleteUser(id);
      await loadData();
    } catch (err) {
      console.error('Erro ao eliminar utilizador:', err);
      setError('Erro ao eliminar utilizador');
    }
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const exportData = () => {
    const csvContent = [
      ['ID', 'Nome', 'Email', 'Papel', 'Status', 'Data Criação', 'Último Login'],
      ...filteredUsers.map(user => [
        user.id,
        user.full_name,
        user.email,
        roleConfig[user.role as keyof typeof roleConfig]?.label || user.role,
        statusConfig[user.is_active.toString() as keyof typeof statusConfig]?.label || (user.is_active ? 'Ativo' : 'Inativo'),
        formatDate(user.created_at),
        user.last_login ? formatDate(user.last_login) : 'Nunca'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `utilizadores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Utilizadores"
          description="Administração de utilizadores e permissões do sistema"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Utilizadores"
          description="Administração de utilizadores e permissões do sistema"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h3 className="font-medium">Erro ao carregar dados</h3>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Utilizadores"
        description="Administração de utilizadores e permissões do sistema"
        actions={
          <div className="flex gap-2">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Utilizador
            </Button>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        }
      />

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_users}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROOT</p>
                <p className="text-2xl font-bold text-red-600">{stats.users_by_role.ROOT}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Logins Recentes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.recent_logins}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Papel</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os papéis</option>
                {Object.entries(roleConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Lista de Utilizadores */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum utilizador encontrado"
          description="Não há utilizadores que correspondam aos filtros aplicados."
          action={{
            label: "Criar Primeiro Utilizador",
            onClick: handleCreate
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredUsers.map((user) => {
            const RoleIcon = roleConfig[user.role as keyof typeof roleConfig]?.icon || Users;
            const StatusIcon = statusConfig[user.is_active.toString() as keyof typeof statusConfig]?.icon || CheckCircle;
            
            return (
              <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <RoleIcon className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                      <Badge 
                        variant="default" 
                        className={roleConfig[user.role as keyof typeof roleConfig]?.color}
                      >
                        {roleConfig[user.role as keyof typeof roleConfig]?.label}
                      </Badge>
                      <Badge 
                        variant="default" 
                        className={statusConfig[user.is_active.toString() as keyof typeof statusConfig]?.color}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[user.is_active.toString() as keyof typeof statusConfig]?.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Criado: {formatDate(user.created_at)}
                        </span>
                      </div>
                      
                      {user.last_login && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Último login: {formatDate(user.last_login)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {roleConfig[user.role as keyof typeof roleConfig]?.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={user.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                    >
                      {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    
                    {user.role !== 'ROOT' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Detalhes do Utilizador</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <p className="text-gray-900">{selectedUser.full_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Papel</label>
                    <Badge 
                      variant="default" 
                      className={roleConfig[selectedUser.role as keyof typeof roleConfig]?.color}
                    >
                      {roleConfig[selectedUser.role as keyof typeof roleConfig]?.label}
                    </Badge>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Badge 
                      variant="default" 
                      className={statusConfig[selectedUser.is_active.toString() as keyof typeof statusConfig]?.color}
                    >
                      {statusConfig[selectedUser.is_active.toString() as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Criação</label>
                    <p className="text-gray-900">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  
                  {selectedUser.last_login && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Último Login</label>
                      <p className="text-gray-900">{formatDate(selectedUser.last_login)}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Papel</label>
                  <p className="text-gray-900">{roleConfig[selectedUser.role as keyof typeof roleConfig]?.description}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Criação/Edição - Placeholder */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {showCreateModal ? 'Criar Utilizador' : 'Editar Utilizador'}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                >
                  ✕
                </Button>
              </div>
              
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  Funcionalidade de criação/edição será implementada em breve.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="mt-4"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
