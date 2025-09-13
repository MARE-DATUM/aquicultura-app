import { useFormValidation, commonValidations } from './useFormValidation';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const initialValues: LoginFormData = {
  email: '',
  password: '',
  rememberMe: false
};

const validationRules = {
  email: {
    ...commonValidations.required('Email é obrigatório'),
    ...commonValidations.email('Email inválido')
  },
  password: {
    ...commonValidations.required('Senha é obrigatória'),
    ...commonValidations.minLength(6, 'Senha deve ter pelo menos 6 caracteres')
  }
};

/**
 * Hook específico para formulário de login
 */
export const useLoginForm = () => {
  const form = useFormValidation(initialValues, validationRules, {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true
  });

  const handleEmailChange = (value: string) => {
    form.setValue('email', value);
  };

  const handlePasswordChange = (value: string) => {
    form.setValue('password', value);
  };

  const handleRememberMeChange = (checked: boolean) => {
    form.setValue('rememberMe', checked);
  };

  const handleEmailBlur = () => {
    form.handleBlur('email');
  };

  const handlePasswordBlur = () => {
    form.handleBlur('password');
  };

  const handleSubmit = async (onSubmit: (data: LoginFormData) => Promise<void>) => {
    await form.handleSubmit(onSubmit);
  };

  return {
    ...form,
    handleEmailChange,
    handlePasswordChange,
    handleRememberMeChange,
    handleEmailBlur,
    handlePasswordBlur,
    handleSubmit
  };
};


