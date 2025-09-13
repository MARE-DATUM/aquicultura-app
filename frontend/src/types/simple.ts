// Tipos simplificados para resolver problemas de compilação
export type UserRole = 'ROOT' | 'GESTAO_DADOS' | 'VISUALIZACAO';
export type TipoProjeto = 'COMUNITARIO' | 'EMPRESARIAL';
export type FonteFinanciamento = 'AFAP-2' | 'FADEPA' | 'FACRA' | 'PRIVADO';
export type EstadoProjeto = 'PLANEADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'SUSPENSO';
export type Trimestre = 'T1' | 'T2' | 'T3' | 'T4';
export type Periodo5W2H = '0-6' | '7-12' | '13-18';
export type StatusLicenciamento = 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'NEGADO';
export type EntidadeResponsavel = 'IPA' | 'DNA' | 'DNRM';
export type AcaoAudit = 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT' | 'STATUS_CHANGE';

// Interfaces básicas
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  phone?: string;
  department?: string;
  position?: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export interface Provincia {
  id: number;
  nome: string;
  created_at: string;
  updated_at?: string;
}

export interface Projeto {
  id: number;
  nome: string;
  provincia_id: number;
  tipo: TipoProjeto;
  fonte_financiamento: FonteFinanciamento;
  estado: EstadoProjeto;
  responsavel: string;
  orcamento_previsto_kz: number;
  orcamento_executado_kz: number;
  orcamento_total?: number;
  orcamento_executado?: number;
  data_inicio_prevista: string;
  data_fim_prevista: string;
  data_inicio?: string;
  data_fim?: string;
  descricao?: string;
  objectivos?: string;
  beneficiarios?: string;
  coordenador?: string;
  contacto_coordenador?: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
  provincia?: Provincia;
}

export interface Indicador {
  id: number;
  projeto_id: number;
  nome: string;
  unidade: string;
  meta: number;
  valor_actual: number;
  periodo_referencia: Trimestre;
  ano_referencia?: number;
  fonte_dados: string;
  metodologia_calculo?: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
  projeto?: Projeto;
}

export interface Eixo5W2H {
  id: number;
  projeto_id: number;
  what: string;
  why: string;
  where: string;
  when: string;
  who: string;
  how: string;
  how_much_kz: number;
  marcos?: Array<{
    nome: string;
    data: string;
    status: string;
  }>;
  periodo: Periodo5W2H;
  created_at: string;
  updated_at?: string;
  projeto?: Projeto;
}

export interface Licenciamento {
  id: number;
  projeto_id: number;
  tipo_licenca?: string;
  numero_licenca?: string;
  status: StatusLicenciamento;
  entidade_responsavel: EntidadeResponsavel;
  data_submissao: string;
  data_decisao?: string;
  data_aprovacao?: string;
  data_validade?: string;
  condicoes?: string;
  documentos_necessarios?: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
  projeto?: Projeto;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  papel?: string;
  acao: AcaoAudit;
  entidade?: string;
  entidade_id?: number;
  ip?: string;
  timestamp: string;
  detalhes?: string;
  user?: User;
}

// Auth interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Dashboard interfaces
export interface DashboardStats {
  projetos: {
    total_projetos: number;
    total_indicadores: number;
    total_licenciamentos: number;
    execucao_media_percentual: number;
    projetos_por_estado: Record<string, number>;
    projetos_por_fonte: Record<string, number>;
    indicadores_por_trimestre: Record<string, number>;
    licenciamentos_por_status: Record<string, number>;
  };
  indicadores: {
    total_indicadores: number;
    por_trimestre: Record<string, number>;
    execucao_media_percentual: number;
    indicadores_por_projeto: number;
  };
  licenciamentos: {
    total_licenciamentos: number;
    por_status: Record<string, number>;
    por_entidade: Record<string, number>;
    tempo_medio_processamento_dias: number;
    taxa_aprovacao: number;
  };
  mapa: MapaProvincia[];
  auditoria?: any;
  resumo: {
    total_projetos: number;
    projetos_ativos: number;
    total_provincias_cobertas: number;
    total_indicadores: number;
    licencas_aprovadas: number;
    licencas_pendentes: number;
  };
  kpis_18_meses: {
    producao_total_toneladas: number;
    familias_beneficiadas: number;
    empregos_criados: number;
    execucao_orcamental_percentual: number;
    licencas_fast_track: number;
  };
  distribuicao_fontes: Record<string, number>;
  distribuicao_tipos: Record<string, number>;
  distribuicao_estados: Record<string, number>;
  evolucao_trimestral: Record<string, number>;
  meta_data: {
    ultima_atualizacao: string;
    periodo_referencia: string;
    total_provincias: number;
    user_role: string;
  };
}

export interface MapaProvincia {
  id: number;
  nome: string;
  total_projetos: number;
  estatisticas: {
    planeado: number;
    em_execucao: number;
    concluido: number;
    suspenso: number;
  };
  orcamento_total_kz: number;
  orcamento_executado_kz: number;
  execucao_percentual: number;
  cor: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
}

// Form interfaces
export interface ProjetoCreate {
  nome: string;
  provincia_id: number;
  tipo: TipoProjeto;
  fonte_financiamento: FonteFinanciamento;
  estado: EstadoProjeto;
  responsavel: string;
  orcamento_previsto_kz: number;
  orcamento_executado_kz?: number;
  data_inicio_prevista: string;
  data_fim_prevista: string;
  descricao?: string;
}

export interface IndicadorCreate {
  projeto_id: number;
  nome: string;
  unidade: string;
  meta: number;
  valor_actual?: number;
  periodo_referencia: Trimestre;
  fonte_dados: string;
}

export interface Eixo5W2HCreate {
  projeto_id: number;
  what: string;
  why: string;
  where: string;
  when: string;
  who: string;
  how: string;
  how_much_kz: number;
  marcos?: Array<{
    nome: string;
    data: string;
    status: string;
  }>;
  periodo: Periodo5W2H;
}

export interface LicenciamentoCreate {
  projeto_id: number;
  status: StatusLicenciamento;
  entidade_responsavel: EntidadeResponsavel;
  data_submissao: string;
  data_decisao?: string;
  observacoes?: string;
}

// Filter interfaces
export interface ProjetoFilters {
  provincia_id?: number;
  tipo?: TipoProjeto;
  fonte_financiamento?: FonteFinanciamento;
  estado?: EstadoProjeto;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IndicadorFilters {
  projeto_id?: number;
  periodo_referencia?: Trimestre;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LicenciamentoFilters {
  projeto_id?: number;
  status?: StatusLicenciamento;
  entidade_responsavel?: EntidadeResponsavel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogFilters {
  user_id?: number;
  acao?: AcaoAudit;
  entidade?: string;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
  page?: number;
  limit?: number;
}
