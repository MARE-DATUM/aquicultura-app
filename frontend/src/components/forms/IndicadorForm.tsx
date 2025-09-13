import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  FormModal, 
  FormSection, 
  FormGroup, 
  Input, 
  Select, 
  TextArea,
  Alert 
} from '../ui';
import type { Indicador, Projeto, Trimestre } from '../../types/simple';

interface IndicadorFormProps {
  isOpen: boolean;
  onClose: () => void;
  indicador?: Indicador | null;
  onSuccess: () => void;
  projetos: Projeto[];
}

export const IndicadorForm: React.FC<IndicadorFormProps> = ({
  isOpen,
  onClose,
  indicador,
  onSuccess,
  projetos
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projeto_id: '',
    nome: '',
    unidade: '',
    meta: '',
    valor_actual: '',
    periodo_referencia: 'T1',
    ano_referencia: new Date().getFullYear().toString(),
    fonte_dados: '',
    metodologia_calculo: '',
    observacoes: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Períodos (trimestres)
  const periodos = [
    { value: 'T1', label: '1º Trimestre' },
    { value: 'T2', label: '2º Trimestre' },
    { value: 'T3', label: '3º Trimestre' },
    { value: 'T4', label: '4º Trimestre' }
  ];

  // Anos disponíveis (últimos 5 anos + próximos 2)
  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: 7 }, (_, i) => {
    const year = currentYear - 5 + i;
    return { value: year.toString(), label: year.toString() };
  });

  useEffect(() => {
    if (indicador) {
      setFormData({
        projeto_id: String(indicador.projeto_id || ''),
        nome: indicador.nome || '',
        unidade: indicador.unidade || '',
        meta: String(indicador.meta || ''),
        valor_actual: String(indicador.valor_actual || ''),
        periodo_referencia: indicador.periodo_referencia || 'T1',
        ano_referencia: String(indicador.ano_referencia || new Date().getFullYear()),
        fonte_dados: indicador.fonte_dados || '',
        metodologia_calculo: indicador.metodologia_calculo || '',
        observacoes: indicador.observacoes || ''
      });
    } else {
      // Reset form para novo indicador
      setFormData({
        projeto_id: '',
        nome: '',
        unidade: '',
        meta: '',
        valor_actual: '',
        periodo_referencia: 'T1',
        ano_referencia: new Date().getFullYear().toString(),
        fonte_dados: '',
        metodologia_calculo: '',
        observacoes: ''
      });
    }
    setValidationErrors({});
    setError(null);
  }, [indicador]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro de validação ao alterar o campo
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.projeto_id) errors.projeto_id = 'Projeto é obrigatório';
    if (!formData.nome) errors.nome = 'Nome é obrigatório';
    if (!formData.unidade) errors.unidade = 'Unidade é obrigatória';
    if (!formData.meta) errors.meta = 'Meta é obrigatória';
    if (!formData.valor_actual) errors.valor_actual = 'Valor actual é obrigatório';
    if (!formData.fonte_dados) errors.fonte_dados = 'Fonte de dados é obrigatória';

    // Validar que valores sejam números positivos
    if (formData.meta && parseFloat(formData.meta) < 0) {
      errors.meta = 'Meta deve ser um valor positivo';
    }
    if (formData.valor_actual && parseFloat(formData.valor_actual) < 0) {
      errors.valor_actual = 'Valor actual deve ser positivo';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        projeto_id: parseInt(formData.projeto_id),
        meta: parseFloat(formData.meta),
        valor_actual: parseFloat(formData.valor_actual),
        ano_referencia: parseInt(formData.ano_referencia),
        periodo_referencia: formData.periodo_referencia as Trimestre
      };

      if (indicador) {
        // Atualizar indicador existente
        await apiService.updateIndicador(indicador.id, payload);
      } else {
        // Criar novo indicador
        await apiService.createIndicador(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar indicador');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular progresso
  const calcularProgresso = () => {
    if (formData.meta && formData.valor_actual) {
      const meta = parseFloat(formData.meta);
      const actual = parseFloat(formData.valor_actual);
      if (meta > 0) {
        return ((actual / meta) * 100).toFixed(1);
      }
    }
    return '0';
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={indicador ? 'Editar Indicador' : 'Criar Novo Indicador'}
      subtitle={indicador ? `Editando: ${indicador.nome}` : 'Preencha os dados do novo indicador'}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      size="lg"
    >
      <FormSection title="Informações Básicas">
        <FormGroup label="Projeto" required error={validationErrors.projeto_id}>
          <Select
            name="projeto_id"
            value={formData.projeto_id}
            onChange={handleChange}
            options={projetos.map(p => ({ value: p.id, label: p.nome }))}
            placeholder="Selecione o projeto"
          />
        </FormGroup>

        <FormGroup label="Nome do Indicador" required error={validationErrors.nome}>
          <Input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Ex: Produção de Tilápia"
          />
        </FormGroup>

        <FormGroup label="Unidade de Medida" required error={validationErrors.unidade}>
          <Input
            name="unidade"
            value={formData.unidade}
            onChange={handleChange}
            placeholder="Ex: Toneladas, Unidades, Hectares"
          />
        </FormGroup>
      </FormSection>

      <FormSection title="Valores e Metas">
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Meta" required error={validationErrors.meta}>
            <Input
              type="number"
              name="meta"
              value={formData.meta}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </FormGroup>

          <FormGroup label="Valor Actual" required error={validationErrors.valor_actual}>
            <Input
              type="number"
              name="valor_actual"
              value={formData.valor_actual}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </FormGroup>
        </div>

        {formData.meta && formData.valor_actual && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-sm font-bold text-blue-600">{calcularProgresso()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, parseFloat(calcularProgresso()))}%` }}
              />
            </div>
          </div>
        )}
      </FormSection>

      <FormSection title="Período de Referência">
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Trimestre" required>
            <Select
              name="periodo_referencia"
              value={formData.periodo_referencia}
              onChange={handleChange}
              options={periodos}
            />
          </FormGroup>

          <FormGroup label="Ano" required>
            <Select
              name="ano_referencia"
              value={formData.ano_referencia}
              onChange={handleChange}
              options={anos}
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection title="Metodologia e Fonte">
        <FormGroup label="Fonte de Dados" required error={validationErrors.fonte_dados}>
          <Input
            name="fonte_dados"
            value={formData.fonte_dados}
            onChange={handleChange}
            placeholder="Ex: Sistema de Monitoramento, Relatório Provincial"
          />
        </FormGroup>

        <FormGroup label="Metodologia de Cálculo">
          <TextArea
            name="metodologia_calculo"
            value={formData.metodologia_calculo}
            onChange={handleChange}
            placeholder="Descreva como o indicador é calculado"
            rows={3}
          />
        </FormGroup>

        <FormGroup label="Observações">
          <TextArea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            placeholder="Observações adicionais"
            rows={2}
          />
        </FormGroup>
      </FormSection>
    </FormModal>
  );
};
