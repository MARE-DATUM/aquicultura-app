import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { Card, Button } from './ui';
import ResponsiveMap from './map/ResponsiveMap';
import ResponsiveContainer from './ui/ResponsiveContainer';
import { MapPin, Eye, Filter } from 'lucide-react';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils';
import { ProjetoFilters } from '../types/simple';
import useResponsiveMap from '../hooks/useResponsiveMap';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import provinciasGeoData from '../data/provincias-geo-accurate.json';

// Fix para ícones do Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
const leafletIconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `${leafletIconUrl}/marker-icon-2x.png`,
  iconUrl: `${leafletIconUrl}/marker-icon.png`,
  shadowUrl: `${leafletIconUrl}/marker-shadow.png`,
});

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

interface MapaProvinciasProps {
  onProvinciaClick?: (provincia: ProvinciaStats & { projetos: ProjetoMapa[] }) => void;
  filtros?: ProjetoFilters;
  showRoads?: boolean;
  showDetailedPopups?: boolean;
}

const MapaProvincias: React.FC<MapaProvinciasProps> = ({ 
  onProvinciaClick, 
  filtros = {},
  showRoads = false,
  showDetailedPopups = true
}) => {
  const [projetos, setProjetos] = useState<ProjetoMapa[]>([]);
  const [stats, setStats] = useState<ProvinciaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projetosResponse, mapaResponse] = await Promise.all([
        apiService.getProjetos(filtros),
        apiService.getMapaProvincias() // ✅ Usar API correta do mapa
      ]);
      
      setProjetos(projetosResponse as ProjetoMapa[]);
      
      // ✅ Converter dados da API para o formato esperado
      const statsFormatted: ProvinciaStats[] = mapaResponse.map(provincia => ({
        provincia_id: provincia.id,
        nome: provincia.nome,
        total_projetos: provincia.total_projetos,
        projetos_ativos: provincia.total_projetos, // Assumir que todos projetos são ativos por enquanto
        orcamento_total: provincia.orcamento_total_kz,
        orcamento_executado: provincia.orcamento_executado_kz
      }));
      
      setStats(statsFormatted); // ✅ Usar dados reais em vez de array vazio
    } catch (err) {
      setError('Erro ao carregar dados do mapa');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const getProvinciaStats = (provinciaId: number) => {
    return stats.find(stat => stat.provincia_id === provinciaId);
  };

  useEffect(() => {
    loadData();
  }, [filtros, loadData]);

  const getProvinciaColor = (provinciaId: number) => {
    const stat = getProvinciaStats(provinciaId);
    if (!stat) return '#e5e7eb'; // cinza padrão
    
    const projetosAtivos = stat.projetos_ativos;
    if (projetosAtivos === 0) return '#e5e7eb'; // cinza - sem projetos
    if (projetosAtivos <= 2) return '#fef3c7'; // amarelo - poucos projetos
    if (projetosAtivos <= 5) return '#dbeafe'; // azul - projetos moderados
    return '#dcfce7'; // verde - muitos projetos
  };

  const getProvinciaBorderColor = (provinciaId: number) => {
    const stat = getProvinciaStats(provinciaId);
    if (!stat) return '#9ca3af';
    
    const projetosAtivos = stat.projetos_ativos;
    if (projetosAtivos === 0) return '#9ca3af';
    if (projetosAtivos <= 2) return '#f59e0b';
    if (projetosAtivos <= 5) return '#3b82f6';
    return '#22c55e';
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: any) => {
    const provinciaId = feature.properties.id;
    const stat = getProvinciaStats(provinciaId);
    const projetosProvincia = projetos.filter(p => p.provincia_id === provinciaId);

    // Estilo da província
    layer.setStyle({
      fillColor: getProvinciaColor(provinciaId),
      weight: 2,
      opacity: 1,
      color: getProvinciaBorderColor(provinciaId),
      dashArray: '3',
      fillOpacity: 0.7
    });

    // Evento de hover
    layer.on('mouseover', function () {
      layer.setStyle({
        weight: 3,
        dashArray: '',
        fillOpacity: 0.9
      });
    });

    layer.on('mouseout', function () {
      layer.setStyle({
        weight: 2,
        dashArray: '3',
        fillOpacity: 0.7
      });
    });

    // Evento de clique
    layer.on('click', function () {
      if (onProvinciaClick) {
        const provinciaStats = stat || {
          provincia_id: feature.properties.id,
          nome: feature.properties.nome,
          total_projetos: projetosProvincia.length,
          projetos_ativos: projetosProvincia.filter(p => p.estado === 'EM_EXECUCAO').length,
          orcamento_total: projetosProvincia.reduce((acc, p) => acc + p.orcamento_previsto_kz, 0),
          orcamento_executado: projetosProvincia.reduce((acc, p) => acc + p.orcamento_executado_kz, 0)
        };
        
        onProvinciaClick({
          ...provinciaStats,
          projetos: projetosProvincia
        });
      }
    });

    // Tooltip
    const tooltipContent = `
      <div class="p-2">
        <h3 class="font-bold text-sm">${feature.properties.nome}</h3>
        <p class="text-xs text-gray-600">
          ${stat ? `${stat.total_projetos} projetos` : 'Sem dados'}
        </p>
      </div>
    `;
    layer.bindTooltip(tooltipContent);

    // Popup melhorado com informações detalhadas
    const execucaoPercentual = stat && stat.orcamento_total > 0 
      ? (stat.orcamento_executado / stat.orcamento_total * 100).toFixed(1) 
      : '0';
    
    const statusCor = stat && stat.total_projetos > 0 
      ? (stat.projetos_ativos > 2 ? 'green' : stat.projetos_ativos > 0 ? 'yellow' : 'gray') 
      : 'gray';
    
    const popupContent = showDetailedPopups && stat ? `
      <div class="p-4 min-w-[280px] max-w-[400px]">
        <div class="border-b pb-2 mb-3">
          <h3 class="font-bold text-lg text-blue-800">${feature.properties.nome}</h3>
          <p class="text-sm text-gray-600">Província de Angola</p>
        </div>
        
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="text-center p-2 bg-blue-50 rounded">
            <div class="text-xl font-bold text-blue-600">${stat.total_projetos}</div>
            <div class="text-xs text-gray-600">Total Projetos</div>
          </div>
          <div class="text-center p-2 bg-green-50 rounded">
            <div class="text-xl font-bold text-green-600">${stat.projetos_ativos}</div>
            <div class="text-xs text-gray-600">Ativos</div>
          </div>
        </div>
        
        <div class="space-y-2 mb-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Orçamento Total:</span>
            <span class="font-medium text-blue-600">${formatCurrency(stat.orcamento_total)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Executado:</span>
            <span class="font-medium text-green-600">${formatCurrency(stat.orcamento_executado)}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-${statusCor}-500 h-2 rounded-full" style="width: ${execucaoPercentual}%"></div>
          </div>
          <div class="text-center text-sm text-gray-600">${execucaoPercentual}% executado</div>
        </div>
        
        ${projetosProvincia.length > 0 ? `
          <div class="border-t pt-2">
            <p class="text-sm font-medium mb-1">Projetos:</p>
            <div class="max-h-20 overflow-y-auto">
              ${projetosProvincia.slice(0, 3).map(p => `
                <div class="text-xs p-1 bg-gray-50 rounded mb-1">
                  <span class="font-medium">${p.nome}</span>
                  <span class="text-gray-500">(${p.tipo})</span>
                </div>
              `).join('')}
              ${projetosProvincia.length > 3 ? `<div class="text-xs text-gray-500">+${projetosProvincia.length - 3} mais...</div>` : ''}
            </div>
          </div>
        ` : ''}
        
        <div class="text-xs text-gray-400 mt-2 pt-2 border-t">
          💡 Clique na província para ver detalhes completos
        </div>
      </div>
    ` : `
      <div class="p-3 min-w-[200px]">
        <h3 class="font-bold text-lg mb-2">${feature.properties.nome}</h3>
        ${stat ? `
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Total de Projetos:</span>
              <span class="font-medium">${stat.total_projetos}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Projetos Ativos:</span>
              <span class="font-medium text-green-600">${stat.projetos_ativos}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Orçamento Total:</span>
              <span class="font-medium">${formatCurrency(stat.orcamento_total)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Executado:</span>
              <span class="font-medium">${formatCurrency(stat.orcamento_executado)}</span>
            </div>
          </div>
        ` : '<p class="text-sm text-gray-500">Sem dados disponíveis</p>'}
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <MapPin className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
          <Button 
            onClick={loadData}
            className="mt-4"
          >
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legenda */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-3">Legenda</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-sm">Sem projetos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <span className="text-sm">1-2 projetos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <span className="text-sm">3-5 projetos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span className="text-sm">6+ projetos</span>
          </div>
        </div>
      </Card>

      {/* Mapa */}
      <Card className="p-4">
        <div className="h-96 w-full">
          <MapContainer
            center={[-12.5, 18.5]} // Centro de Angola
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Marcadores com coordenadas precisas para cada província */}
            {provinciasGeoData.features.map((feature: any) => {
              const stat = getProvinciaStats(feature.properties.id);
              const coords = feature.geometry.coordinates;
              const position: [number, number] = [coords[1], coords[0]]; // Leaflet usa [lat, lng]
              
              if (!stat) return null;
              
              // Calcular tamanho do marcador baseado no número de projetos
              const radius = Math.max(8, Math.min(20, 8 + stat.total_projetos * 2));
              
              // Cor baseada no número de projetos ativos
              const color = stat.projetos_ativos === 0 ? '#9ca3af' :
                           stat.projetos_ativos <= 2 ? '#f59e0b' :
                           stat.projetos_ativos <= 5 ? '#3b82f6' : '#22c55e';
              
              return (
                <CircleMarker
                  key={feature.properties.id}
                  center={position}
                  radius={radius}
                  pathOptions={{
                    fillColor: color,
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                  }}
                  eventHandlers={{
                    click: () => {
                      if (onProvinciaClick) {
                        const projetosProvincia = projetos.filter(p => p.provincia_id === feature.properties.id);
                        onProvinciaClick({
                          ...stat,
                          projetos: projetosProvincia
                        });
                      }
                    }
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                    <div>
                      <strong>{feature.properties.nome}</strong>
                      <br />
                      Capital: {feature.properties.capital}
                      <br />
                      Projetos: {stat.total_projetos}
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-lg mb-2">{feature.properties.nome}</h3>
                      <p className="text-sm text-gray-600 mb-3">Capital: {feature.properties.capital}</p>
                      
                      <div className="space-y-2 border-t pt-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total de Projetos:</span>
                          <span className="text-sm font-semibold">{stat.total_projetos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Projetos Ativos:</span>
                          <span className="text-sm font-semibold text-green-600">{stat.projetos_ativos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Orçamento Total:</span>
                          <span className="text-sm font-semibold">{formatCurrency(stat.orcamento_total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Executado:</span>
                          <span className="text-sm font-semibold">{formatCurrency(stat.orcamento_executado)}</span>
                        </div>
                        
                        {stat.orcamento_total > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Execução</span>
                              <span>{((stat.orcamento_executado / stat.orcamento_total) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(100, (stat.orcamento_executado / stat.orcamento_total) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {feature.properties.area_km2 && (
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-xs text-gray-500">Área:</span>
                            <span className="text-xs">{feature.properties.area_km2.toLocaleString()} km²</span>
                          </div>
                        )}
                        {feature.properties.populacao && (
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">População:</span>
                            <span className="text-xs">{feature.properties.populacao.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </Card>

      {/* Estatísticas Resumidas */}
      {stats.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Províncias</p>
                  <p className="text-2xl font-bold">{stats.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Com Projetos</p>
                  <p className="text-2xl font-bold">
                    {stats.filter(s => s.total_projetos > 0).length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Projetos Ativos</p>
                  <p className="text-2xl font-bold">
                    {stats.reduce((acc, s) => acc + s.projetos_ativos, 0)}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Orçamento Total</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.reduce((acc, s) => acc + s.orcamento_total, 0))}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Informações do Sistema de Cadastro Nacional */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <MapPin className="h-6 w-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Sistema Nacional de Cadastro de Angola
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="font-medium text-blue-700">450.000+</p>
                    <p className="text-gray-600">Parcelas urbanas mapeadas</p>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="font-medium text-green-700">6.200 km²</p>
                    <p className="text-gray-600">Imagery de alta resolução (&lt;5cm)</p>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="font-medium text-purple-700">18 províncias</p>
                    <p className="text-gray-600">Sistema implantado</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Fonte: Sistema Nacional de Cadastro implementado pela Mitrelli (2022)
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapaProvincias;
