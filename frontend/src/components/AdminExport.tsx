import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Database, 
  FileText, 
  FileJson,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Select, Alert } from './ui';

export const AdminExport: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'sql'>('json');
  const [dbStats, setDbStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Verificar se o usuário é ROOT
  const isRoot = user?.role === 'ROOT';

  useEffect(() => {
    if (isRoot) {
      loadDatabaseStats();
    }
  }, [isRoot]);

  const loadDatabaseStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await apiService.getDatabaseStats();
      setDbStats(stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleExportDatabase = async () => {
    if (!isRoot) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const blob = await apiService.exportDatabase(exportFormat);
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      link.download = `aquicultura_export_${timestamp}.${exportFormat}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Base de dados exportada com sucesso em formato ${exportFormat.toUpperCase()}!`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Erro ao exportar base de dados');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTable = async (tableName: string, format: 'json' | 'csv') => {
    if (!isRoot) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const blob = await apiService.exportTable(tableName, format);
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      link.download = `${tableName}_export_${timestamp}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Tabela ${tableName} exportada com sucesso!`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || `Erro ao exportar tabela ${tableName}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isRoot) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-yellow-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Apenas utilizadores ROOT podem exportar a base de dados.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      {/* Exportação Completa */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Exportação Completa da Base de Dados
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Exporta todos os dados do sistema para backup ou migração
            </p>
          </div>
          <Settings className="h-5 w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato de Exportação
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as 'json')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  <FileJson className="inline h-4 w-4 mr-1" />
                  JSON (Portável, legível)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="sql"
                  checked={exportFormat === 'sql'}
                  onChange={(e) => setExportFormat(e.target.value as 'sql')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  <FileText className="inline h-4 w-4 mr-1" />
                  SQL (Backup completo)
                </span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleExportDatabase}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar Base de Dados Completa
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Estatísticas do Banco */}
      {dbStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estatísticas da Base de Dados
          </h3>
          
          {loadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Motor de BD</p>
                  <p className="text-lg font-medium capitalize">{dbStats?.database_info?.engine}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Registos</p>
                  <p className="text-lg font-medium">{dbStats?.summary?.total_records?.toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tabelas e Registos</h4>
                <div className="space-y-2">
                  {Object.entries(dbStats?.tables || {}).map(([tableName, info]: [string, any]) => (
                    <div key={tableName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{tableName}</span>
                        <span className="text-xs text-gray-500">
                          ({info.record_count} registos, {info.column_count} colunas)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExportTable(tableName, 'json')}
                          disabled={isLoading}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          JSON
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleExportTable(tableName, 'csv')}
                          disabled={isLoading}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          CSV
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Informações de Segurança */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Notas de Segurança:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Os arquivos exportados contêm dados sensíveis. Armazene-os em local seguro.</li>
              <li>As exportações SQL incluem estrutura e dados completos da base de dados.</li>
              <li>As exportações JSON são úteis para migração e análise de dados.</li>
              <li>Realize backups regulares para garantir a segurança dos dados.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
