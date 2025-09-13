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
import type { Projeto, Provincia, TipoProjeto, FonteFinanciamento, EstadoProjeto } from '../../types/simple';

interface ProjetoFormProps {
  isOpen: boolean;
  onClose: () => void;
  projeto?: Projeto | null;
  onSuccess: () => void;
  provincias: Provincia[];
}

export const ProjetoForm: React.FC<ProjetoFormProps> = ({
  isOpen,
  onClose,
  projeto,
  onSuccess,
  provincias
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    provincia_id: '',
    tipo: 'AQUICULTURA',
    fonte_financiamento: 'OGE',
    orcamento_total: '',
    orcamento_executado: '',
    estado: 'PLANEAMENTO',
    objectivos: '',
    beneficiarios: '',
    coordenador: '',
    contacto_coordenador: '',
    data_inicio: '',
    data_fim: '',
    observacoes: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Tipos de projeto
  const tiposProjeto = [
    { value: 'AQUICULTURA', label: 'Aquicultura' },
    { value: 'PESCA', label: 'Pesca' },
    { value: 'INDUSTRIA', label: 'Indústria' },
    { value: 'COMERCIALIZACAO', label: 'Comercialização' },
    { value: 'FORMACAO', label: 'Formação' },
    { value: 'INVESTIGACAO', label: 'Investigação' },
    { value: 'INFRAESTRUTURA', label: 'Infraestrutura' }
  ];

  // Fontes de financiamento
  const fontesFinanciamento = [
    { value: 'OGE', label: 'OGE - Orçamento Geral do Estado' },
    { value: 'DONOR', label: 'Doador' },
    { value: 'PPP', label: 'PPP - Parceria Público-Privada' },
    { value: 'PRIVADO', label: 'Privado' },
    { value: 'MISTO', label: 'Misto' }
  ];

  // Estados do projeto
  const estadosProjeto = [
    { value: 'PLANEAMENTO', label: 'Planeamento' },
    { value: 'EM_CURSO', label: 'Em Curso' },
    { value: 'SUSPENSO', label: 'Suspenso' },
    { value: 'CONCLUIDO', label: 'Concluído' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  useEffect(() => {
    if (projeto) {
      setFormData({
        nome: projeto.nome || '',
        descricao: projeto.descricao || '',
        provincia_id: String(projeto.provincia_id || ''),
        tipo: projeto.tipo || 'AQUICULTURA',
        fonte_financiamento: projeto.fonte_financiamento || 'OGE',
        orcamento_total: String(projeto.orcamento_total || ''),
        orcamento_executado: String(projeto.orcamento_executado || ''),
        estado: projeto.estado || 'PLANEAMENTO',
        objectivos: projeto.objectivos || '',
        beneficiarios: projeto.beneficiarios || '',
        coordenador: projeto.coordenador || '',
        contacto_coordenador: projeto.contacto_coordenador || '',
        data_inicio: projeto.data_inicio || '',
        data_fim: projeto.data_fim || '',
        observacoes: projeto.observacoes || ''
      });
    } else {
      // Reset form para novo projeto
      setFormData({
        nome: '',
        descricao: '',
        provincia_id: '',
        tipo: 'AQUICULTURA',
        fonte_financiamento: 'OGE',
        orcamento_total: '',
        orcamento_executado: '',
        estado: 'PLANEAMENTO',
        objectivos: '',
        beneficiarios: '',
        coordenador: '',
        contacto_coordenador: '',
        data_inicio: '',
        data_fim: '',
        observacoes: ''
      });
    }
    setValidationErrors({});
    setError(null);
  }, [projeto]);

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

    if (!formData.nome) errors.nome = 'Nome é obrigatório';
    if (!formData.descricao) errors.descricao = 'Descrição é obrigatória';
    if (!formData.provincia_id) errors.provincia_id = 'Província é obrigatória';
    if (!formData.orcamento_total) errors.orcamento_total = 'Orçamento total é obrigatório';
    if (!formData.data_inicio) errors.data_inicio = 'Data de início é obrigatória';
    if (!formData.data_fim) errors.data_fim = 'Data de fim é obrigatória';
    if (!formData.coordenador) errors.coordenador = 'Coordenador é obrigatório';
    if (!formData.contacto_coordenador) errors.contacto_coordenador = 'Contacto é obrigatório';

    // Validar que orçamento executado não seja maior que o total
    if (formData.orcamento_executado && formData.orcamento_total) {
      if (parseFloat(formData.orcamento_executado) > parseFloat(formData.orcamento_total)) {
        errors.orcamento_executado = 'Orçamento executado não pode ser maior que o total';
      }
    }

    // Validar datas
    if (formData.data_inicio && formData.data_fim) {
      if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
        errors.data_fim = 'Data de fim deve ser posterior à data de início';
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
        ...formData,
        provincia_id: parseInt(formData.provincia_id),
        orcamento_total: parseFloat(formData.orcamento_total),
        orcamento_previsto_kz: parseFloat(formData.orcamento_total),
        orcamento_executado: formData.orcamento_executado ? parseFloat(formData.orcamento_executado) : 0,
        orcamento_executado_kz: formData.orcamento_executado ? parseFloat(formData.orcamento_executado) : 0,
        tipo: formData.tipo as TipoProjeto,
        fonte_financiamento: formData.fonte_financiamento as FonteFinanciamento,
        estado: formData.estado as EstadoProjeto,
        responsavel: formData.coordenador || 'DNA',
        data_inicio_prevista: formData.data_inicio,
        data_fim_prevista: formData.data_fim
      };

      if (projeto) {
        // Atualizar projeto existente
        await apiService.updateProjeto(projeto.id, payload);
      } else {
        // Criar novo projeto
        await apiService.createProjeto(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar projeto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={projeto ? 'Editar Projeto' : 'Criar Novo Projeto'}
      subtitle={projeto ? `Editando: ${projeto.nome}` : 'Preencha os dados do novo projeto'}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      size="lg"
    >
      <FormSection title="Informações Básicas">
        <FormGroup label="Nome do Projeto" required error={validationErrors.nome}>
          <Input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite o nome do projeto"
          />
        </FormGroup>

        <FormGroup label="Descrição" required error={validationErrors.descricao}>
          <TextArea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descreva o projeto"
            rows={3}
          />
        </FormGroup>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Província" required error={validationErrors.provincia_id}>
            <Select
              name="provincia_id"
              value={formData.provincia_id}
              onChange={handleChange}
              options={provincias.map(p => ({ value: p.id, label: p.nome }))}
              placeholder="Selecione a província"
            />
          </FormGroup>

          <FormGroup label="Tipo de Projeto" required>
            <Select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              options={tiposProjeto}
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection title="Financiamento">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Fonte de Financiamento" required>
            <Select
              name="fonte_financiamento"
              value={formData.fonte_financiamento}
              onChange={handleChange}
              options={fontesFinanciamento}
            />
          </FormGroup>

          <FormGroup label="Estado do Projeto" required>
            <Select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              options={estadosProjeto}
            />
          </FormGroup>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Orçamento Total" required error={validationErrors.orcamento_total}>
            <Input
              type="number"
              name="orcamento_total"
              value={formData.orcamento_total}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </FormGroup>

          <FormGroup label="Orçamento Executado" error={validationErrors.orcamento_executado}>
            <Input
              type="number"
              name="orcamento_executado"
              value={formData.orcamento_executado}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection title="Cronograma">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Data de Início" required error={validationErrors.data_inicio}>
            <Input
              type="date"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup label="Data de Fim" required error={validationErrors.data_fim}>
            <Input
              type="date"
              name="data_fim"
              value={formData.data_fim}
              onChange={handleChange}
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection title="Coordenação">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Coordenador" required error={validationErrors.coordenador}>
            <Input
              name="coordenador"
              value={formData.coordenador}
              onChange={handleChange}
              placeholder="Nome do coordenador"
            />
          </FormGroup>

          <FormGroup label="Contacto" required error={validationErrors.contacto_coordenador}>
            <Input
              name="contacto_coordenador"
              value={formData.contacto_coordenador}
              onChange={handleChange}
              placeholder="Telefone ou email"
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection title="Informações Adicionais">
        <FormGroup label="Objectivos">
          <TextArea
            name="objectivos"
            value={formData.objectivos}
            onChange={handleChange}
            placeholder="Descreva os objectivos do projeto"
            rows={3}
          />
        </FormGroup>

        <FormGroup label="Beneficiários">
          <TextArea
            name="beneficiarios"
            value={formData.beneficiarios}
            onChange={handleChange}
            placeholder="Descreva os beneficiários do projeto"
            rows={2}
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
