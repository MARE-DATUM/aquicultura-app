import React, { useState, useEffect, useCallback } from 'react';
import { 
  Target, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import type { Eixo5W2H, Projeto, Periodo5W2H } from '../types/simple';
import { PageHeader, Card, Button, Input, Badge, EmptyState, Alert } from '../components/ui';

const Eixos5W2H: React.FC = () => {
  const [eixos, setEixos] = useState<Eixo5W2H[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filtroProjeto, setFiltroProjeto] = useState<number | ''>('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<Periodo5W2H | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [eixoSelecionado, setEixoSelecionado] = useState<Eixo5W2H | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const { canCreate, canEdit, canDelete } = usePermissions();

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      setError(null);
      const [eixosData, projetosData] = await Promise.all([
        apiService.getEixos5W2H(
          filtroProjeto || undefined,
          filtroPeriodo || undefined,
          searchTerm || undefined
        ),
        apiService.getProjetos()
      ]);
      
      setEixos(eixosData);
      setProjetos(projetosData);
    } catch (err) {
      console.error('Erro ao carregar dados 5W2H:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtroProjeto, filtroPeriodo, searchTerm]);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleFiltrosChange = () => {
    loadData();
  };

  const handleEixoClick = (eixo: Eixo5W2H) => {
    setEixoSelecionado(eixo);
    setMostrarModal(true);
  };

  const handleDeleteEixo = async (eixoId: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar este eixo do plano?')) {
      return;
    }
    
    try {
      await apiService.deleteEixo5W2H(eixoId);
      await loadData();
    } catch (err) {
      console.error('Erro ao eliminar eixo:', err);
      setError('Erro ao eliminar eixo. Tente novamente.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPeriodoColor = (periodo: Periodo5W2H) => {
    switch (periodo) {
      case '0-6': return 'bg-blue-100 text-blue-800';
      case '7-12': return 'bg-green-100 text-green-800';
      case '13-18': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPeriodoLabel = (periodo: Periodo5W2H) => {
    switch (periodo) {
      case '0-6': return '0-6 meses';
      case '7-12': return '7-12 meses';
      case '13-18': return '13-18 meses';
      default: return periodo;
    }
  };

  const getProjetoNome = (projetoId: number) => {
    const projeto = projetos.find(p => p.id === projetoId);
    return projeto ? projeto.nome : `Projeto ${projetoId}`;
  };

  // Estatísticas
  const totalEixos = eixos.length;
  const eixosPorPeriodo = eixos.reduce((acc, eixo) => {
    acc[eixo.periodo] = (acc[eixo.periodo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const orcamentoTotal = eixos.reduce((sum, eixo) => sum + eixo.how_much_kz, 0);
  const projetosComEixos = new Set(eixos.map(e => e.projeto_id)).size;

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        loadData();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadData]);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Plano 7 Passos"
          description="Análise e planeamento estratégico dos projetos de aquicultura"
          breadcrumbs={[
            { label: 'Plano 7 Passos', current: true }
          ]}
        />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
        title="Plano 7 Passos"
        description="Análise e planeamento estratégico dos projetos de aquicultura"
        breadcrumbs={[
          { label: 'Plano 7 Passos', current: true }
        ]}
        actions={
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            {canCreate() && (
              <Button onClick={() => setMostrarModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Eixo
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Alertas de erro */}
        {error && (
          <Alert variant="danger">
            <AlertTriangle className="h-4 w-4" />
            <div>
              <h4 className="font-medium">Erro</h4>
              <p className="text-sm">{error}</p>
            </div>
          </Alert>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Eixos</p>
                <p className="text-2xl font-semibold text-gray-900">{totalEixos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Projetos com Eixos</p>
                <p className="text-2xl font-semibold text-gray-900">{projetosComEixos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Orçamento Total</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(orcamentoTotal)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Por Período</p>
                <div className="flex space-x-2 mt-1">
                  {Object.entries(eixosPorPeriodo).map(([periodo, count]) => (
                    <Badge key={periodo} variant="default" className="text-xs">
                      {getPeriodoLabel(periodo as Periodo5W2H)}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>

          {mostrarFiltros && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projeto
                </label>
                <select
                  value={filtroProjeto}
                  onChange={(e) => setFiltroProjeto(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os projetos</option>
                  {projetos.map((projeto) => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <select
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value as Periodo5W2H || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os períodos</option>
                  <option value="0-6">0-6 meses</option>
                  <option value="7-12">7-12 meses</option>
                  <option value="13-18">13-18 meses</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesquisar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={handleFiltrosChange}>
              Aplicar Filtros
            </Button>
          </div>
        </Card>

        {/* Lista de Eixos */}
        {eixos.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhum eixo do plano encontrado"
            description="Não há eixos do plano que correspondam aos filtros aplicados."
            action={
              canCreate() ? {
                label: "Criar Primeiro Eixo",
                onClick: () => setMostrarModal(true)
              } : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {eixos.map((eixo) => (
              <Card key={eixo.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {getProjetoNome(eixo.projeto_id)}
                    </h3>
                    <Badge 
                      variant="default" 
                      className={getPeriodoColor(eixo.periodo)}
                    >
                      {getPeriodoLabel(eixo.periodo)}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEixoClick(eixo)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit() && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEixoSelecionado(eixo);
                          setMostrarModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete() && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteEixo(eixo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">O que</h4>
                    <p className="text-sm text-gray-900 line-clamp-2">{eixo.what}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Porquê</h4>
                    <p className="text-sm text-gray-900 line-clamp-2">{eixo.why}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Onde</h4>
                    <p className="text-sm text-gray-900 line-clamp-2">{eixo.where}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Quando</h4>
                    <p className="text-sm text-gray-900 line-clamp-2">{eixo.when}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Quem</h4>
                    <p className="text-sm text-gray-900 line-clamp-2">{eixo.who}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Como</h4>
                    <p className="text-sm text-gray-900 line-clamp-2">{eixo.how}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Quanto</h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(eixo.how_much_kz)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Criado em {formatDate(eixo.created_at)}
                      </p>
                    </div>
                  </div>

                  {eixo.marcos && eixo.marcos.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Marcos</h4>
                      <div className="space-y-1">
                        {eixo.marcos.slice(0, 3).map((marco, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            {marco.nome}
                          </div>
                        ))}
                        {eixo.marcos.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{eixo.marcos.length - 3} mais marcos
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes/edição */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {eixoSelecionado ? 'Detalhes do Eixo do Plano' : 'Novo Eixo do Plano'}
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setMostrarModal(false);
                    setEixoSelecionado(null);
                  }}
                >
                  ✕
                </Button>
              </div>

              {eixoSelecionado ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Eixo</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Projeto</label>
                          <p className="mt-1 text-sm text-gray-900">{getProjetoNome(eixoSelecionado.projeto_id)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Período</label>
                          <Badge 
                            variant="default" 
                            className={getPeriodoColor(eixoSelecionado.periodo)}
                          >
                            {getPeriodoLabel(eixoSelecionado.periodo)}
                          </Badge>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Orçamento</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">
                            {formatCurrency(eixoSelecionado.how_much_kz)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Análise do Plano</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">O que</label>
                          <p className="mt-1 text-sm text-gray-900">{eixoSelecionado.what}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Porquê</label>
                          <p className="mt-1 text-sm text-gray-900">{eixoSelecionado.why}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Onde</label>
                          <p className="mt-1 text-sm text-gray-900">{eixoSelecionado.where}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quando</label>
                          <p className="mt-1 text-sm text-gray-900">{eixoSelecionado.when}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quem</label>
                          <p className="mt-1 text-sm text-gray-900">{eixoSelecionado.who}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Como</label>
                          <p className="mt-1 text-sm text-gray-900">{eixoSelecionado.how}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {eixoSelecionado.marcos && eixoSelecionado.marcos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Marcos do Projeto</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eixoSelecionado.marcos.map((marco, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{marco.nome}</h4>
                              <Badge 
                                variant="default" 
                                className={
                                  marco.status === 'Concluído' 
                                    ? 'bg-green-100 text-green-800'
                                    : marco.status === 'Em Progresso'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {marco.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Data: {formatDate(marco.data)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setMostrarModal(false);
                        setEixoSelecionado(null);
                      }}
                    >
                      Fechar
                    </Button>
                    {canEdit() && (
                      <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Eixo
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Formulário de Criação
                  </h3>
                  <p className="text-gray-500 mb-6">
                    O formulário de criação de eixos do plano será implementado em breve.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setMostrarModal(false);
                      setEixoSelecionado(null);
                    }}
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Eixos5W2H;
