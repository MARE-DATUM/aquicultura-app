import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';
import type { Indicador, Projeto, IndicadorFilters, IndicadorCreate } from '../types/simple';

// Query Keys
export const indicadoresKeys = {
  all: ['indicadores'] as const,
  lists: () => [...indicadoresKeys.all, 'list'] as const,
  list: (filters: IndicadorFilters) => [...indicadoresKeys.lists(), filters] as const,
  details: () => [...indicadoresKeys.all, 'detail'] as const,
  detail: (id: number) => [...indicadoresKeys.details(), id] as const,
};

export const projetosKeys = {
  all: ['projetos'] as const,
  lists: () => [...projetosKeys.all, 'list'] as const,
};

// Hook para buscar indicadores com filtros
export const useIndicadores = (filters: IndicadorFilters = {}) => {
  return useQuery({
    queryKey: indicadoresKeys.list(filters),
    queryFn: () => apiService.getIndicadores(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para buscar projetos
export const useProjetos = () => {
  return useQuery({
    queryKey: projetosKeys.lists(),
    queryFn: () => apiService.getProjetos(),
    staleTime: 10 * 60 * 1000, // 10 minutos (projetos mudam menos)
  });
};

// Hook para buscar um indicador específico
export const useIndicador = (id: number) => {
  return useQuery({
    queryKey: indicadoresKeys.detail(id),
    queryFn: () => apiService.getIndicador(id),
    enabled: !!id,
  });
};

// Hook para criar indicador
export const useCreateIndicador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IndicadorCreate) => apiService.createIndicador(data),
    onSuccess: (newIndicador) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: indicadoresKeys.lists() });
      queryClient.invalidateQueries({ queryKey: indicadoresKeys.details() });
      
      toast.success('Indicador criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao criar indicador';
      toast.error(message);
    },
  });
};

// Hook para atualizar indicador
export const useUpdateIndicador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IndicadorCreate> }) =>
      apiService.updateIndicador(id, data),
    onSuccess: (updatedIndicador, { id }) => {
      // Atualizar cache do indicador específico
      queryClient.setQueryData(indicadoresKeys.detail(id), updatedIndicador);
      
      // Invalidar lista de indicadores
      queryClient.invalidateQueries({ queryKey: indicadoresKeys.lists() });
      
      toast.success('Indicador atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao atualizar indicador';
      toast.error(message);
    },
  });
};

// Hook para deletar indicador
export const useDeleteIndicador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deleteIndicador(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: indicadoresKeys.detail(deletedId) });
      
      // Invalidar lista de indicadores
      queryClient.invalidateQueries({ queryKey: indicadoresKeys.lists() });
      
      toast.success('Indicador eliminado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao eliminar indicador';
      toast.error(message);
    },
  });
};

// Hook para estatísticas de indicadores
export const useIndicadoresStats = () => {
  return useQuery({
    queryKey: [...indicadoresKeys.all, 'stats'],
    queryFn: () => apiService.getIndicadoresStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar todos os indicadores (sem paginação) para cálculos de KPIs
export const useIndicadoresCompletos = () => {
  return useQuery({
    queryKey: [...indicadoresKeys.all, 'completos'],
    queryFn: () => apiService.getIndicadores({ limit: 10000 }), // Limite alto para obter todos
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
