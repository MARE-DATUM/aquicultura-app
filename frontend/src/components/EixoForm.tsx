import React, { useState, useEffect } from 'react';
import { CustomButton as Button, CustomInput as Input, CustomSelect as Select, CustomTextArea as TextArea, Card } from './ui';
import { Plus, Trash2, Calendar, CheckCircle } from 'lucide-react';
import type { Eixo5W2H, Projeto, Periodo5W2H } from '../types/simple';

interface Marco {
  nome: string;
  data: string;
  status: 'Pendente' | 'Em Progresso' | 'Concluído';
}

interface EixoFormProps {
  eixo?: Eixo5W2H;
  projetos: Projeto[];
  onSubmit: (data: EixoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

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
  marcos?: Marco[];
}

const EixoForm: React.FC<EixoFormProps> = ({
  eixo,
  projetos,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<EixoFormData>({
    projeto_id: eixo?.projeto_id || 0,
    what: eixo?.what || '',
    why: eixo?.why || '',
    where: eixo?.where || '',
    when: eixo?.when || '',
    who: eixo?.who || '',
    how: eixo?.how || '',
    how_much_kz: eixo?.how_much_kz || 0,
    periodo: eixo?.periodo || '0-6',
    marcos: (eixo?.marcos || []).map(marco => ({
      ...marco,
      status: marco.status as 'Pendente' | 'Em Progresso' | 'Concluído'
    }))
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [marcos, setMarcos] = useState<Marco[]>(
    (formData.marcos || []).map(marco => ({
      ...marco,
      status: marco.status as 'Pendente' | 'Em Progresso' | 'Concluído'
    }))
  );

  const periodos: { value: Periodo5W2H; label: string }[] = [
    { value: '0-6', label: '0-6 meses' },
    { value: '7-12', label: '7-12 meses' },
    { value: '13-18', label: '13-18 meses' }
  ];

  const statusMarcos: { value: Marco['status']; label: string }[] = [
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Em Progresso', label: 'Em Progresso' },
    { value: 'Concluído', label: 'Concluído' }
  ];

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'projeto_id':
        return value <= 0 ? 'Selecione um projeto' : '';
      case 'what':
      case 'why':
      case 'where':
      case 'when':
      case 'who':
      case 'how':
        return !value || value.trim().length === 0 ? 'Campo obrigatório' : '';
      case 'how_much_kz':
        return value <= 0 ? 'Orçamento deve ser maior que zero' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const addMarco = () => {
    const novoMarco: Marco = {
      nome: '',
      data: '',
      status: 'Pendente'
    };
    setMarcos(prev => [...prev, novoMarco]);
  };

  const removeMarco = (index: number) => {
    setMarcos(prev => prev.filter((_, i) => i !== index));
  };

  const updateMarco = (index: number, field: keyof Marco, value: string) => {
    setMarcos(prev => prev.map((marco, i) => 
      i === index ? { ...marco, [field]: value } : marco
    ));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'marcos') {
        const error = validateField(key, formData[key as keyof EixoFormData]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataToSubmit = {
      ...formData,
      marcos: marcos.filter(marco => marco.nome.trim() !== '')
    };

    await onSubmit(dataToSubmit);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações Básicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Projeto *
            </label>
            <Select
              value={formData.projeto_id}
              onChange={(e) => handleInputChange('projeto_id', parseInt(e.target.value))}
              error={errors.projeto_id}
              options={[
                { value: 0, label: 'Selecione um projeto' },
                ...projetos.map(projeto => ({
                  value: projeto.id,
                  label: projeto.nome
                }))
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período *
            </label>
            <Select
              value={formData.periodo}
              onChange={(e) => handleInputChange('periodo', e.target.value as Periodo5W2H)}
              options={periodos}
            />
          </div>
        </div>
      </Card>

      {/* Perguntas 5W2H */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Perguntas 5W2H
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What (O que) *
            </label>
            <TextArea
              value={formData.what}
              onChange={(e) => handleInputChange('what', e.target.value)}
              placeholder="Descreva o que será feito..."
              rows={3}
              error={errors.what}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why (Porquê) *
            </label>
            <TextArea
              value={formData.why}
              onChange={(e) => handleInputChange('why', e.target.value)}
              placeholder="Explique a justificativa..."
              rows={3}
              error={errors.why}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where (Onde) *
            </label>
            <Input
              value={formData.where}
              onChange={(e) => handleInputChange('where', e.target.value)}
              placeholder="Localização do projeto..."
              error={errors.where}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When (Quando) *
            </label>
            <Input
              value={formData.when}
              onChange={(e) => handleInputChange('when', e.target.value)}
              placeholder="Cronograma do projeto..."
              error={errors.when}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who (Quem) *
            </label>
            <Input
              value={formData.who}
              onChange={(e) => handleInputChange('who', e.target.value)}
              placeholder="Responsáveis pelo projeto..."
              error={errors.who}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How (Como) *
            </label>
            <TextArea
              value={formData.how}
              onChange={(e) => handleInputChange('how', e.target.value)}
              placeholder="Descreva a metodologia..."
              rows={3}
              error={errors.how}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How Much (Quanto) - Orçamento em KZ *
            </label>
            <Input
              type="number"
              value={formData.how_much_kz}
              onChange={(e) => handleInputChange('how_much_kz', parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="0.01"
              error={errors.how_much_kz}
            />
            {formData.how_much_kz > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(formData.how_much_kz)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Marcos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Marcos (Opcional)
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMarco}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Marco
          </Button>
        </div>

        {marcos.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nenhum marco adicionado. Clique em "Adicionar Marco" para incluir marcos do projeto.
          </p>
        ) : (
          <div className="space-y-3">
            {marcos.map((marco, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Marco {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMarco(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <Input
                      value={marco.nome}
                      onChange={(e) => updateMarco(index, 'nome', e.target.value)}
                      placeholder="Nome do marco..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data
                    </label>
                    <Input
                      type="date"
                      value={marco.data}
                      onChange={(e) => updateMarco(index, 'data', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Select
                      value={marco.status}
                      onChange={(e) => updateMarco(index, 'status', e.target.value as Marco['status'])}
                      options={statusMarcos}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Botões */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Guardando...' : (eixo ? 'Guardar Alterações' : 'Guardar Eixo')}
        </Button>
      </div>
    </form>
  );
};

export default EixoForm;
