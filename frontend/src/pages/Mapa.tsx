import React, { useState } from 'react';
import { Card, Button, Input, Badge, PageHeader } from '../components/ui';
import { Search, Filter, Download, MapPin, Eye } from 'lucide-react';
import MapaProvincias from '../components/MapaProvincias';
import { usePermissions } from '../hooks/usePermissions';
import { ProjetoFilters } from '../types/simple';

interface FiltrosMapa extends ProjetoFilters {
  search: string;
}

const Mapa: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosMapa>({
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProvincia, setSelectedProvincia] = useState<any>(null);
  const { canView } = usePermissions();

  const handleFilterChange = (key: keyof FiltrosMapa, value: string) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFiltros({
      search: ''
    });
  };

  const handleProvinciaClick = (provincia: any) => {
    setSelectedProvincia(provincia);
  };

  const exportMapData = () => {
    // Implementar exportação de dados do mapa
    console.log('Exportar dados do mapa');
  };

  if (!canView) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="text-center text-gray-600">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Acesso Negado</h3>
            <p>Não tem permissões para visualizar o mapa.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Mapa das Províncias"
        description="Visualização geográfica dos projetos de aquicultura em Angola"
      />

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
              onClick={exportMapData}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesquisar
              </label>
              <Input
                placeholder="Pesquisar província..."
                value={filtros.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Projeto
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtros.tipo || ''}
                onChange={(e) => handleFilterChange('tipo', e.target.value as any)}
              >
                <option value="">Todos os tipos</option>
                <option value="COMUNITARIO">Comunitário</option>
                <option value="EMPRESARIAL">Empresarial</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtros.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value as any)}
              >
                <option value="">Todos os estados</option>
                <option value="PLANEADO">Planeado</option>
                <option value="EM_EXECUCAO">Em Execução</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="SUSPENSO">Suspenso</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonte de Financiamento
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtros.fonte_financiamento || ''}
                onChange={(e) => handleFilterChange('fonte_financiamento', e.target.value as any)}
              >
                <option value="">Todas as fontes</option>
                <option value="AFAP-2">AFAP-2</option>
                <option value="FADEPA">FADEPA</option>
                <option value="FACRA">FACRA</option>
                <option value="PRIVADO">Privado</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={clearFilters}>
            Limpar
          </Button>
          <Button onClick={() => setShowFilters(false)}>
            Aplicar Filtros
          </Button>
        </div>
      </Card>

      {/* Mapa */}
      <MapaProvincias
        onProvinciaClick={handleProvinciaClick}
        filtros={filtros}
      />

      {/* Detalhes da Província Selecionada */}
      {selectedProvincia && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Detalhes - {selectedProvincia.nome}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProvincia(null)}
            >
              Fechar
            </Button>
          </div>

          {selectedProvincia.stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {selectedProvincia.stats.total_projetos}
                </p>
                <p className="text-sm text-gray-600">Total de Projetos</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {selectedProvincia.stats.projetos_ativos}
                </p>
                <p className="text-sm text-gray-600">Projetos Ativos</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {selectedProvincia.stats.orcamento_total.toLocaleString('pt-AO')} Kz
                </p>
                <p className="text-sm text-gray-600">Orçamento Total</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {selectedProvincia.stats.orcamento_executado.toLocaleString('pt-AO')} Kz
                </p>
                <p className="text-sm text-gray-600">Orçamento Executado</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Eye className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum projeto encontrado nesta província</p>
            </div>
          )}

          {/* Lista de Projetos da Província */}
          {selectedProvincia.projetos && selectedProvincia.projetos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">Projetos na Província</h4>
              <div className="space-y-2">
                {selectedProvincia.projetos.map((projeto: any) => (
                  <div key={projeto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{projeto.nome}</p>
                      <p className="text-sm text-gray-600">
                        {projeto.tipo} • {projeto.estado}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        {projeto.orcamento_previsto_kz.toLocaleString('pt-AO')} Kz
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Mapa;
