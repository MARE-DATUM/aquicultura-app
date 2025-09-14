import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Calendar,
  User,
  Activity,
  Shield
} from 'lucide-react';

interface AuditLog {
  id: number;
  user_id: number;
  acao: string;
  entidade: string | null;
  entidade_id: number | null;
  detalhes: string;
  ip: string | null;
  timestamp: string;
  papel: string | null;
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

const AuditoriaSimple: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Carregar logs
      const logsResponse = await fetch('/api/auditoria?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!logsResponse.ok) {
        throw new Error(`Erro ao carregar logs: ${logsResponse.status}`);
      }

      const logsData = await logsResponse.json();
      setAuditLogs(logsData.logs || []);

      // Carregar stats
      const statsResponse = await fetch('/api/auditoria/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entidade && log.entidade.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = !selectedAction || log.acao === selectedAction;
    const matchesEntity = !selectedEntity || log.entidade === selectedEntity;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionColor = (acao: string) => {
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
      case 'EXPORT':
        return 'bg-purple-100 text-purple-800';
      case 'IMPORT':
        return 'bg-indigo-100 text-indigo-800';
      case 'STATUS_CHANGE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityColor = (entidade: string | null) => {
    if (!entidade) return 'bg-gray-100 text-gray-800';
    
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-AO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Auditoria e Logs</h1>
            <p className="text-gray-600">Monitorização de atividades e ações do sistema</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Auditoria e Logs</h1>
            <p className="text-gray-600">Monitorização de atividades e ações do sistema</p>
          </div>
        </div>
        
        <Alert variant="danger">
          <Shield className="h-4 w-4" />
          <div>
            <h3 className="font-medium">Erro ao carregar dados</h3>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
        
        <Button onClick={loadData} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditoria e Logs</h1>
          <p className="text-gray-600">Monitorização de atividades e ações do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_logs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ações por Tipo</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.por_acao).length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entidades</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.por_entidade).length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.usuarios_mais_ativos.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Pesquisar por ação, entidade ou detalhes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full md:w-48"
          >
            <option value="">Todas as ações</option>
            {stats && Object.keys(stats.por_acao).map(acao => (
              <option key={acao} value={acao}>{acao}</option>
            ))}
          </Select>
          <Select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full md:w-48"
          >
            <option value="">Todas as entidades</option>
            {stats && Object.keys(stats.por_entidade).map(entidade => (
              <option key={entidade} value={entidade}>{entidade}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Logs List */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Logs de Auditoria ({filteredLogs.length})
            </h3>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum log encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros de pesquisa</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionColor(log.acao)}>
                          {log.acao}
                        </Badge>
                        {log.entidade && (
                          <Badge className={getEntityColor(log.entidade)}>
                            {log.entidade}
                          </Badge>
                        )}
                        {log.papel && (
                          <Badge variant="outline">
                            {log.papel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-900 mb-2">{log.detalhes}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(log.timestamp)}
                        </span>
                        {log.ip && (
                          <span>IP: {log.ip}</span>
                        )}
                        <span>ID: {log.id}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuditoriaSimple;