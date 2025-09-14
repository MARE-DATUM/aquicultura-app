import React from 'react';
import { Card, Badge, Button } from './ui';
import { 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import type { Eixo5W2H, Periodo5W2H } from '../types/simple';

interface EixoCardProps {
  eixo: Eixo5W2H;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const EixoCard: React.FC<EixoCardProps> = ({
  eixo,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-AO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPeriodoColor = (periodo: Periodo5W2H) => {
    switch (periodo) {
      case '0-6': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '7-12': return 'bg-green-100 text-green-800 border-green-200';
      case '13-18': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPeriodoLabel = (periodo: Periodo5W2H) => {
    switch (periodo) {
      case '0-6': return '0-6 meses';
      case '7-12': return '7-12 meses';
      case '13-18': return '13-18 meses';
      default: return periodo;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {truncateText(eixo.what, 60)}
            </h3>
            <Badge className={getPeriodoColor(eixo.periodo)}>
              {getPeriodoLabel(eixo.periodo)}
            </Badge>
          </div>
          {eixo.projeto && (
            <p className="text-sm text-gray-600 mb-2">
              Projeto: {eixo.projeto.nome}
            </p>
          )}
        </div>
        
        {/* Botões de Ação */}
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            title="Ver detalhes"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canEdit && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              title="Editar eixo"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              title="Eliminar eixo"
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Resumo das Informações */}
      <div className="space-y-3 mb-4">
        {/* Why */}
        <div>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-green-600 font-semibold text-xs">W</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Porquê:</span>
          </div>
          <p className="text-sm text-gray-600 pl-8">
            {truncateText(eixo.why, 120)}
          </p>
        </div>

        {/* Where */}
        <div>
          <div className="flex items-center mb-1">
            <MapPin className="h-4 w-4 text-purple-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Onde:</span>
          </div>
          <p className="text-sm text-gray-600 pl-6">
            {truncateText(eixo.where, 80)}
          </p>
        </div>

        {/* Who */}
        <div>
          <div className="flex items-center mb-1">
            <Users className="h-4 w-4 text-indigo-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Quem:</span>
          </div>
          <p className="text-sm text-gray-600 pl-6">
            {truncateText(eixo.who, 80)}
          </p>
        </div>
      </div>

      {/* Orçamento */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Orçamento:</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(eixo.how_much_kz)}
          </span>
        </div>
      </div>

      {/* Marcos */}
      {eixo.marcos && eixo.marcos.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Marcos ({eixo.marcos.length})
            </span>
          </div>
          <div className="space-y-1">
            {eixo.marcos.slice(0, 2).map((marco, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{marco.nome}</span>
                <Badge 
                  className={
                    marco.status === 'Concluído' 
                      ? 'bg-green-100 text-green-800' 
                      : marco.status === 'Em Progresso'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {marco.status}
                </Badge>
              </div>
            ))}
            {eixo.marcos.length > 2 && (
              <p className="text-xs text-gray-500">
                +{eixo.marcos.length - 2} mais marcos
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
        <span>Criado em {formatDate(eixo.created_at)}</span>
        <span>ID: #{eixo.id}</span>
      </div>
    </Card>
  );
};

export default EixoCard;
