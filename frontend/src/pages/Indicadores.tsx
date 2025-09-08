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
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { apiService } from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import type { Indicador, Projeto, IndicadorFilters, Trimestre } from '../types/simple';
import { PageHeader, Button, Input, Card, Badge, EmptyState } from '../components/ui';

const Indicadores: React.FC = () => {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndicador, setSelectedIndicador] = useState<Indicador | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('view');

  const { canCreate, canEdit, canDelete } = usePermissions();

  const [filters, setFilters] = useState<IndicadorFilters>({
    projeto_id: undefined,
    periodo_referencia: undefined,
    search: ''
  });

  const trimestres: Trimestre[] = ['T1', 'T2', 'T3', 'T4'];
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [indicadoresData, projetosData] = await Promise.all([
        apiService.getIndicadores(filters),
        apiService.getProjetos()
      ]);
      setIndicadores(indicadoresData);
      setProjetos(projetosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters({ ...filters, search: term });
  };

  const handleFilterChange = (key: keyof IndicadorFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      projeto_id: undefined,
      periodo_referencia: undefined,
      search: ''
    });
    setSearchTerm('');
  };

  const openModal = (type: 'create' | 'edit' | 'view', indicador?: Indicador) => {
    setModalType(type);
    setSelectedIndicador(indicador || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIndicador(null);
  };

  const handleDelete = async (indicador: Indicador) => {
    if (!canDelete()) return;
    
    if (window.confirm(`Tem certeza que deseja eliminar o indicador "${indicador.nome}"?`)) {
      try {
        await apiService.deleteIndicador(indicador.id);
        await loadData();
      } catch (error) {
        console.error('Erro ao eliminar indicador:', error);
      }
    }
  };

  const calculateProgress = (atual: number | string, meta: number | string) => {
    const metaNum = Number(meta);
    const atualNum = Number(atual);
    if (metaNum === 0) return 0;
    return Math.min((atualNum / metaNum) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 90) return { icon: CheckCircle, color: 'text-green-600', label: 'Excelente' };
    if (progress >= 70) return { icon: TrendingUp, color: 'text-blue-600', label: 'Bom' };
    if (progress >= 50) return { icon: Activity, color: 'text-yellow-600', label: 'Regular' };
    return { icon: AlertTriangle, color: 'text-red-600', label: 'Crítico' };
  };

  // Dados para gráficos
  console.log('Debug - Indicadores carregados:', indicadores.length);
  console.log('Debug - Projetos carregados:', projetos.length);
  
  const chartData = {
    byTrimestre: trimestres.map(trimestre => {
      const indicadoresTrimestre = indicadores.filter(i => i.periodo_referencia === trimestre);
      const totalMeta = indicadoresTrimestre.reduce((sum, i) => sum + Number(i.meta), 0);
      const totalAtual = indicadoresTrimestre.reduce((sum, i) => sum + Number(i.valor_actual), 0);
      return {
        trimestre,
        meta: totalMeta,
        atual: totalAtual,
        execucao: totalMeta > 0 ? (totalAtual / totalMeta) * 100 : 0
      };
    }),
    byProjeto: projetos
      .map(projeto => {
        const indicadoresProjeto = indicadores.filter(i => i.projeto_id === projeto.id);
        const totalMeta = indicadoresProjeto.reduce((sum, i) => sum + Number(i.meta), 0);
        const totalAtual = indicadoresProjeto.reduce((sum, i) => sum + Number(i.valor_actual), 0);
        return {
          nome: projeto.nome.length > 25 ? projeto.nome.substring(0, 25) + '...' : projeto.nome,
          meta: totalMeta,
          atual: totalAtual,
          execucao: totalMeta > 0 ? (totalAtual / totalMeta) * 100 : 0,
          temIndicadores: indicadoresProjeto.length > 0
        };
      })
      .filter(projeto => projeto.temIndicadores) // Apenas projetos com indicadores
      .sort((a, b) => b.execucao - a.execucao)   // Ordenar por execução desc
      .slice(0, 10),                             // Top 10
    statusDistribution: (() => {
      let acimaMeta = 0, dentroMeta = 0, abaixoMeta = 0, critico = 0;
      
      indicadores.forEach(i => {
        const meta = Number(i.meta);
        const atual = Number(i.valor_actual);
        
        if (meta === 0) {
          critico++; // Meta zero é considerado crítico
          return;
        }
        
        const pct = atual / meta;
        
        if (pct > 1.0) {
          acimaMeta++;
        } else if (pct >= 0.8) {
          dentroMeta++;
        } else if (pct >= 0.5) {
          abaixoMeta++;
        } else {
          critico++;
        }
      });
      
      return [
        { name: 'Acima da Meta', value: acimaMeta, color: '#10B981' },
        { name: 'Dentro da Meta', value: dentroMeta, color: '#3B82F6' },
        { name: 'Abaixo da Meta', value: abaixoMeta, color: '#F59E0B' },
        { name: 'Crítico', value: critico, color: '#EF4444' }
      ];
    })()
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Indicadores"
          description="Registo e acompanhamento de indicadores trimestrais"
          breadcrumbs={[{ label: 'Indicadores', current: true }]}
        />
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
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
        title="Indicadores"
        description="Registo e acompanhamento de indicadores trimestrais"
        breadcrumbs={[{ label: 'Indicadores', current: true }]}
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
                placeholder="Pesquisar indicadores..."
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
                Novo Indicador
              </Button>
            )}
          </div>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projeto
                </label>
                <select
                  value={filters.projeto_id || ''}
                  onChange={(e) => handleFilterChange('projeto_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todos os projetos</option>
                  {projetos.map(projeto => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trimestre
                </label>
                <select
                  value={filters.periodo_referencia || ''}
                  onChange={(e) => handleFilterChange('periodo_referencia', e.target.value as Trimestre || undefined)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todos os trimestres</option>
                  {trimestres.map(trimestre => (
                    <option key={trimestre} value={trimestre}>
                      {trimestre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Indicadores</p>
                <p className="text-2xl font-bold text-gray-900">{indicadores.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meta Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {indicadores.reduce((sum, i) => sum + Number(i.meta), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Realizado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {indicadores.reduce((sum, i) => sum + Number(i.valor_actual), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Execução Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {indicadores.length > 0 
                    ? ((indicadores.reduce((sum, i) => sum + Number(i.valor_actual), 0) / indicadores.reduce((sum, i) => sum + Number(i.meta), 0)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Evolução por Trimestre */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução por Trimestre</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.byTrimestre}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trimestre" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name === 'meta' ? 'Meta' : name === 'atual' ? 'Realizado' : 'Execução (%)'
                  ]}
                />
                <Bar dataKey="meta" fill="#94A3B8" name="Meta" />
                <Bar dataKey="atual" fill="#3B82F6" name="Realizado" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Status dos Indicadores */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Indicadores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top 10 Projetos por Execução */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Projetos por Execução</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.byProjeto} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={150} />
                <Tooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name === 'execucao' ? 'Execução (%)' : name === 'meta' ? 'Meta' : 'Realizado'
                  ]}
                />
                <Bar dataKey="execucao" fill="#10B981" name="Execução (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Lista de Indicadores */}
        {indicadores.length === 0 ? (
          <EmptyState
            title="Nenhum indicador encontrado"
            description="Não existem indicadores que correspondam aos critérios de pesquisa."
            action={
              canCreate() ? {
                label: "Criar Primeiro Indicador",
                onClick: () => openModal('create')
              } : undefined
            }
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Indicadores</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indicador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projeto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trimestre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Realizado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Execução
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {indicadores.map((indicador) => {
                    const projeto = projetos.find(p => p.id === indicador.projeto_id);
                    const progress = calculateProgress(indicador.valor_actual, indicador.meta);
                    const status = getProgressStatus(progress);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={indicador.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {indicador.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {indicador.unidade}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {projeto?.nome || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="info">
                            {indicador.periodo_referencia}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {indicador.meta.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {indicador.valor_actual.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 mr-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressColor(progress)}`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">{status.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('view', indicador)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEdit() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('edit', indicador)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(indicador)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal será implementado em componente separado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {modalType === 'create' && 'Criar Novo Indicador'}
              {modalType === 'edit' && 'Editar Indicador'}
              {modalType === 'view' && 'Detalhes do Indicador'}
            </h2>
            
            {selectedIndicador && modalType === 'view' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedIndicador.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidade</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedIndicador.unidade}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedIndicador.meta.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor Actual</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedIndicador.valor_actual.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fonte de Dados</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedIndicador.fonte_dados}</p>
                </div>
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

export default Indicadores;
