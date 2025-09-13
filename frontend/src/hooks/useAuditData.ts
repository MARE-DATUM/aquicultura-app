import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/api';
import { AuditLog } from '../types/simple';

interface AuditStats {
  total_logs: number;
  active_users: number;
  actions_today: number;
  entities_count: number;
}

interface AuditFilters {
  search: string;
  user_id: number | null;
  action: string;
  entity_type: string;
  date_from: string;
  date_to: string;
}

interface UseAuditDataReturn {
  logs: AuditLog[];
  stats: AuditStats | null;
  loading: boolean;
  error: string | null;
  filters: AuditFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setFilters: (filters: Partial<AuditFilters>) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: AuditFilters = {
  search: '',
  user_id: null,
  action: '',
  entity_type: '',
  date_from: '',
  date_to: '',
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useAuditData = (): UseAuditDataReturn => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AuditFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  // Cache para evitar requisições desnecessárias
  const [cache, setCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  const getCacheKey = useCallback((filters: AuditFilters, page: number) => {
    return `audit_${JSON.stringify(filters)}_${page}`;
  }, []);

  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, [CACHE_DURATION]);

  const loadData = useCallback(async (filters: AuditFilters, page: number) => {
    const cacheKey = getCacheKey(filters, page);
    const cached = cache.get(cacheKey);

    // Verificar cache primeiro
    if (cached && isCacheValid(cached.timestamp)) {
      setLogs(cached.data.logs);
      setStats(cached.data.stats);
      setPagination(cached.data.pagination);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fazer apenas uma chamada para buscar logs e estatísticas
      const response = await apiService.getAuditLogs({
        ...filters,
        page,
        limit: DEFAULT_PAGINATION.limit,
      });

      const newData = {
        logs: response.logs || [],
        stats: response.stats || null,
        pagination: {
          page,
          limit: DEFAULT_PAGINATION.limit,
          total: response.total || 0,
          totalPages: Math.ceil((response.total || 0) / DEFAULT_PAGINATION.limit),
        },
      };

      // Atualizar cache
      setCache(prev => new Map(prev.set(cacheKey, {
        data: newData,
        timestamp: Date.now(),
      })));

      setLogs(newData.logs);
      setStats(newData.stats);
      setPagination(newData.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Erro ao carregar dados de auditoria:', err);
    } finally {
      setLoading(false);
    }
  }, [cache, getCacheKey, isCacheValid]);

  const setFilters = useCallback((newFilters: Partial<AuditFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset para primeira página
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    // Limpar cache e recarregar
    setCache(new Map());
    loadData(filters, pagination.page);
  }, [filters, pagination.page, loadData]);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPagination(DEFAULT_PAGINATION);
  }, []);

  // Carregar dados quando filters ou page mudarem
  useEffect(() => {
    loadData(filters, pagination.page);
  }, [filters, pagination.page, loadData]);

  return {
    logs,
    stats,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    setPage,
    refresh,
    clearFilters,
  };
};
