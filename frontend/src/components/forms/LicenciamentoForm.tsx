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
import type { Licenciamento, Projeto, StatusLicenciamento, EntidadeResponsavel } from '../../types/simple';

interface LicenciamentoFormProps {
  isOpen: boolean;
  onClose: () => void;
  licenciamento?: Licenciamento | null;
  onSuccess: () => void;
  projetos: Projeto[];
}

export const LicenciamentoForm: React.FC<LicenciamentoFormProps> = ({
  isOpen,
  onClose,
  licenciamento,
  onSuccess,
  projetos
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projeto_id: '',
    tipo_licenca: '',
    numero_licenca: '',
    entidade_responsavel: 'DNA',
    status: 'PENDENTE',
    data_submissao: '',
    data_aprovacao: '',
    data_validade: '',
    condicoes: '',
    documentos_necessarios: '',
    observacoes: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Tipos de licença
  const tiposLicenca = [
    { value: 'AMBIENTAL', label: 'Licença Ambiental' },
    { value: 'OPERACIONAL', label: 'Licença Operacional' },
    { value: 'CONSTRUCAO', label: 'Licença de Construção' },
    { value: 'COMERCIAL', label: 'Licença Comercial' },
    { value: 'SANITARIA', label: 'Licença Sanitária' },
    { value: 'IMPORTACAO', label: 'Licença de Importação' },
    { value: 'EXPORTACAO', label: 'Licença de Exportação' }
  ];

  // Entidades responsáveis
  const entidadesResponsaveis = [
    { value: 'DNA', label: 'DNA - Direcção Nacional de Aquicultura' },
    { value: 'MINAMB', label: 'MINAMB - Ministério do Ambiente' },
    { value: 'MINAGRI', label: 'MINAGRI - Ministério da Agricultura' },
    { value: 'PROVINCIAL', label: 'Governo Provincial' },
    { value: 'MUNICIPAL', label: 'Administração Municipal' },
    { value: 'OUTRO', label: 'Outra Entidade' }
  ];

  // Status da licença
  const statusLicenca = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EM_ANALISE', label: 'Em Análise' },
    { value: 'APROVADO', label: 'Aprovado' },
    { value: 'REJEITADO', label: 'Rejeitado' },
    { value: 'EXPIRADO', label: 'Expirado' },
    { value: 'RENOVACAO', label: 'Em Renovação' },
    { value: 'SUSPENSO', label: 'Suspenso' }
  ];

  useEffect(() => {
    if (licenciamento) {
      setFormData({
        projeto_id: String(licenciamento.projeto_id || ''),
        tipo_licenca: licenciamento.tipo_licenca || '',
        numero_licenca: licenciamento.numero_licenca || '',
        entidade_responsavel: licenciamento.entidade_responsavel || 'DNA',
        status: licenciamento.status || 'PENDENTE',
        data_submissao: licenciamento.data_submissao || '',
        data_aprovacao: licenciamento.data_aprovacao || '',
        data_validade: licenciamento.data_validade || '',
        condicoes: licenciamento.condicoes || '',
        documentos_necessarios: licenciamento.documentos_necessarios || '',
        observacoes: licenciamento.observacoes || ''
      });
    } else {
      // Reset form para novo licenciamento
      setFormData({
        projeto_id: '',
        tipo_licenca: '',
        numero_licenca: '',
        entidade_responsavel: 'DNA',
        status: 'PENDENTE',
        data_submissao: '',
        data_aprovacao: '',
        data_validade: '',
        condicoes: '',
        documentos_necessarios: '',
        observacoes: ''
      });
    }
    setValidationErrors({});
    setError(null);
  }, [licenciamento]);

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
    if (!formData.tipo_licenca) errors.tipo_licenca = 'Tipo de licença é obrigatório';
    if (!formData.numero_licenca) errors.numero_licenca = 'Número da licença é obrigatório';
    if (!formData.entidade_responsavel) errors.entidade_responsavel = 'Entidade responsável é obrigatória';
    if (!formData.data_submissao) errors.data_submissao = 'Data de submissão é obrigatória';

    // Validar datas
    if (formData.data_aprovacao && formData.data_submissao) {
      if (new Date(formData.data_aprovacao) < new Date(formData.data_submissao)) {
        errors.data_aprovacao = 'Data de aprovação deve ser posterior à data de submissão';
      }
    }

    if (formData.data_validade && formData.data_aprovacao) {
      if (new Date(formData.data_validade) < new Date(formData.data_aprovacao)) {
        errors.data_validade = 'Data de validade deve ser posterior à data de aprovação';
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
      const payload = {
        ...formData,
        projeto_id: parseInt(formData.projeto_id),
        status: formData.status as StatusLicenciamento,
        entidade_responsavel: formData.entidade_responsavel as EntidadeResponsavel
      };

      if (licenciamento) {
        // Atualizar licenciamento existente
        await apiService.updateLicenciamento(licenciamento.id, payload);
      } else {
        // Criar novo licenciamento
        await apiService.createLicenciamento(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar licenciamento');
    } finally {
      setIsLoading(false);
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'text-green-600 bg-green-50';
      case 'REJEITADO': return 'text-red-600 bg-red-50';
      case 'PENDENTE': return 'text-yellow-600 bg-yellow-50';
      case 'EM_ANALISE': return 'text-blue-600 bg-blue-50';
      case 'EXPIRADO': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={licenciamento ? 'Editar Licenciamento' : 'Criar Novo Licenciamento'}
      subtitle={licenciamento ? `Editando: ${licenciamento.numero_licenca}` : 'Preencha os dados do novo licenciamento'}
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

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Tipo de Licença" required error={validationErrors.tipo_licenca}>
            <Select
              name="tipo_licenca"
              value={formData.tipo_licenca}
              onChange={handleChange}
              options={tiposLicenca}
              placeholder="Selecione o tipo"
            />
          </FormGroup>

          <FormGroup label="Número da Licença" required error={validationErrors.numero_licenca}>
            <Input
              name="numero_licenca"
              value={formData.numero_licenca}
              onChange={handleChange}
              placeholder="Ex: LIC/2024/001"
            />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Entidade Responsável" required error={validationErrors.entidade_responsavel}>
            <Select
              name="entidade_responsavel"
              value={formData.entidade_responsavel}
              onChange={handleChange}
              options={entidadesResponsaveis}
            />
          </FormGroup>

          <FormGroup label="Status" required>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusLicenca}
            />
          </FormGroup>
        </div>

        {formData.status && (
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status)}`}>
            Status actual: {statusLicenca.find(s => s.value === formData.status)?.label}
          </div>
        )}
      </FormSection>

      <FormSection title="Datas">
        <div className="grid grid-cols-3 gap-4">
          <FormGroup label="Data de Submissão" required error={validationErrors.data_submissao}>
            <Input
              type="date"
              name="data_submissao"
              value={formData.data_submissao}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup label="Data de Aprovação" error={validationErrors.data_aprovacao}>
            <Input
              type="date"
              name="data_aprovacao"
              value={formData.data_aprovacao}
              onChange={handleChange}
              disabled={formData.status !== 'APROVADO'}
            />
          </FormGroup>

          <FormGroup label="Data de Validade" error={validationErrors.data_validade}>
            <Input
              type="date"
              name="data_validade"
              value={formData.data_validade}
              onChange={handleChange}
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection title="Informações Adicionais">
        <FormGroup label="Condições da Licença">
          <TextArea
            name="condicoes"
            value={formData.condicoes}
            onChange={handleChange}
            placeholder="Descreva as condições impostas pela licença"
            rows={3}
          />
        </FormGroup>

        <FormGroup label="Documentos Necessários">
          <TextArea
            name="documentos_necessarios"
            value={formData.documentos_necessarios}
            onChange={handleChange}
            placeholder="Liste os documentos necessários ou apresentados"
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
