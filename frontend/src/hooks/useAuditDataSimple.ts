import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { AuditLog } from '../types/simple';

interface AuditStats {
  total_logs: number;
  active_users: number;
  actions_today: number;
  entities_count: number;
}

interface UseAuditDataReturn {
  logs: AuditLog[];
  stats: AuditStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useAuditDataSimple = (): UseAuditDataReturn => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getAuditLogs({
        page: 1,
        limit: 20,
      });

      setLogs(response.logs || []);
      setStats(response.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    logs,
    stats,
    loading,
    error,
    refresh,
  };
};
