import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FolderOpen, 
  BarChart3, 
  FileText, 
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  Download,
  Database
} from 'lucide-react';
import { apiService } from '../services/api';
import type { DashboardStats, MapaProvincia } from '../types/simple';
import { PageHeader, SkeletonCard, Button, Card } from '../components/ui';
import { AdminExport } from '../components/AdminExport';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mapaData, setMapaData] = useState<MapaProvincia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const [statsData, mapaData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getMapaProvincias()
      ]);
      setStats(statsData);
      setMapaData(mapaData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Dashboard Nacional de Aquicultura"
          description="Monitorização em tempo real dos 21 projectos estratégicos de aquicultura em Angola"
          breadcrumbs={[
            { label: 'Dashboard', current: true }
          ]}
        />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <PageHeader
          title="Dashboard Nacional de Aquicultura"
          description="Monitorização em tempo real dos 21 projectos estratégicos de aquicultura em Angola"
          breadcrumbs={[
            { label: 'Dashboard', current: true }
          ]}
          actions={
            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          }
        />
        <div className="p-6">
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Erro ao carregar dados do dashboard</p>
              <p className="text-gray-500 text-sm mt-2">Tente recarregar os dados</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Dados para gráficos - com verificação defensiva
  const projetosPorEstado = Object.entries(stats.projetos.projetos_por_estado || {}).map(([estado, count]) => ({
    estado: estado.replace('_', ' ').toUpperCase(),
    count
  }));

  const projetosPorFonte = Object.entries(stats.projetos.projetos_por_fonte || {}).map(([fonte, count]) => ({
    fonte,
    count
  }));

  const indicadoresPorTrimestre = Object.entries(stats.indicadores.por_trimestre || {}).map(([trimestre, count]) => ({
    trimestre,
    count
  }));

  const licenciamentosPorStatus = Object.entries(stats.licenciamentos.por_status || {}).map(([status, count]) => ({
    status: status.replace('_', ' ').toUpperCase(),
    count
  }));

  const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
  }> = ({ title, value, icon, color, subtitle, trend, trendValue }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2.5 rounded-lg ${color} group-hover:scale-105 transition-transform duration-200`}>
                {icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                {trend && trendValue && (
                  <div className={`flex items-center space-x-1 mt-1 text-xs font-medium ${
                    trend === 'up' ? 'text-green-600' :
                    trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> :
                     trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> :
                     <Activity className="h-3 w-3" />}
                    <span>{trendValue}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Dashboard Nacional de Aquicultura"
        description="Monitorização em tempo real dos 21 projectos estratégicos de aquicultura em Angola"
        breadcrumbs={[
          { label: 'Dashboard', current: true }
        ]}
        actions={
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Atualizado: {new Date().toLocaleDateString('pt-AO')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>18 Províncias</span>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            {user?.role === 'ROOT' && (
              <Button 
                variant="primary" 
                onClick={() => setShowExport(!showExport)}
              >
                <Database className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
            )}
          </div>
        }
      />
      
      <div className="p-6 space-y-8">

      {/* Seção de Exportação (apenas para ROOT) */}
      {showExport && user?.role === 'ROOT' && (
        <div className="mb-8">
          <AdminExport />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Projetos"
          value={stats.resumo.total_projetos}
          icon={<FolderOpen className="h-6 w-6 text-white" />}
          color="bg-blue-600"
          trend="neutral"
          trendValue={`${stats.resumo.projetos_ativos} ativos`}
        />
        <StatCard
          title="Indicadores Monitorizados"
          value={stats.resumo.total_indicadores}
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          color="bg-green-600"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Execução Orçamental"
          value={`${stats.kpis_18_meses.execucao_orcamental_percentual}%`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-yellow-600"
          subtitle="Média nacional"
          trend="up"
          trendValue="+5.2%"
        />
        <StatCard
          title="Licenciamentos"
          value={stats.licenciamentos.total_licenciamentos}
          icon={<FileText className="h-6 w-6 text-white" />}
          color="bg-purple-600"
          trend="neutral"
          trendValue={`${stats.licenciamentos.por_status.APROVADO || 0} aprovados`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Projetos por Estado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Projetos por Estado</h3>
              <p className="text-sm text-gray-600">Distribuição dos projetos por fase de execução</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={projetosPorEstado} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="estado" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Projetos por Fonte de Financiamento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Fontes de Financiamento</h3>
              <p className="text-sm text-gray-600">Origem dos recursos dos projetos</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={projetosPorFonte}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ fonte, count, percent }) => `${fonte}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {projetosPorFonte.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Indicadores por Trimestre */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Evolução Trimestral</h3>
              <p className="text-sm text-gray-600">Indicadores reportados por trimestre</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={indicadoresPorTrimestre} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="trimestre" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#059669', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Licenciamentos por Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status dos Licenciamentos</h3>
              <p className="text-sm text-gray-600">Situação atual dos processos</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={licenciamentosPorStatus} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="status" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mapa das Províncias - Resumo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Distribuição Provincial</h3>
            <p className="text-sm text-gray-600">Projetos de aquicultura por província angolana</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {mapaData.map((provincia) => (
            <div key={provincia.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300 group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{provincia.nome}</h4>
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      provincia.cor === 'green' ? 'bg-green-500' :
                      provincia.cor === 'blue' ? 'bg-blue-600' :
                      provincia.cor === 'red' ? 'bg-red-500' :
                      provincia.cor === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}
                  />
                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Projetos:</span>
                  <span className="font-medium text-gray-900">{provincia.total_projetos}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Execução:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          provincia.execucao_percentual >= 80 ? 'bg-green-500' :
                          provincia.execucao_percentual >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(provincia.execucao_percentual, 100)}%` }}
                      />
                    </div>
                    <span className="font-medium text-gray-900 text-xs">{provincia.execucao_percentual}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Orçamento:</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {(provincia.orcamento_total_kz / 1000000).toFixed(1)}M Kz
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
};

export default Dashboard;
