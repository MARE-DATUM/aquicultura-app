import React from 'react';
import { Card, Badge, Button } from './ui';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import type { Eixo5W2H, Periodo5W2H } from '../types/simple';

interface EixoDetailsProps {
  eixo: Eixo5W2H;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const EixoDetails: React.FC<EixoDetailsProps> = ({
  eixo,
  onEdit,
  onDelete,
  onClose,
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getPeriodoColor = (periodo: Periodo5W2H) => {
    switch (periodo) {
      case '0-6': return 'bg-blue-100 text-blue-800';
      case '7-12': return 'bg-green-100 text-green-800';
      case '13-18': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Em Progresso':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'Pendente':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Em Progresso':
        return 'bg-blue-100 text-blue-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Detalhes do Eixo
          </h2>
          <p className="text-gray-600 mt-1">
            Criado em {formatDate(eixo.created_at)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getPeriodoColor(eixo.periodo)}>
            {getPeriodoLabel(eixo.periodo)}
          </Badge>
        </div>
      </div>

      {/* Informações do Projeto */}
      {eixo.projeto && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Projeto Associado
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">{eixo.projeto.nome}</h4>
            <p className="text-sm text-gray-600 mt-1">
              ID: {eixo.projeto.id}
            </p>
          </div>
        </Card>
      )}

      {/* Perguntas 5W2H */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Perguntas 5W2H
        </h3>
        <div className="space-y-6">
          {/* What */}
          <div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">W</span>
              </div>
              <h4 className="font-medium text-gray-900">What (O que)</h4>
            </div>
            <p className="text-gray-700 pl-11">{eixo.what}</p>
          </div>

          {/* Why */}
          <div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-semibold text-sm">W</span>
              </div>
              <h4 className="font-medium text-gray-900">Why (Porquê)</h4>
            </div>
            <p className="text-gray-700 pl-11">{eixo.why}</p>
          </div>

          {/* Where */}
          <div>
            <div className="flex items-center mb-2">
              <MapPin className="h-5 w-5 text-purple-500 mr-3" />
              <h4 className="font-medium text-gray-900">Where (Onde)</h4>
            </div>
            <p className="text-gray-700 pl-8">{eixo.where}</p>
          </div>

          {/* When */}
          <div>
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-orange-500 mr-3" />
              <h4 className="font-medium text-gray-900">When (Quando)</h4>
            </div>
            <p className="text-gray-700 pl-8">{eixo.when}</p>
          </div>

          {/* Who */}
          <div>
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-indigo-500 mr-3" />
              <h4 className="font-medium text-gray-900">Who (Quem)</h4>
            </div>
            <p className="text-gray-700 pl-8">{eixo.who}</p>
          </div>

          {/* How */}
          <div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 font-semibold text-sm">H</span>
              </div>
              <h4 className="font-medium text-gray-900">How (Como)</h4>
            </div>
            <p className="text-gray-700 pl-11">{eixo.how}</p>
          </div>

          {/* How Much */}
          <div>
            <div className="flex items-center mb-2">
              <DollarSign className="h-5 w-5 text-green-500 mr-3" />
              <h4 className="font-medium text-gray-900">How Much (Quanto)</h4>
            </div>
            <div className="pl-8">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(eixo.how_much_kz)}
              </p>
              <p className="text-sm text-gray-500">Orçamento total</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Marcos */}
      {eixo.marcos && eixo.marcos.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Marcos do Projeto
          </h3>
          <div className="space-y-3">
            {eixo.marcos.map((marco, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(marco.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{marco.nome}</h4>
                      <p className="text-sm text-gray-600">
                        {marco.data && formatDate(marco.data)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(marco.status)}>
                    {marco.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Informações Adicionais */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações Adicionais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">ID do Eixo:</span>
            <p className="text-gray-600">#{eixo.id}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Período:</span>
            <p className="text-gray-600">{getPeriodoLabel(eixo.periodo)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Criado em:</span>
            <p className="text-gray-600">{formatDate(eixo.created_at)}</p>
          </div>
          {eixo.updated_at && (
            <div>
              <span className="font-medium text-gray-700">Atualizado em:</span>
              <p className="text-gray-600">{formatDate(eixo.updated_at)}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Fechar
        </Button>
        {canEdit && onEdit && (
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Eixo
          </Button>
        )}
        {canDelete && onDelete && (
          <Button
                variant="destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Eixo
          </Button>
        )}
      </div>
    </div>
  );
};

export default EixoDetails;
