import React from 'react';
import { Button } from '../ui/Button';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Navigation
} from 'lucide-react';
import useResponsiveMap from '../../hooks/useResponsiveMap';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  className?: string;
}

const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleFullscreen,
  isFullscreen,
  canZoomIn,
  canZoomOut,
  className = ''
}) => {
  const { getControlSize, config } = useResponsiveMap();

  const controlButtonClass = `
    ${getControlSize()}
    bg-white border border-gray-300 shadow-lg
    hover:bg-gray-50 hover:border-gray-400
    active:bg-gray-100 active:scale-95
    transition-all duration-200
    flex items-center justify-center
    rounded-lg
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:hover:bg-white disabled:hover:border-gray-300
  `;

  const iconClass = config.isMobile ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className={`absolute top-4 right-4 z-[1000] flex flex-col gap-2 ${className}`}>
      {/* Zoom Controls */}
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          disabled={!canZoomIn}
          className={controlButtonClass}
          title="Aumentar zoom"
          aria-label="Aumentar zoom"
        >
          <ZoomIn className={iconClass} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          disabled={!canZoomOut}
          className={controlButtonClass}
          title="Diminuir zoom"
          aria-label="Diminuir zoom"
        >
          <ZoomOut className={iconClass} />
        </Button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-300 mx-2" />

      {/* Reset View */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onResetView}
        className={controlButtonClass}
        title="Centralizar mapa"
        aria-label="Centralizar mapa"
      >
        <RotateCcw className={iconClass} />
      </Button>

      {/* Fullscreen Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleFullscreen}
        className={controlButtonClass}
        title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
        aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
      >
        {isFullscreen ? (
          <Minimize2 className={iconClass} />
        ) : (
          <Maximize2 className={iconClass} />
        )}
      </Button>

      {/* Mobile Navigation Hint */}
      {config.isMobile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2 max-w-48">
          <div className="flex items-center gap-2 text-blue-700">
            <Navigation className="h-4 w-4" />
            <span className="text-xs font-medium">
              Toque e arraste para navegar
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapControls;
