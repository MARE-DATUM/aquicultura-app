import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Skeleton, EmptyState } from '../components/ui';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import { formatDate } from '../utils';

const AuditoriaFixed: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getAuditLogs({
        page: 1,
        limit: 20,
        search: search || undefined,
      });

      // Verificar se a resposta tem a estrutura esperada
      if (response && typeof response === 'object') {
        // Verificar se logs é um array
        if (Array.isArray(response.logs)) {
          setLogs(response.logs);
        } else {
          console.warn('Logs não é um array:', response.logs);
          setLogs([]);
        }
        
        // Verificar se stats existe
        if (response.stats) {
          setStats(response.stats);
        } else {
          setStats(null);
        }
      } else {
        console.warn('Resposta inválida:', response);
        setLogs([]);
        setStats(null);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
      setLogs([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    loadData();
  };

  const getAcaoColor = (acao: string) => {
    const colors: Record<string, string> = {
      'LOGIN': 'bg-green-100 text-green-800',
      'LOGOUT': 'bg-red-100 text-red-800',
      'CREATE': 'bg-blue-100 text-blue-800',
      'UPDATE': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800',
    };
    return colors[acao] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao Carregar Dados</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total de Logs</div>
            <div className="text-2xl font-bold">{stats.total_logs || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Usuários Ativos</div>
            <div className="text-2xl font-bold">{stats.active_users || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Ações Hoje</div>
            <div className="text-2xl font-bold">{stats.actions_today || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Entidades</div>
            <div className="text-2xl font-bold">{stats.entities_count || 0}</div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Pesquisar logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Pesquisar
          </Button>
        </div>
      </Card>

      {/* Lista de Logs */}
      {logs.length === 0 ? (
        <EmptyState
          title="Nenhum log encontrado"
          description="Não há logs de auditoria para exibir no momento."
        />
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getAcaoColor(log.acao)}>
                      {log.acao}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Usuário:</strong> {log.user_id}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Entidade:</strong> {log.entidade}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Detalhes:</strong> {log.detalhes}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditoriaFixed;
