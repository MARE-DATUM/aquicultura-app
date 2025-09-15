import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause
} from 'lucide-react';
import { apiService } from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { useDebounce } from '../hooks/useDebounce';
import type { Projeto, Provincia, ProjetoFilters } from '../types/simple';
import { PageHeader, Button, Input, Card, Badge, EmptyState, Alert } from '../components/ui';
import { ProjetoForm } from '../components/forms/ProjetoForm';

const Projetos: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('view');
  const [showForm, setShowForm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const { canCreate, canEdit, canDelete } = usePermissions();

  const [filters, setFilters] = useState<ProjetoFilters>({
    provincia_id: undefined,
    tipo: undefined,
    fonte_financiamento: undefined,
    estado: undefined,
    search: ''
  });

  // Debounce do termo de pesquisa
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadData();
  }, [filters]);

  // Efeito separado para atualizar filtros quando o termo de pesquisa com debounce muda
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm }));
  }, [debouncedSearchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projetosData, provinciasData] = await Promise.all([
        apiService.getProjetos(filters),
        apiService.getProvincias()
      ]);
      setProjetos(projetosData);
      setProvincias(provinciasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (key: keyof ProjetoFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      provincia_id: undefined,
      tipo: undefined,
      fonte_financiamento: undefined,
      estado: undefined,
      search: ''
    });
    setSearchTerm('');
  };

  const openModal = (type: 'create' | 'edit' | 'view', projeto?: Projeto) => {
    if (type === 'view') {
      setModalType(type);
      setSelectedProjeto(projeto || null);
      setShowModal(true);
    } else {
      // Para criar ou editar, usar o novo formulário
      setSelectedProjeto(projeto || null);
      setShowForm(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProjeto(null);
  };

  const handleFormSuccess = () => {
    loadData();
    setShowForm(false);
    setSelectedProjeto(null);
  };

  const handleDelete = async (projeto: Projeto) => {
    if (!canDelete()) return;
    
    if (window.confirm(`Tem certeza que deseja eliminar o projeto "${projeto.nome}"?`)) {
      try {
        setDeleteError(null);
        setDeleteSuccess(null);
        await apiService.deleteProjeto(projeto.id);
        setDeleteSuccess(`Projeto "${projeto.nome}" eliminado com sucesso!`);
        await loadData();
        setTimeout(() => setDeleteSuccess(null), 5000);
      } catch (error: any) {
        setDeleteError(error.message || 'Erro ao eliminar projeto');
        setTimeout(() => setDeleteError(null), 5000);
      }
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'PLANEADO':
        return <Clock className="h-4 w-4" />;
      case 'EM_EXECUCAO':
        return <CheckCircle className="h-4 w-4" />;
      case 'CONCLUIDO':
        return <CheckCircle className="h-4 w-4" />;
      case 'SUSPENSO':
        return <Pause className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'PLANEADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'EM_EXECUCAO':
        return 'bg-blue-100 text-blue-800';
      case 'CONCLUIDO':
        return 'bg-green-100 text-green-800';
      case 'SUSPENSO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateProgress = (executado: number | string, previsto: number | string) => {
    const previstoNum = Number(previsto);
    const executadoNum = Number(executado);
    if (previstoNum === 0) return 0;
    return Math.min((executadoNum / previstoNum) * 100, 100);
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Projetos"
          description="Gestão e monitorização dos projetos de aquicultura"
          breadcrumbs={[{ label: 'Projetos', current: true }]}
        />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Projetos"
        description="Gestão e monitorização dos projetos de aquicultura"
        breadcrumbs={[{ label: 'Projetos', current: true }]}
      />

      <div className="p-6">
        {/* Barra de Ações */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Pesquisa */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Pesquisar projetos..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {Object.values(filters).some(v => v !== undefined && v !== '') && (
                <Badge variant="default" className="ml-2">
                  {Object.values(filters).filter(v => v !== undefined && v !== '').length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            {canCreate() && (
              <Button 
                onClick={() => openModal('create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            )}
          </div>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Província
                </label>
                <select
                  value={filters.provincia_id || ''}
                  onChange={(e) => handleFilterChange('provincia_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todas as províncias</option>
                  {provincias.map(provincia => (
                    <option key={provincia.id} value={provincia.id}>
                      {provincia.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={filters.tipo || ''}
                  onChange={(e) => handleFilterChange('tipo', e.target.value || undefined)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todos os tipos</option>
                  <option value="COMUNITARIO">Comunitário</option>
                  <option value="EMPRESARIAL">Empresarial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonte de Financiamento
                </label>
                <select
                  value={filters.fonte_financiamento || ''}
                  onChange={(e) => handleFilterChange('fonte_financiamento', e.target.value || undefined)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todas as fontes</option>
                  <option value="AFAP-2">AFAP-2</option>
                  <option value="FADEPA">FADEPA</option>
                  <option value="FACRA">FACRA</option>
                  <option value="PRIVADO">Privado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.estado || ''}
                  onChange={(e) => handleFilterChange('estado', e.target.value || undefined)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todos os estados</option>
                  <option value="PLANEADO">Planeado</option>
                  <option value="EM_EXECUCAO">Em Execução</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="SUSPENSO">Suspenso</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </Card>
        )}

        {/* Lista de Projetos */}
        {projetos.length === 0 ? (
          <EmptyState
            title="Nenhum projeto encontrado"
            description="Não existem projetos que correspondam aos critérios de pesquisa."
            action={
              canCreate() ? {
                label: "Criar Primeiro Projeto",
                onClick: () => openModal('create')
              } : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projetos.map((projeto) => {
              const provincia = provincias.find(p => p.id === projeto.provincia_id);
              const progress = calculateProgress(projeto.orcamento_executado_kz, projeto.orcamento_previsto_kz);
              
              return (
                <Card key={projeto.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {projeto.nome}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {provincia?.nome}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`flex items-center gap-1 ${getStatusColor(projeto.estado)}`}>
                        {getStatusIcon(projeto.estado)}
                        {projeto.estado.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">{projeto.tipo}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fonte:</span>
                      <span className="font-medium">{projeto.fonte_financiamento}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Responsável:</span>
                      <span className="font-medium">{projeto.responsavel}</span>
                    </div>
                  </div>

                  {/* Progresso Orçamental */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Execução Orçamental</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(Number(projeto.orcamento_executado_kz))}</span>
                      <span>{formatCurrency(Number(projeto.orcamento_previsto_kz))}</span>
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Início: {new Date(projeto.data_inicio_prevista).toLocaleDateString('pt-AO')}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Fim: {new Date(projeto.data_fim_prevista).toLocaleDateString('pt-AO')}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal('view', projeto)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                    
                    <div className="flex gap-1">
                      {canEdit() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal('edit', projeto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(projeto)}
                          className="text-red-600 hover:text-red-800"
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

        {/* Estatísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Projetos</p>
                <p className="text-2xl font-bold text-gray-900">{projetos.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Execução</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projetos.filter(p => p.estado === 'EM_EXECUCAO').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planeados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projetos.filter(p => p.estado === 'PLANEADO').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orçamento Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(projetos.reduce((sum, p) => sum + Number(p.orcamento_previsto_kz), 0))}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Alerts de feedback */}
      {deleteError && (
        <div className="fixed top-4 right-4 z-50">
          <Alert variant="destructive">
            {deleteError}
          </Alert>
        </div>
      )}
      {deleteSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <Alert variant="default">
            {deleteSuccess}
          </Alert>
        </div>
      )}

      {/* Formulário de criação/edição */}
      <ProjetoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        projeto={selectedProjeto}
        onSuccess={handleFormSuccess}
        provincias={provincias}
      />

      {/* Modal de visualização */}
      {showModal && modalType === 'view' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              Detalhes do Projeto
            </h2>
            
            {selectedProjeto && modalType === 'view' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProjeto.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProjeto.descricao}</p>
                </div>
                {/* Adicionar mais campos conforme necessário */}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={closeModal}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Projetos;
