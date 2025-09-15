import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  FormModal, 
  FormSection, 
  FormGroup, 
  Input, 
  CustomSelect as Select,
  Alert 
} from '../ui';
import type { User } from '../../types/simple';

interface UtilizadorFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

export const UtilizadorForm: React.FC<UtilizadorFormProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'VISUALIZADOR',
    is_active: true,
    phone: '',
    department: '',
    position: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Roles disponíveis
  const roles = [
    { value: 'ROOT', label: 'Administrador Root' },
    { value: 'GESTAO_DADOS', label: 'Gestão de Dados' },
    { value: 'VISUALIZADOR', label: 'Visualizador' }
  ];

  // Departamentos
  const departments = [
    { value: 'DNA', label: 'Direcção Nacional de Aquicultura' },
    { value: 'PROVINCIAL', label: 'Direcção Provincial' },
    { value: 'MUNICIPAL', label: 'Administração Municipal' },
    { value: 'TECNICO', label: 'Equipa Técnica' },
    { value: 'ADMINISTRATIVO', label: 'Administrativo' },
    { value: 'OUTRO', label: 'Outro' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // Não carregar senha para edição
        confirmPassword: '',
        full_name: user.full_name || '',
        role: user.role || 'VISUALIZADOR',
        is_active: user.is_active !== undefined ? user.is_active : true,
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || ''
      });
    } else {
      // Reset form para novo utilizador
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: 'VISUALIZADOR',
        is_active: true,
        phone: '',
        department: '',
        position: ''
      });
    }
    setValidationErrors({});
    setError(null);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    
    // Limpar erro de validação ao alterar o campo
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username) errors.username = 'Nome de utilizador é obrigatório';
    if (!formData.email) errors.email = 'Email é obrigatório';
    if (!formData.full_name) errors.full_name = 'Nome completo é obrigatório';
    if (!formData.role) errors.role = 'Perfil é obrigatório';
    if (!formData.department) errors.department = 'Departamento é obrigatório';

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar senha apenas para novos utilizadores
    if (!user) {
      if (!formData.password) {
        errors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        errors.password = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem';
      }
    } else {
      // Para edição, validar senha apenas se foi preenchida
      if (formData.password) {
        if (formData.password.length < 6) {
          errors.password = 'Senha deve ter pelo menos 6 caracteres';
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'As senhas não coincidem';
        }
      }
    }

    // Validar telefone (formato angolano)
    if (formData.phone) {
      const phoneRegex = /^(\+244)?[9][1-9]\d{7}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        errors.phone = 'Número de telefone inválido';
      }
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
      const payload: any = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        is_active: formData.is_active,
        phone: formData.phone,
        department: formData.department,
        position: formData.position
      };

      // Adicionar senha apenas se foi preenchida
      if (formData.password) {
        payload.password = formData.password;
      }

      if (user) {
        // Atualizar utilizador existente
        await apiService.updateUser(user.id, payload);
      } else {
        // Criar novo utilizador (senha obrigatória)
        payload.password = formData.password;
        await apiService.createUser(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar utilizador');
    } finally {
      setIsLoading(false);
    }
  };

  // Obter cor do role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROOT': return 'text-red-600 bg-red-50';
      case 'GESTAO_DADOS': return 'text-blue-600 bg-blue-50';
      case 'VISUALIZADOR': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Editar Utilizador' : 'Criar Novo Utilizador'}
      subtitle={user ? `Editando: ${user.full_name}` : 'Preencha os dados do novo utilizador'}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      size="md"
    >
      <FormSection title="Informações de Acesso">
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Nome de Utilizador" required error={validationErrors.username}>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="nome.utilizador"
              disabled={!!user} // Não permitir alterar username em edição
            />
          </FormGroup>

          <FormGroup label="Email" required error={validationErrors.email}>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
            />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup 
            label={user ? "Nova Senha (deixe vazio para manter)" : "Senha"} 
            required={!user} 
            error={validationErrors.password}
          >
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </FormGroup>

          <FormGroup 
            label="Confirmar Senha" 
            required={!user || !!formData.password} 
            error={validationErrors.confirmPassword}
          >
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection title="Informações Pessoais">
        <FormGroup label="Nome Completo" required error={validationErrors.full_name}>
          <Input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Nome Completo do Utilizador"
          />
        </FormGroup>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Telefone" error={validationErrors.phone}>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+244 9XX XXX XXX"
            />
          </FormGroup>

          <FormGroup label="Cargo">
            <Input
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Ex: Técnico Superior"
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection title="Permissões">
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Perfil de Acesso" required error={validationErrors.role}>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roles}
            />
          </FormGroup>

          <FormGroup label="Departamento" required error={validationErrors.department}>
            <Select
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={departments}
              placeholder="Selecione o departamento"
            />
          </FormGroup>
        </div>

        {formData.role && (
          <div className="mt-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(formData.role)}`}>
              Perfil: {roles.find(r => r.value === formData.role)?.label}
            </span>
          </div>
        )}

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Utilizador activo (pode fazer login no sistema)
            </span>
          </label>
        </div>
      </FormSection>

      {formData.role && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Permissões do Perfil</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            {formData.role === 'ROOT' && (
              <>
                <li>• Acesso total ao sistema</li>
                <li>• Gestão de utilizadores</li>
                <li>• Exportação de dados</li>
                <li>• Configurações do sistema</li>
              </>
            )}
            {formData.role === 'GESTAO_DADOS' && (
              <>
                <li>• Criar e editar projectos</li>
                <li>• Gestão de indicadores</li>
                <li>• Gestão de licenciamentos</li>
                <li>• Visualizar relatórios</li>
              </>
            )}
            {formData.role === 'VISUALIZADOR' && (
              <>
                <li>• Visualizar projectos</li>
                <li>• Visualizar indicadores</li>
                <li>• Visualizar dashboard</li>
                <li>• Acesso apenas de leitura</li>
              </>
            )}
          </ul>
        </div>
      )}
    </FormModal>
  );
};
