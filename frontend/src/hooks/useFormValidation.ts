import { useState, useCallback, useMemo } from 'react';

export type ValidationRule<T = any> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export type FormState<T> = {
  values: T;
  errors: ValidationErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
};

/**
 * Hook para validação de formulários com validação em tempo real
 */
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T> = {},
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    validateOnSubmit?: boolean;
  } = {}
) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true
  } = options;

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false
  });

  // Validação individual de campo
  const validateField = useCallback((
    fieldName: keyof T,
    value: T[keyof T]
  ): string | null => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Required validation
    if (rules.required && (value === undefined || value === null || value === '')) {
      return rules.message || `${String(fieldName)} é obrigatório`;
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Min length validation
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      return rules.message || `${String(fieldName)} deve ter pelo menos ${rules.minLength} caracteres`;
    }

    // Max length validation
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return rules.message || `${String(fieldName)} deve ter no máximo ${rules.maxLength} caracteres`;
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return rules.message || `${String(fieldName)} tem formato inválido`;
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  // Validação de todos os campos
  const validateAll = useCallback((): ValidationErrors<T> => {
    const errors: ValidationErrors<T> = {};

    Object.keys(state.values).forEach(fieldName => {
      const fieldKey = fieldName as keyof T;
      const error = validateField(fieldKey, state.values[fieldKey]);
      if (error) {
        errors[fieldKey] = error;
      }
    });

    return errors;
  }, [state.values, validateField]);

  // Atualizar valor de campo
  const setValue = useCallback((
    fieldName: keyof T,
    value: T[keyof T]
  ) => {
    setState(prev => {
      const newValues = { ...prev.values, [fieldName]: value };
      let newErrors = { ...prev.errors };
      let newTouched = { ...prev.touched, [fieldName]: true };

      // Validar campo se validateOnChange estiver ativo
      if (validateOnChange) {
        const error = validateField(fieldName, value);
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
      }

      const isValid = Object.keys(newErrors).length === 0;

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        touched: newTouched,
        isValid
      };
    });
  }, [validateField, validateOnChange]);

  // Marcar campo como tocado
  const setTouched = useCallback((fieldName: keyof T) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: true }
    }));
  }, []);

  // Validar campo no blur
  const handleBlur = useCallback((fieldName: keyof T) => {
    if (validateOnBlur) {
      setTouched(fieldName);
      const error = validateField(fieldName, state.values[fieldName]);
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: error || undefined
        }
      }));
    }
  }, [validateOnBlur, setTouched, validateField, state.values]);

  // Submeter formulário
  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      if (validateOnSubmit) {
        const errors = validateAll();
        if (Object.keys(errors).length > 0) {
          setState(prev => ({
            ...prev,
            errors,
            isSubmitting: false,
            touched: Object.keys(prev.values).reduce((acc, key) => ({
              ...acc,
              [key]: true
            }), {} as Partial<Record<keyof T, boolean>>)
          }));
          return;
        }
      }

      await onSubmit(state.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, validateOnSubmit, validateAll]);

  // Resetar formulário
  const reset = useCallback((newValues?: Partial<T>) => {
    setState({
      values: { ...initialValues, ...newValues },
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false
    });
  }, [initialValues]);

  // Obter erro de campo
  const getFieldError = useCallback((fieldName: keyof T) => {
    return state.errors[fieldName];
  }, [state.errors]);

  // Verificar se campo tem erro
  const hasFieldError = useCallback((fieldName: keyof T) => {
    return !!state.errors[fieldName];
  }, [state.errors]);

  // Verificar se campo foi tocado
  const isFieldTouched = useCallback((fieldName: keyof T) => {
    return !!state.touched[fieldName];
  }, [state.touched]);

  // Verificar se deve mostrar erro
  const shouldShowError = useCallback((fieldName: keyof T) => {
    return isFieldTouched(fieldName) && hasFieldError(fieldName);
  }, [isFieldTouched, hasFieldError]);

  return {
    ...state,
    setValue,
    setTouched,
    handleBlur,
    handleSubmit,
    reset,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    shouldShowError,
    validateField,
    validateAll
  };
};

/**
 * Validações comuns pré-definidas
 */
export const commonValidations = {
  required: <T>(message?: string): ValidationRule<T> => ({
    required: true,
    message: message || 'Este campo é obrigatório'
  }),

  email: (message?: string): ValidationRule<string> => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Email inválido'
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    minLength: min,
    message: message || `Deve ter pelo menos ${min} caracteres`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    maxLength: max,
    message: message || `Deve ter no máximo ${max} caracteres`
  }),

  phone: (message?: string): ValidationRule<string> => ({
    pattern: /^(\+244|244)?[0-9]{9}$/,
    message: message || 'Número de telefone inválido'
  }),

  positiveNumber: (message?: string): ValidationRule<number> => ({
    custom: (value) => {
      if (typeof value === 'number' && value <= 0) {
        return message || 'Deve ser um número positivo';
      }
      return null;
    }
  }),

  url: (message?: string): ValidationRule<string> => ({
    pattern: /^https?:\/\/.+/,
    message: message || 'URL inválida'
  }),

  password: (message?: string): ValidationRule<string> => ({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: message || 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número'
  })
};


