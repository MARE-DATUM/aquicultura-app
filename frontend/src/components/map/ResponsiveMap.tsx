import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { Card } from '../ui/Card';
import MapControls from './MapControls';
import useResponsiveMap from '../../hooks/useResponsiveMap';
import useFullscreen from '../../hooks/useFullscreen';
import { MapPin, Eye, Filter } from 'lucide-react';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils';
import { ProjetoFilters } from '../../types/simple';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import provinciasGeoData from '../../data/provincias-geo-accurate.json';

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
  data_inicio_prevista: string;
  data_fim_prevista: string;
  data_inicio?: string;
  data_fim?: string;
}

interface ResponsiveMapProps {
  onProvinciaClick?: (provincia: any) => void;
  filtros?: ProjetoFilters;
  showRoads?: boolean;
  className?: string;
  showControls?: boolean;
  showLegend?: boolean;
}

const ResponsiveMap: React.FC<ResponsiveMapProps> = ({
  onProvinciaClick,
  filtros = {},
  showRoads = false,
  className = '',
  showControls = true,
  showLegend = true
}) => {
  const [projetos, setProjetos] = useState<ProjetoMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [canZoomIn, setCanZoomIn] = useState(true);
  const [canZoomOut, setCanZoomOut] = useState(true);
  
  const mapRef = useRef<L.Map>(null);
  const { config, getMarkerRadius, getMarkerColor, getResponsivePadding } = useResponsiveMap();
  const { isFullscreen, toggleFullscreen } = useFullscreen({
    onEnter: () => {
      // Hide sidebar and header when entering fullscreen
      document.body.classList.add('map-fullscreen');
    },
    onExit: () => {
      // Show sidebar and header when exiting fullscreen
      document.body.classList.remove('map-fullscreen');
    }
  });

  // Load projects data
  useEffect(() => {
    const loadProjetos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const projetosData = await apiService.getProjetos(filtros);
        setProjetos(projetosData);
      } catch (err) {
        console.error('Erro ao carregar projetos:', err);
        setError('Erro ao carregar dados dos projetos');
      } finally {
        setLoading(false);
      }
    };

    loadProjetos();
  }, [filtros]);

  // Get province statistics
  const getProvinciaStats = useCallback((provinciaId: number) => {
    const provinciaProjetos = projetos.filter(p => p.provincia_id === provinciaId);
    const projetosAtivos = provinciaProjetos.filter(p => p.estado === 'EM_EXECUCAO').length;
    const totalProjetos = provinciaProjetos.length;
    const valorTotal = provinciaProjetos.reduce((sum, p) => sum + (p.orcamento_previsto_kz || 0), 0);

    return {
      total_projetos: totalProjetos,
      projetos_ativos: projetosAtivos,
      valor_total: valorTotal
    };
  }, [projetos]);

  // Map event handlers
  const handleMapCreated = useCallback((map: L.Map) => {
    setMapInstance(map);
    mapRef.current = map;
    
    // Update zoom constraints
    map.on('zoomend', () => {
      const currentZoom = map.getZoom();
      setZoomLevel(currentZoom);
      setCanZoomIn(currentZoom < map.getMaxZoom());
      setCanZoomOut(currentZoom > map.getMinZoom());
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  }, [mapInstance]);

  const handleZoomOut = useCallback(() => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  }, [mapInstance]);

  const handleResetView = useCallback(() => {
    if (mapInstance) {
      mapInstance.setView([-12.5, 18.5], config.zoomLevel);
    }
  }, [mapInstance, config.zoomLevel]);

  const handleToggleFullscreen = useCallback(() => {
    const mapContainer = document.querySelector('.leaflet-container');
    if (mapContainer) {
      toggleFullscreen(mapContainer as HTMLElement);
    }
  }, [toggleFullscreen]);

  const handleProvinciaClick = useCallback((provincia: any) => {
    if (onProvinciaClick) {
      onProvinciaClick(provincia);
    }
  }, [onProvinciaClick]);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center" style={{ height: config.height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center" style={{ height: config.height }}>
          <div className="text-center text-red-600">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Erro ao carregar mapa</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-0 overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Map Container */}
      <div 
        className="relative w-full"
        style={{ height: isFullscreen ? '100vh' : config.height }}
      >
        <MapContainer
          center={[-12.5, 18.5]} // Centro de Angola
          zoom={config.zoomLevel}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false} // We'll use custom controls
          whenReady={() => {
            // Map is ready, but we need to get the map instance differently
            // The handleMapCreated will be called via useMap hook
          }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marcadores para cada província */}
          {provinciasGeoData.features.map((feature: any) => {
            const stat = getProvinciaStats(feature.properties.id);
            const coords = feature.geometry.coordinates;
            const position: [number, number] = [coords[1], coords[0]]; // Leaflet usa [lat, lng]
            
            if (!stat) return null;
            
            // Calcular tamanho do marcador baseado no número de projetos
            const radius = getMarkerRadius(stat.total_projetos);
            
            // Cor baseada no número de projetos ativos
            const color = getMarkerColor(stat.projetos_ativos);
            
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
                  click: () => handleProvinciaClick({
                    id: feature.properties.id,
                    nome: feature.properties.nome,
                    ...stat
                  })
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{feature.properties.nome}</div>
                    <div className="text-sm text-gray-600">
                      {stat.total_projetos} projeto{stat.total_projetos !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.projetos_ativos} ativo{stat.projetos_ativos !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(stat.valor_total)}
                    </div>
                  </div>
                </Tooltip>
                
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.properties.nome}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de Projetos:</span>
                        <span className="font-medium">{stat.total_projetos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Projetos Ativos:</span>
                        <span className="font-medium text-green-600">{stat.projetos_ativos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investimento Total:</span>
                        <span className="font-medium text-green-600">{formatCurrency(stat.valor_total)}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Custom Controls */}
        {showControls && (
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            canZoomIn={canZoomIn}
            canZoomOut={canZoomOut}
          />
        )}

        {/* Legend */}
        {showLegend && !isFullscreen && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Legenda</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Sem projetos ativos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>1-2 projetos ativos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>3-5 projetos ativos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>6+ projetos ativos</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResponsiveMap;
