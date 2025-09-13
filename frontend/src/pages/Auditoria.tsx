import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Input, Badge, EmptyState, Alert, PageHeader } from '../components/ui';
import { Search, Download, Filter, Eye, Calendar, User, Activity, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import { formatDate } from '../utils';
import { usePermissions } from '../hooks/usePermissions';
import { useDebounce } from '../hooks/useDebounce';
import { AcaoAudit } from '../types/simple';

interface AuditLog {
  id: number;
  user_id?: number;
  papel?: string;
  acao: string;
  entidade?: string;
  entidade_id?: number;
  ip?: string;
  detalhes?: string;
  timestamp: string;
  user?: {
    id: number;
    email: string;
    full_name: string;
  };
}

interface AuditStats {
  total_logs: number;
  por_acao: Record<string, number>;
  por_entidade: Record<string, number>;
  usuarios_mais_ativos: Array<{
    user_id: number;
    total_acoes: number;
  }>;
}

const Auditoria: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    acao: undefined as AcaoAudit | undefined,
    entidade: '',
    data_inicio: '',
    data_fim: '',
    user_id: undefined as number | undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { canView, canAccessAudit } = usePermissions();
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);
  
  // Debounce para o campo de pesquisa
  const debouncedSearch = useDebounce(filters.search, 500);

  const loadAuditLogs = useCallback(async (currentFilters: typeof filters) => {
    if (loadingRef.current || !mountedRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      const response = await apiService.getAuditLogs({
        ...currentFilters,
        limit: 100
      });
      
      if (mountedRef.current) {
        // Validação robusta da resposta
        if (response && typeof response === 'object') {
          // Verificar se logs é um array válido
          if (Array.isArray(response.logs)) {
            setAuditLogs(response.logs);
          } else {
            console.warn('Logs não é um array:', response.logs);
            setAuditLogs([]);
          }
          
          // Verificar se stats existe
          if (response.stats && typeof response.stats === 'object') {
            setStats(response.stats);
          } else {
            console.warn('Stats não encontrado ou inválido:', response.stats);
            setStats(null);
          }
        } else {
          console.warn('Resposta inválida da API:', response);
          setAuditLogs([]);
          setStats(null);
        }
      }
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Erro ao carregar logs:', err);
        
        // Tratamento específico para diferentes tipos de erro
        if (err.response?.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
        } else if (err.response?.status === 403) {
          setError('Acesso negado. Não tem permissões para visualizar logs de auditoria.');
        } else if (err.response?.status >= 500) {
          setError('Erro interno do servidor. Tente novamente mais tarde.');
        } else {
          setError('Erro ao carregar logs de auditoria. Verifique sua conexão.');
        }
        
        // Garantir que os estados estão limpos em caso de erro
        setAuditLogs([]);
        setStats(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, []);

  const loadStats = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      const response = await apiService.getAuditStats();
      if (mountedRef.current) {
        // Validação da resposta de stats
        if (response && typeof response === 'object') {
          setStats(response);
        } else {
          console.warn('Stats inválido:', response);
          setStats(null);
        }
      }
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Erro ao carregar estatísticas:', err);
        // Não definir erro aqui pois é uma função auxiliar
        // O erro principal já é tratado em loadAuditLogs
      }
    }
  }, []);

  // Carregamento inicial
  useEffect(() => {
    if (canAccessAudit() && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadAuditLogs(filters);
      loadStats();
    }
  }, [canAccessAudit, loadAuditLogs, loadStats, filters]);


  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);


  const handleFilterChange = (key: string, value: string | number | AcaoAudit | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadAuditLogs({ ...filters, search: debouncedSearch });
    setShowFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      acao: undefined,
      entidade: '',
      data_inicio: '',
      data_fim: '',
      user_id: undefined
    };
    setFilters(clearedFilters);
    loadAuditLogs(clearedFilters);
  };

  const exportToCSV = async () => {
    try {
      const response = await apiService.exportAuditLogs(filters);
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erro ao exportar dados');
      console.error('Erro ao exportar:', err);
    }
  };

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'LOGIN':
        return 'bg-green-100 text-green-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
      case 'CREATE':
        return 'bg-blue-100 text-blue-800';
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'IMPORT':
        return 'bg-purple-100 text-purple-800';
      case 'EXPORT':
        return 'bg-indigo-100 text-indigo-800';
      case 'STATUS_CHANGE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntidadeColor = (entidade: string) => {
    switch (entidade) {
      case 'Projeto':
        return 'bg-blue-100 text-blue-800';
      case 'Indicador':
        return 'bg-green-100 text-green-800';
      case 'Licenciamento':
        return 'bg-purple-100 text-purple-800';
      case 'Eixo5W2H':
        return 'bg-yellow-100 text-yellow-800';
      case 'User':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!canView) {
    return (
      <div className="p-6">
        <Alert variant="danger">
          <Activity className="h-4 w-4" />
          <div>
            <h3 className="font-medium">Acesso Negado</h3>
            <p className="text-sm">Não tem permissões para visualizar logs de auditoria.</p>
          </div>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Auditoria e Logs"
          description="Monitorização de atividades e ações do sistema"
        />
        
        {/* Skeleton para estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Skeleton para filtros */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </Card>

        {/* Skeleton para tabela */}
        <Card className="p-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Auditoria e Logs"
        description="Monitorização de atividades e ações do sistema"
      />

      {error && (
        <Alert variant="danger" className="border-red-200 bg-red-50">
          <Activity className="h-4 w-4 text-red-600" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Erro ao Carregar Dados</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setError(null);
                  loadAuditLogs(filters);
                }}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Logs</p>
                <p className="text-2xl font-bold">{stats.total_logs}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold">{stats.usuarios_mais_ativos.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ações Hoje</p>
                <p className="text-2xl font-bold">
                  {Object.values(stats.por_acao).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Entidades</p>
                <p className="text-2xl font-bold">{Object.keys(stats.por_entidade).length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Filtros</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesquisar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.acao || ''}
                onChange={(e) => handleFilterChange('acao', e.target.value as AcaoAudit)}
              >
                <option value="">Todas as ações</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Criar</option>
                <option value="UPDATE">Atualizar</option>
                <option value="DELETE">Eliminar</option>
                <option value="IMPORT">Importar</option>
                <option value="EXPORT">Exportar</option>
                <option value="STATUS_CHANGE">Mudança de Status</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entidade
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.entidade}
                onChange={(e) => handleFilterChange('entidade', e.target.value)}
              >
                <option value="">Todas as entidades</option>
                <option value="Projeto">Projeto</option>
                <option value="Indicador">Indicador</option>
                <option value="Licenciamento">Licenciamento</option>
                <option value="Eixo5W2H">Eixo 5W2H</option>
                <option value="User">Utilizador</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <Input
                type="date"
                value={filters.data_inicio}
                onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <Input
                type="date"
                value={filters.data_fim}
                onChange={(e) => handleFilterChange('data_fim', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID do Utilizador
              </label>
              <Input
                type="number"
                placeholder="ID do utilizador"
                value={filters.user_id || ''}
                onChange={(e) => handleFilterChange('user_id', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={clearFilters}>
            Limpar
          </Button>
          <Button onClick={applyFilters}>
            Aplicar Filtros
          </Button>
        </div>
      </Card>

      {/* Lista de Logs */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Logs de Auditoria</h3>
        
        {auditLogs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Nenhum log encontrado"
            description={
              error 
                ? "Não foi possível carregar os logs de auditoria. Verifique sua conexão e tente novamente."
                : "Não há logs de auditoria que correspondam aos filtros aplicados."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilizador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user ? (
                        <div>
                          <div className="font-medium">{log.user.full_name}</div>
                          <div className="text-gray-500">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Sistema</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getAcaoColor(log.acao)}>
                        {log.acao}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.entidade ? (
                        <Badge className={getEntidadeColor(log.entidade)}>
                          {log.entidade}
                        </Badge>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ip || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Detalhes */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Detalhes do Log</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data/Hora</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Utilizador</label>
                  <p className="text-sm text-gray-900">
                    {selectedLog.user ? `${selectedLog.user.full_name} (${selectedLog.user.email})` : 'Sistema'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ação</label>
                  <Badge className={getAcaoColor(selectedLog.acao)}>
                    {selectedLog.acao}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Entidade</label>
                  <p className="text-sm text-gray-900">
                    {selectedLog.entidade || '-'}
                    {selectedLog.entidade_id && ` (ID: ${selectedLog.entidade_id})`}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP</label>
                  <p className="text-sm text-gray-900">{selectedLog.ip || '-'}</p>
                </div>
                
                {selectedLog.detalhes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Detalhes</label>
                    <p className="text-sm text-gray-900">{selectedLog.detalhes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auditoria;

