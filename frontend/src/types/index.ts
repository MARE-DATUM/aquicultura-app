// Enums
export const UserRole = {
  ROOT: 'ROOT',
  GESTAO_DADOS: 'GESTAO_DADOS',
  VISUALIZACAO: 'VISUALIZACAO'
} as const;

export const TipoProjeto = {
  COMUNITARIO: 'COMUNITARIO',
  EMPRESARIAL: 'EMPRESARIAL'
} as const;

export const FonteFinanciamento = {
  AFAP_2: 'AFAP-2',
  FADEPA: 'FADEPA',
  FACRA: 'FACRA',
  PRIVADO: 'PRIVADO'
} as const;

export const EstadoProjeto = {
  PLANEADO: 'PLANEADO',
  EM_EXECUCAO: 'EM_EXECUCAO',
  CONCLUIDO: 'CONCLUIDO',
  SUSPENSO: 'SUSPENSO'
} as const;

export const Trimestre = {
  T1: 'T1',
  T2: 'T2',
  T3: 'T3',
  T4: 'T4'
} as const;

export const Periodo5W2H = {
  PERIODO_0_6: '0-6',
  PERIODO_7_12: '7-12',
  PERIODO_13_18: '13-18'
} as const;

export const StatusLicenciamento = {
  PENDENTE: 'PENDENTE',
  EM_ANALISE: 'EM_ANALISE',
  APROVADO: 'APROVADO',
  NEGADO: 'NEGADO'
} as const;

export const EntidadeResponsavel = {
  IPA: 'IPA',
  DNA: 'DNA',
  DNRM: 'DNRM'
} as const;

export const AcaoAudit = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
  STATUS_CHANGE: 'STATUS_CHANGE'
} as const;

// Base interfaces
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: typeof UserRole[keyof typeof UserRole];
  is_active: boolean;
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
  tipo: typeof TipoProjeto[keyof typeof TipoProjeto];
  fonte_financiamento: typeof FonteFinanciamento[keyof typeof FonteFinanciamento];
  estado: typeof EstadoProjeto[keyof typeof EstadoProjeto];
  responsavel: string;
  orcamento_previsto_kz: number;
  orcamento_executado_kz: number;
  data_inicio_prevista: string;
  data_fim_prevista: string;
  descricao?: string;
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
  periodo_referencia: keyof typeof Trimestre;
  fonte_dados: string;
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
  periodo: keyof typeof Periodo5W2H;
  created_at: string;
  updated_at?: string;
  projeto?: Projeto;
}

export interface Licenciamento {
  id: number;
  projeto_id: number;
  status: keyof typeof StatusLicenciamento;
  entidade_responsavel: keyof typeof EntidadeResponsavel;
  data_submissao: string;
  data_decisao?: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
  projeto?: Projeto;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  papel?: string;
  acao: keyof typeof AcaoAudit;
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
  total_projetos: number;
  total_indicadores: number;
  total_licenciamentos: number;
  execucao_media_percentual: number;
  projetos_por_estado: Record<string, number>;
  projetos_por_fonte: Record<string, number>;
  indicadores_por_trimestre: Record<string, number>;
  licenciamentos_por_status: Record<string, number>;
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
  tipo: keyof typeof TipoProjeto;
  fonte_financiamento: keyof typeof FonteFinanciamento;
  estado: keyof typeof EstadoProjeto;
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
  periodo_referencia: keyof typeof Trimestre;
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
  periodo: keyof typeof Periodo5W2H;
}

export interface LicenciamentoCreate {
  projeto_id: number;
  status: keyof typeof StatusLicenciamento;
  entidade_responsavel: keyof typeof EntidadeResponsavel;
  data_submissao: string;
  data_decisao?: string;
  observacoes?: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Filter interfaces
export interface ProjetoFilters {
  provincia_id?: number;
  tipo?: keyof typeof TipoProjeto;
  fonte_financiamento?: keyof typeof FonteFinanciamento;
  estado?: keyof typeof EstadoProjeto;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IndicadorFilters {
  projeto_id?: number;
  periodo_referencia?: keyof typeof Trimestre;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LicenciamentoFilters {
  projeto_id?: number;
  status?: keyof typeof StatusLicenciamento;
  entidade_responsavel?: keyof typeof EntidadeResponsavel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogFilters {
  user_id?: number;
  acao?: keyof typeof AcaoAudit;
  entidade?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}
