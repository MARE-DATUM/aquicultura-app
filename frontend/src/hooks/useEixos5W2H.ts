import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Eixo5W2H, Projeto, Periodo5W2H } from '../types/simple';

interface EixoFormData {
  projeto_id: number;
  what: string;
  why: string;
  where: string;
  when: string;
  who: string;
  how: string;
  how_much_kz: number;
  periodo: Periodo5W2H;
  marcos?: Array<{
    nome: string;
    data: string;
    status: 'Pendente' | 'Em Progresso' | 'Concluído';
  }>;
}

interface UseEixos5W2HReturn {
  // Estados
  eixos: Eixo5W2H[];
  projetos: Projeto[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  
  // Filtros
  filtroProjeto: number | '';
  filtroPeriodo: Periodo5W2H | '';
  searchTerm: string;
  
  // Ações
  loadData: (isRefresh?: boolean) => Promise<void>;
  createEixo: (data: EixoFormData) => Promise<void>;
  updateEixo: (id: number, data: EixoFormData) => Promise<void>;
  deleteEixo: (id: number) => Promise<void>;
  setFiltroProjeto: (value: number | '') => void;
  setFiltroPeriodo: (value: Periodo5W2H | '') => void;
  setSearchTerm: (value: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
}

export const useEixos5W2H = (): UseEixos5W2HReturn => {
  // Estados principais
  const [eixos, setEixos] = useState<Eixo5W2H[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [filtroProjeto, setFiltroProjeto] = useState<number | ''>('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<Periodo5W2H | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados
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

  // Criar eixo
  const createEixo = useCallback(async (data: EixoFormData) => {
    try {
      setError(null);
      const novoEixo = await apiService.createEixo5W2H(data);
      setEixos(prev => [novoEixo, ...prev]);
    } catch (err) {
      console.error('Erro ao criar eixo:', err);
      setError('Erro ao criar eixo. Tente novamente.');
      throw err;
    }
  }, []);

  // Atualizar eixo
  const updateEixo = useCallback(async (id: number, data: EixoFormData) => {
    try {
      setError(null);
      const eixoAtualizado = await apiService.updateEixo5W2H(id, data);
      setEixos(prev => prev.map(eixo => 
        eixo.id === id ? eixoAtualizado : eixo
      ));
    } catch (err) {
      console.error('Erro ao atualizar eixo:', err);
      setError('Erro ao atualizar eixo. Tente novamente.');
      throw err;
    }
  }, []);

  // Eliminar eixo
  const deleteEixo = useCallback(async (id: number) => {
    try {
      setError(null);
      await apiService.deleteEixo5W2H(id);
      setEixos(prev => prev.filter(eixo => eixo.id !== id));
    } catch (err) {
      console.error('Erro ao eliminar eixo:', err);
      setError('Erro ao eliminar eixo. Tente novamente.');
      throw err;
    }
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    loadData();
  }, [loadData]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFiltroProjeto('');
    setFiltroPeriodo('');
    setSearchTerm('');
  }, []);

  return {
    // Estados
    eixos,
    projetos,
    loading,
    refreshing,
    error,
    
    // Filtros
    filtroProjeto,
    filtroPeriodo,
    searchTerm,
    
    // Ações
    loadData,
    createEixo,
    updateEixo,
    deleteEixo,
    setFiltroProjeto,
    setFiltroPeriodo,
    setSearchTerm,
    clearFilters,
    applyFilters
  };
};
