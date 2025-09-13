import { useFormValidation, commonValidations } from './useFormValidation';
import type { Projeto } from '../types/simple';

interface ProjetoFormData {
  nome: string;
  provincia_id: number | '';
  tipo: string;
  fonte_financiamento: string;
  estado: string;
  responsavel: string;
  orcamento_previsto_kz: number | '';
  orcamento_executado_kz: number | '';
  data_inicio_prevista: string;
  data_fim_prevista: string;
  descricao: string;
}

const initialValues: ProjetoFormData = {
  nome: '',
  provincia_id: '',
  tipo: '',
  fonte_financiamento: '',
  estado: '',
  responsavel: '',
  orcamento_previsto_kz: '',
  orcamento_executado_kz: '',
  data_inicio_prevista: '',
  data_fim_prevista: '',
  descricao: ''
};

const validationRules = {
  nome: {
    ...commonValidations.required('Nome do projeto é obrigatório'),
    ...commonValidations.minLength(3, 'Nome deve ter pelo menos 3 caracteres'),
    ...commonValidations.maxLength(100, 'Nome deve ter no máximo 100 caracteres')
  },
  provincia_id: {
    ...commonValidations.required('Província é obrigatória'),
    custom: (value: number | string) => {
      if (!value || value === '') {
        return 'Província é obrigatória';
      }
      return null;
    }
  },
  tipo: {
    ...commonValidations.required('Tipo de projeto é obrigatório')
  },
  fonte_financiamento: {
    ...commonValidations.required('Fonte de financiamento é obrigatória')
  },
  estado: {
    ...commonValidations.required('Estado do projeto é obrigatório')
  },
  responsavel: {
    ...commonValidations.required('Responsável é obrigatório'),
    ...commonValidations.minLength(2, 'Nome do responsável deve ter pelo menos 2 caracteres')
  },
  orcamento_previsto_kz: {
    ...commonValidations.required('Orçamento previsto é obrigatório'),
    custom: (value: number | string) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue) || numValue <= 0) {
        return 'Orçamento deve ser um número positivo';
      }
      return null;
    }
  },
  orcamento_executado_kz: {
    custom: (value: number | string) => {
      if (value === '' || value === null || value === undefined) {
        return null; // Campo opcional
      }
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue) || numValue < 0) {
        return 'Orçamento executado deve ser um número não negativo';
      }
      return null;
    }
  },
  data_inicio_prevista: {
    ...commonValidations.required('Data de início é obrigatória'),
    custom: (value: string) => {
      if (!value) return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return null;
    }
  },
  data_fim_prevista: {
    ...commonValidations.required('Data de fim é obrigatória'),
    custom: (value: string) => {
      if (!value) return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return null;
    }
  },
  descricao: {
    ...commonValidations.maxLength(500, 'Descrição deve ter no máximo 500 caracteres')
  }
};

/**
 * Hook específico para formulário de projeto
 */
export const useProjetoForm = (initialData?: Partial<ProjetoFormData>) => {
  const form = useFormValidation(
    { ...initialValues, ...initialData },
    validationRules,
    {
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true
    }
  );

  const handleFieldChange = (field: keyof ProjetoFormData, value: any) => {
    form.setValue(field, value);
  };

  const handleFieldBlur = (field: keyof ProjetoFormData) => {
    form.handleBlur(field);
  };

  const handleSubmit = async (onSubmit: (data: ProjetoFormData) => Promise<void>) => {
    await form.handleSubmit(onSubmit);
  };

  const reset = (newData?: Partial<ProjetoFormData>) => {
    form.reset({ ...initialValues, ...newData });
  };

  // Validação adicional para datas
  const validateDateRange = () => {
    const { data_inicio_prevista, data_fim_prevista } = form.values;
    
    if (data_inicio_prevista && data_fim_prevista) {
      const inicio = new Date(data_inicio_prevista);
      const fim = new Date(data_fim_prevista);
      
      if (fim <= inicio) {
        form.setValue('data_fim_prevista', '');
        return 'Data de fim deve ser posterior à data de início';
      }
    }
    
    return null;
  };

  // Validação adicional para orçamento
  const validateBudget = () => {
    const { orcamento_previsto_kz, orcamento_executado_kz } = form.values;
    
    if (orcamento_previsto_kz && orcamento_executado_kz) {
      const previsto = typeof orcamento_previsto_kz === 'string' 
        ? parseFloat(orcamento_previsto_kz) 
        : orcamento_previsto_kz;
      const executado = typeof orcamento_executado_kz === 'string' 
        ? parseFloat(orcamento_executado_kz) 
        : orcamento_executado_kz;
      
      if (executado > previsto) {
        form.setValue('orcamento_executado_kz', '');
        return 'Orçamento executado não pode ser maior que o previsto';
      }
    }
    
    return null;
  };

  return {
    ...form,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    reset,
    validateDateRange,
    validateBudget
  };
};


