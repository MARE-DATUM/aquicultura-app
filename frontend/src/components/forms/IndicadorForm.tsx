import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Building2,
  Calendar,
  Target,
  Activity,
  FileText
} from 'lucide-react';
import { Button, Input, Card, Badge } from '../ui';
import { useProjetos } from '../../hooks/useIndicadores';
import { apiService } from '../../services/api';
import type { Indicador, Projeto, IndicadorCreate, Trimestre } from '../../types/simple';

// Schema de validação
const indicadorSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  projeto_id: z.number()
    .min(1, 'Projeto é obrigatório'),
  periodo_referencia: z.enum(['T1', 'T2', 'T3', 'T4']).refine(val => val !== undefined, {
    message: 'Trimestre é obrigatório'
  }),
  meta: z.number()
    .min(0.01, 'Meta deve ser maior que zero')
    .max(999999999, 'Meta muito alta'),
  valor_actual: z.number()
    .min(0, 'Valor atual não pode ser negativo')
    .max(999999999, 'Valor atual muito alto'),
  unidade: z.string()
    .min(1, 'Unidade é obrigatória')
    .max(20, 'Unidade deve ter no máximo 20 caracteres'),
  fonte_dados: z.string()
    .min(1, 'Fonte de dados é obrigatória')
    .max(200, 'Fonte de dados deve ter no máximo 200 caracteres')
});

type IndicadorFormData = z.infer<typeof indicadorSchema>;

interface IndicadorFormProps {
  indicador?: Indicador;
  onSuccess: (indicador: Indicador) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const IndicadorForm: React.FC<IndicadorFormProps> = ({
  indicador,
  onSuccess,
  onCancel,
  isEditing = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: projetos = [], isLoading: loadingProjetos } = useProjetos();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<IndicadorFormData>({
    resolver: zodResolver(indicadorSchema),
    defaultValues: {
      nome: indicador?.nome || '',
      projeto_id: indicador?.projeto_id || 0,
      periodo_referencia: indicador?.periodo_referencia || 'T1',
      meta: indicador?.meta ? Number(indicador.meta) : 0,
      valor_actual: indicador?.valor_actual ? Number(indicador.valor_actual) : 0,
      unidade: indicador?.unidade || '',
      fonte_dados: indicador?.fonte_dados || ''
    },
    mode: 'onChange'
  });

  const trimestres: { value: Trimestre; label: string }[] = [
    { value: 'T1', label: '1º Trimestre' },
    { value: 'T2', label: '2º Trimestre' },
    { value: 'T3', label: '3º Trimestre' },
    { value: 'T4', label: '4º Trimestre' }
  ];

  const unidadesComuns = [
    'toneladas', 'kg', 'famílias', 'pessoas', 'empregos', 
    'licenças', '%', 'hectares', 'metros', 'unidades'
  ];

  const onSubmit = async (data: IndicadorFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const indicadorData: IndicadorCreate = {
        ...data,
        meta: data.meta,
        valor_actual: data.valor_actual
      };

      let result: Indicador;
      
      if (isEditing && indicador) {
        result = await apiService.updateIndicador(indicador.id, indicadorData);
      } else {
        result = await apiService.createIndicador(indicadorData);
      }

      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        reset();
        onSuccess(result);
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao salvar indicador:', error);
      setSubmitError(
        error.response?.data?.detail || 
        'Erro ao salvar indicador. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  // Calcular progresso
  const meta = watch('meta');
  const valorAtual = watch('valor_actual');
  const progresso = meta > 0 ? Math.min((valorAtual / meta) * 100, 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {isEditing ? (
                  <Activity className="h-6 w-6 text-blue-600" />
                ) : (
                  <Plus className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Editar Indicador' : 'Novo Indicador'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditing 
                    ? 'Atualize as informações do indicador' 
                    : 'Preencha os dados para criar um novo indicador'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Indicador {isEditing ? 'atualizado' : 'criado'} com sucesso!
                </p>
                <p className="text-xs text-green-600">
                  Redirecionando...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Erro ao salvar indicador
                </p>
                <p className="text-xs text-red-600">{submitError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome do Indicador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Indicador *
              </label>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Ex: Produção de Peixe"
                    className={errors.nome ? 'border-red-300' : ''}
                  />
                )}
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            {/* Projeto e Trimestre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projeto *
                </label>
                <Controller
                  name="projeto_id"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <select
                        {...field}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.projeto_id ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={loadingProjetos}
                      >
                        <option value={0}>
                          {loadingProjetos ? 'Carregando...' : 'Selecione um projeto'}
                        </option>
                        {projetos.map((projeto) => (
                          <option key={projeto.id} value={projeto.id}>
                            {projeto.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                />
                {errors.projeto_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.projeto_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trimestre *
                </label>
                <Controller
                  name="periodo_referencia"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <select
                        {...field}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.periodo_referencia ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {trimestres.map((trimestre) => (
                          <option key={trimestre.value} value={trimestre.value}>
                            {trimestre.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                />
                {errors.periodo_referencia && (
                  <p className="mt-1 text-sm text-red-600">{errors.periodo_referencia.message}</p>
                )}
              </div>
            </div>

            {/* Meta e Valor Atual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta *
                </label>
                <Controller
                  name="meta"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`pl-10 ${errors.meta ? 'border-red-300' : ''}`}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                />
                {errors.meta && (
                  <p className="mt-1 text-sm text-red-600">{errors.meta.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Atual *
                </label>
                <Controller
                  name="valor_actual"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`pl-10 ${errors.valor_actual ? 'border-red-300' : ''}`}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                />
                {errors.valor_actual && (
                  <p className="mt-1 text-sm text-red-600">{errors.valor_actual.message}</p>
                )}
              </div>
            </div>

            {/* Indicador de Progresso */}
            {meta > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progresso</span>
                  <span className="text-sm font-bold text-gray-900">
                    {progresso.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progresso >= 90 ? 'bg-green-500' :
                      progresso >= 70 ? 'bg-blue-500' :
                      progresso >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(progresso, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>{meta.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Unidade e Fonte de Dados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade *
                </label>
                <Controller
                  name="unidade"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Input
                        {...field}
                        placeholder="Ex: toneladas"
                        className={errors.unidade ? 'border-red-300' : ''}
                        list="unidades"
                      />
                      <datalist id="unidades">
                        {unidadesComuns.map((unidade) => (
                          <option key={unidade} value={unidade} />
                        ))}
                      </datalist>
                    </div>
                  )}
                />
                {errors.unidade && (
                  <p className="mt-1 text-sm text-red-600">{errors.unidade.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonte de Dados *
                </label>
                <Controller
                  name="fonte_dados"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        {...field}
                        placeholder="Ex: Relatório trimestral T1"
                        className={`pl-10 ${errors.fonte_dados ? 'border-red-300' : ''}`}
                      />
                    </div>
                  )}
                />
                {errors.fonte_dados && (
                  <p className="mt-1 text-sm text-red-600">{errors.fonte_dados.message}</p>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditing ? 'Atualizando...' : 'Criando...'}
                  </>
                ) : (
                  <>
                    {isEditing ? 'Atualizar' : 'Criar'} Indicador
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default IndicadorForm;