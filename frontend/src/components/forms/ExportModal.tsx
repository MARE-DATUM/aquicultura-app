import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileText, 
  FileSpreadsheet, 
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button, Card } from '../ui';
import { apiService } from '../../services/api';
import type { Projeto, Trimestre } from '../../types/simple';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projetos: Projeto[];
  filters: {
    projeto_id?: number;
    periodo_referencia?: Trimestre;
  };
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projetos,
  filters
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'excel' | 'pdf' | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async (type: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    setExportType(type);
    setExportError(null);
    setExportSuccess(false);

    try {
      let blob: Blob;
      let filename: string;

      switch (type) {
        case 'csv':
          blob = await apiService.exportIndicadoresCSV(filters.projeto_id, filters.periodo_referencia);
          filename = 'indicadores.csv';
          break;
        case 'excel':
          blob = await apiService.exportIndicadoresExcel(filters.projeto_id, filters.periodo_referencia);
          filename = 'indicadores.xlsx';
          break;
        case 'pdf':
          blob = await apiService.exportIndicadoresPDF(filters.projeto_id, filters.periodo_referencia);
          filename = 'indicadores.pdf';
          break;
        default:
          throw new Error('Tipo de exportação inválido');
      }

      // Criar URL do blob e iniciar download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportSuccess(true);
      
      // Fechar modal após sucesso
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
        setExportType(null);
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao exportar:', error);
      setExportError(
        error.response?.data?.detail || 
        'Erro ao exportar indicadores. Tente novamente.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const getProjectName = () => {
    if (!filters.projeto_id) return 'Todos os projetos';
    const projeto = projetos.find(p => p.id === filters.projeto_id);
    return projeto ? projeto.nome : 'Projeto selecionado';
  };

  const getPeriodName = () => {
    if (!filters.periodo_referencia) return 'Todos os trimestres';
    return `${filters.periodo_referencia}º Trimestre`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Exportar Indicadores
                </h2>
                <p className="text-sm text-gray-600">
                  Escolha o formato de exportação
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isExporting}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filtros Aplicados */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filtros Aplicados:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Projeto:</span> {getProjectName()}</p>
              <p><span className="font-medium">Período:</span> {getPeriodName()}</p>
            </div>
          </div>

          {/* Success Message */}
          {exportSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Exportação concluída com sucesso!
                </p>
                <p className="text-xs text-green-600">
                  O arquivo foi baixado automaticamente.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {exportError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Erro na exportação
                </p>
                <p className="text-xs text-red-600">{exportError}</p>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Escolha o formato:
            </h3>

            {/* CSV Option */}
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                isExporting && exportType !== 'csv'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 cursor-pointer'
              } ${
                exportType === 'csv' && isExporting
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">CSV</h4>
                    {exportType === 'csv' && isExporting && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Arquivo de texto separado por vírgulas
                  </p>
                </div>
              </div>
            </button>

            {/* Excel Option */}
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                isExporting && exportType !== 'excel'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 cursor-pointer'
              } ${
                exportType === 'excel' && isExporting
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">Excel</h4>
                    {exportType === 'excel' && isExporting && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Planilha Excel com múltiplas abas
                  </p>
                </div>
              </div>
            </button>

            {/* PDF Option */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                isExporting && exportType !== 'pdf'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 cursor-pointer'
              } ${
                exportType === 'pdf' && isExporting
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileImage className="h-8 w-8 text-red-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">PDF</h4>
                    {exportType === 'pdf' && isExporting && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Relatório em formato PDF
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExportModal;
