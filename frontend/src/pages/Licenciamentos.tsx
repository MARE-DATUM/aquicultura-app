import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Building,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';
import { PageHeader, Button, Input, Card, Badge, EmptyState, Alert } from '../components/ui';
import { apiService } from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { formatCurrency, formatDate } from '../utils';

// Tipos
interface Licenciamento {
  id: number;
  projeto_id: number;
  status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'NEGADO';
  entidade_responsavel: 'IPA' | 'DNA' | 'DNRM';
  data_submissao: string;
  data_decisao?: string;
  observacoes?: string;
  projeto?: {
    id: number;
    nome: string;
  };
  created_at: string;
  updated_at?: string;
}

interface LicenciamentoStats {
  total_licenciamentos: number;
  por_status: Record<string, number>;
  por_entidade: Record<string, number>;
  tempo_medio_processamento_dias: number;
  taxa_aprovacao: number;
}

const statusConfig = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  EM_ANALISE: { label: 'Em Análise', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  APROVADO: { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  NEGADO: { label: 'Negado', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const entidadeConfig = {
  IPA: { label: 'IPA', color: 'bg-purple-100 text-purple-800' },
  DNA: { label: 'DNA', color: 'bg-indigo-100 text-indigo-800' },
  DNRM: { label: 'DNRM', color: 'bg-cyan-100 text-cyan-800' }
};

export default function Licenciamentos() {
  const [licenciamentos, setLicenciamentos] = useState<Licenciamento[]>([]);
  const [stats, setStats] = useState<LicenciamentoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [entidadeFilter, setEntidadeFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLicenciamento, setSelectedLicenciamento] = useState<Licenciamento | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { canCreate, canEdit, canDelete } = usePermissions();

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [licenciamentosData, statsData] = await Promise.all([
        apiService.getLicenciamentos(),
        apiService.getLicenciamentosStats()
      ]);
      
      setLicenciamentos(licenciamentosData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados dos licenciamentos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar licenciamentos
  const filteredLicenciamentos = licenciamentos.filter(lic => {
    const matchesSearch = !searchTerm || 
      lic.observacoes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.projeto?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || lic.status === statusFilter;
    const matchesEntidade = !entidadeFilter || lic.entidade_responsavel === entidadeFilter;
    
    return matchesSearch && matchesStatus && matchesEntidade;
  });

  // Calcular tempo de processamento
  const getTempoProcessamento = (lic: Licenciamento) => {
    if (!lic.data_decisao) return null;
    const inicio = new Date(lic.data_submissao);
    const fim = new Date(lic.data_decisao);
    const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  // Ações
  const handleView = (lic: Licenciamento) => {
    setSelectedLicenciamento(lic);
    setShowModal(true);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiService.updateLicenciamentoStatus(id, newStatus);
      await loadData();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status do licenciamento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar este licenciamento?')) return;
    
    try {
      await apiService.deleteLicenciamento(id);
      await loadData();
    } catch (err) {
      console.error('Erro ao eliminar licenciamento:', err);
      setError('Erro ao eliminar licenciamento');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['ID', 'Projeto', 'Status', 'Entidade', 'Data Submissão', 'Data Decisão', 'Tempo (dias)', 'Observações'],
      ...filteredLicenciamentos.map(lic => [
        lic.id,
        lic.projeto?.nome || '',
        statusConfig[lic.status as keyof typeof statusConfig]?.label || lic.status,
        entidadeConfig[lic.entidade_responsavel as keyof typeof entidadeConfig]?.label || lic.entidade_responsavel,
        formatDate(lic.data_submissao),
        lic.data_decisao ? formatDate(lic.data_decisao) : '',
        getTempoProcessamento(lic)?.toString() || '',
        lic.observacoes || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `licenciamentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Licenciamentos Fast-Track"
          description="Gestão e acompanhamento de licenciamentos"
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
          title="Licenciamentos Fast-Track"
          description="Gestão e acompanhamento de licenciamentos"
        />
        <Alert variant="danger">
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
        title="Licenciamentos Fast-Track"
        description="Gestão e acompanhamento de licenciamentos"
        actions={
          <div className="flex gap-2">
            {canCreate && (
              <Button onClick={() => {/* TODO: Implementar modal de criação */}}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Licenciamento
              </Button>
            )}
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
                <p className="text-2xl font-bold text-gray-900">{stats.total_licenciamentos}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Aprovação</p>
                <p className="text-2xl font-bold text-green-600">{stats.taxa_aprovacao}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-orange-600">{stats.tempo_medio_processamento_dias} dias</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Análise</p>
                <p className="text-2xl font-bold text-blue-600">{stats.por_status.EM_ANALISE || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
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
                placeholder="Pesquisar por projeto ou observações..."
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entidade</label>
              <select
                value={entidadeFilter}
                onChange={(e) => setEntidadeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as entidades</option>
                {Object.entries(entidadeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Lista de Licenciamentos */}
      {filteredLicenciamentos.length === 0 ? (
        <EmptyState
          title="Nenhum licenciamento encontrado"
          description="Não há licenciamentos que correspondam aos filtros aplicados."
          action={
            canCreate ? {
              label: "Criar Primeiro Licenciamento",
              onClick: () => {/* TODO: Implementar modal de criação */}
            } : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredLicenciamentos.map((lic) => {
            const StatusIcon = statusConfig[lic.status as keyof typeof statusConfig]?.icon || Clock;
            const tempoProcessamento = getTempoProcessamento(lic);
            
            return (
              <Card key={lic.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <StatusIcon className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lic.projeto?.nome || `Projeto ${lic.projeto_id}`}
                      </h3>
                      <Badge 
                        variant="default" 
                        className={statusConfig[lic.status as keyof typeof statusConfig]?.color}
                      >
                        {statusConfig[lic.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {entidadeConfig[lic.entidade_responsavel as keyof typeof entidadeConfig]?.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Submissão: {formatDate(lic.data_submissao)}
                        </span>
                      </div>
                      
                      {lic.data_decisao && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Decisão: {formatDate(lic.data_decisao)}
                          </span>
                        </div>
                      )}
                      
                      {tempoProcessamento && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {tempoProcessamento} dias
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {lic.observacoes && (
                      <p className="text-sm text-gray-600 mb-4">{lic.observacoes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(lic)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {canEdit && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* TODO: Implementar modal de edição */}}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {lic.status === 'PENDENTE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(lic.id, 'EM_ANALISE')}
                          >
                            Iniciar Análise
                          </Button>
                        )}
                        
                        {lic.status === 'EM_ANALISE' && (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(lic.id, 'APROVADO')}
                              className="text-green-600 hover:text-green-700"
                            >
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(lic.id, 'NEGADO')}
                              className="text-red-600 hover:text-red-700"
                            >
                              Negar
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                    
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(lic.id)}
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
      {showModal && selectedLicenciamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Detalhes do Licenciamento</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
                  <p className="text-gray-900">{selectedLicenciamento.projeto?.nome || `Projeto ${selectedLicenciamento.projeto_id}`}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Badge 
                      variant="default" 
                      className={statusConfig[selectedLicenciamento.status as keyof typeof statusConfig]?.color}
                    >
                      {statusConfig[selectedLicenciamento.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entidade Responsável</label>
                    <p className="text-gray-900">
                      {entidadeConfig[selectedLicenciamento.entidade_responsavel as keyof typeof entidadeConfig]?.label}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Submissão</label>
                    <p className="text-gray-900">{formatDate(selectedLicenciamento.data_submissao)}</p>
                  </div>
                  
                  {selectedLicenciamento.data_decisao && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Decisão</label>
                      <p className="text-gray-900">{formatDate(selectedLicenciamento.data_decisao)}</p>
                    </div>
                  )}
                </div>
                
                {selectedLicenciamento.observacoes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedLicenciamento.observacoes}</p>
                  </div>
                )}
                
                {getTempoProcessamento(selectedLicenciamento) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Processamento</label>
                    <p className="text-gray-900">{getTempoProcessamento(selectedLicenciamento)} dias</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
