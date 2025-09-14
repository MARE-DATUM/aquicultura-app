import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button } from './ui';
import ResponsiveMap from './map/ResponsiveMap';
import ResponsiveContainer from './ui/ResponsiveContainer';
import { MapPin, Eye, Filter } from 'lucide-react';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils';
import { ProjetoFilters } from '../types/simple';
import useResponsiveMap from '../hooks/useResponsiveMap';

interface ProjetoMapa {
  id: number;
  nome: string;
  provincia_id: number;
  tipo: string;
  estado: string;
  orcamento_previsto_kz: number;
  orcamento_executado_kz: number;
  provincia: {
    id: number;
    nome: string;
  };
}

interface ProvinciaStats {
  provincia_id: number;
  nome: string;
  total_projetos: number;
  projetos_ativos: number;
  orcamento_total: number;
  orcamento_executado: number;
}

interface MapaProvinciasResponsivoProps {
  onProvinciaClick?: (provincia: ProvinciaStats & { projetos: ProjetoMapa[] }) => void;
  filtros?: ProjetoFilters;
  showRoads?: boolean;
  showDetailedPopups?: boolean;
}

const MapaProvinciasResponsivo: React.FC<MapaProvinciasResponsivoProps> = ({ 
  onProvinciaClick, 
  filtros = {},
  showRoads = false,
  showDetailedPopups = true
}) => {
  const [projetos, setProjetos] = useState<ProjetoMapa[]>([]);
  const [stats, setStats] = useState<ProvinciaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvincia, setSelectedProvincia] = useState<ProvinciaStats | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { config } = useResponsiveMap();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projetosResponse, mapaResponse] = await Promise.all([
        apiService.getProjetos(filtros),
        apiService.getMapaProvincias()
      ]);
      
      setProjetos(projetosResponse as ProjetoMapa[]);
      
      // Converter dados da API para o formato esperado
      const statsFormatted: ProvinciaStats[] = mapaResponse.map(provincia => ({
        provincia_id: provincia.id,
        nome: provincia.nome,
        total_projetos: provincia.total_projetos,
        projetos_ativos: provincia.total_projetos, // Assumir que todos projetos são ativos por enquanto
        orcamento_total: provincia.orcamento_total_kz,
        orcamento_executado: provincia.orcamento_executado_kz
      }));
      
      setStats(statsFormatted);
    } catch (err) {
      setError('Erro ao carregar dados do mapa');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const getProvinciaStats = useCallback((provinciaId: number) => {
    return stats.find(stat => stat.provincia_id === provinciaId);
  }, [stats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProvinciaClick = useCallback((provincia: any) => {
    const provinciaStats = getProvinciaStats(provincia.id);
    if (provinciaStats) {
      setSelectedProvincia(provinciaStats);
      if (onProvinciaClick) {
        const provinciaProjetos = projetos.filter(p => p.provincia_id === provincia.id);
        onProvinciaClick({
          ...provinciaStats,
          projetos: provinciaProjetos
        });
      }
    }
  }, [onProvinciaClick, projetos, getProvinciaStats]);

  const clearSelection = () => {
    setSelectedProvincia(null);
  };

  const exportMapData = () => {
    const data = {
      provincias: stats.map(stat => ({
        id: stat.provincia_id,
        nome: stat.nome,
        ...stat
      })),
      exportado_em: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mapa-provincias-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <ResponsiveContainer height={config.height} variant="card" padding="lg">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error) {
    return (
      <ResponsiveContainer height={config.height} variant="card" padding="lg">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Erro ao carregar mapa</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros e ações */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mapa das Províncias</h2>
            <p className="text-sm text-gray-600">Visualização geográfica dos projetos de aquicultura</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
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
              <Eye className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Projeto
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="concluido">Concluído</option>
                  <option value="pausado">Pausado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Projeto
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Todos os tipos</option>
                  <option value="piscicultura">Piscicultura</option>
                  <option value="maricultura">Maricultura</option>
                  <option value="aquicultura">Aquicultura</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orçamento Mínimo (Kz)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Mapa Responsivo */}
      <ResponsiveMap
        onProvinciaClick={handleProvinciaClick}
        filtros={filtros}
        showRoads={showRoads}
        showControls={true}
        showLegend={true}
        className="w-full"
      />

      {/* Informações da província selecionada */}
      {selectedProvincia && (
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedProvincia.nome}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total de Projetos:</span>
                  <div className="font-semibold text-gray-900">{selectedProvincia.total_projetos}</div>
                </div>
                <div>
                  <span className="text-gray-600">Projetos Ativos:</span>
                  <div className="font-semibold text-green-600">{selectedProvincia.projetos_ativos}</div>
                </div>
                <div>
                  <span className="text-gray-600">Orçamento Total:</span>
                  <div className="font-semibold text-green-600">{formatCurrency(selectedProvincia.orcamento_total)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Orçamento Executado:</span>
                  <div className="font-semibold text-blue-600">{formatCurrency(selectedProvincia.orcamento_executado)}</div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              Fechar
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MapaProvinciasResponsivo;
