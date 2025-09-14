import React, { useState } from 'react';
import { Button, Input, Select, Card } from './ui';
import { Filter, Search, X, RefreshCw } from 'lucide-react';
import type { Projeto, Periodo5W2H } from '../types/simple';

interface FiltrosEixosProps {
  projetos: Projeto[];
  filtroProjeto: number | '';
  filtroPeriodo: Periodo5W2H | '';
  searchTerm: string;
  onFiltroProjetoChange: (value: number | '') => void;
  onFiltroPeriodoChange: (value: Periodo5W2H | '') => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  loading?: boolean;
  totalResults?: number;
}

const FiltrosEixos: React.FC<FiltrosEixosProps> = ({
  projetos,
  filtroProjeto,
  filtroPeriodo,
  searchTerm,
  onFiltroProjetoChange,
  onFiltroPeriodoChange,
  onSearchChange,
  onClearFilters,
  onApplyFilters,
  loading = false,
  totalResults = 0
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const periodos: { value: Periodo5W2H; label: string }[] = [
    { value: '0-6', label: '0-6 meses' },
    { value: '7-12', label: '7-12 meses' },
    { value: '13-18', label: '13-18 meses' }
  ];

  const hasActiveFilters = filtroProjeto !== '' || filtroPeriodo !== '' || searchTerm !== '';

  const handleClearFilters = () => {
    onClearFilters();
    setMostrarFiltros(false);
  };

  const handleApplyFilters = () => {
    onApplyFilters();
    setMostrarFiltros(false);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Pesquisa e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Pesquisa */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar eixos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={hasActiveFilters ? 'border-blue-300 bg-blue-50' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {[filtroProjeto, filtroPeriodo, searchTerm].filter(Boolean).length}
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}

          <Button
            onClick={handleApplyFilters}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Aplicar
          </Button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {mostrarFiltros && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por Projeto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projeto
              </label>
              <Select
                value={filtroProjeto}
                onChange={(e) => onFiltroProjetoChange(e.target.value ? parseInt(e.target.value) : '')}
                options={[
                  { value: '', label: 'Todos os projetos' },
                  ...projetos.map(projeto => ({
                    value: projeto.id,
                    label: projeto.nome
                  }))
                ]}
              />
            </div>

            {/* Filtro por Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <Select
                value={filtroPeriodo}
                onChange={(e) => onFiltroPeriodoChange((e.target.value as Periodo5W2H) || '')}
                options={[
                  { value: '', label: 'Todos os períodos' },
                  ...periodos
                ]}
              />
            </div>
          </div>

          {/* Resumo dos Filtros Ativos */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700">Filtros ativos:</span>
                  
                  {filtroProjeto !== '' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Projeto: {projetos.find(p => p.id === filtroProjeto)?.nome || 'N/A'}
                      <button
                        onClick={() => onFiltroProjetoChange('')}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  
                  {filtroPeriodo !== '' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Período: {periodos.find(p => p.value === filtroPeriodo)?.label || 'N/A'}
                      <button
                        onClick={() => onFiltroPeriodoChange('')}
                        className="ml-1 hover:text-green-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  
                  {searchTerm !== '' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      Pesquisa: "{searchTerm}"
                      <button
                        onClick={() => onSearchChange('')}
                        className="ml-1 hover:text-purple-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {totalResults > 0 ? (
            <span>
              {totalResults} {totalResults === 1 ? 'eixo encontrado' : 'eixos encontrados'}
            </span>
          ) : (
            <span>Nenhum eixo encontrado</span>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="text-blue-600">
            Filtros aplicados
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltrosEixos;
